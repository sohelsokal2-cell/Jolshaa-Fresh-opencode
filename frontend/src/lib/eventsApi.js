import { supabase } from '../config/supabaseClient';

const EVENTS_PER_PAGE = 12;

const MAX_COVER_SIZE = 10 * 1024 * 1024;

export async function createEvent(hostId, title, description, coverFile, category, locationType, locationText, eventDate) {
  if (coverFile && coverFile.size > MAX_COVER_SIZE) {
    const sizeMB = (coverFile.size / (1024 * 1024)).toFixed(1);
    throw new Error(`কভার ছবি সাইজ ${sizeMB}MB — সর্বোচ্চ 10MB অনুমোদিত।`);
  }

  let coverUrl = null;
  if (coverFile) {
    const ext = coverFile.name.split('.').pop();
    const path = `event-covers/${hostId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-covers')
      .upload(path, coverFile, { contentType: coverFile.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('event-covers')
      .getPublicUrl(path);

    coverUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      host_id: hostId,
      title,
      description,
      cover_image_url: coverUrl,
      category: category || 'community',
      location_type: locationType || 'physical',
      location_text: locationText || null,
      event_date: eventDate,
    })
    .select(`
      *,
      host:profiles(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    hostName: data.host?.name || 'অজানা',
    hostAvatar: data.host?.profile_photo_url || null,
  };
}

export async function fetchEvents(filter = 'discover', userId = null, page = 0) {
  const from = page * EVENTS_PER_PAGE;
  const to = from + EVENTS_PER_PAGE - 1;

  let query = supabase
    .from('events')
    .select(`
      *,
      host:profiles(id, name, profile_photo_url)
    `)
    .order('event_date', { ascending: true })
    .range(from, to);

  if (filter === 'hosting' && userId) {
    query = query.eq('host_id', userId);
  } else if (filter === 'yours' && userId) {
    // Events where user RSVP'd 'going' or 'interested'
    const { data: rsvpEvents } = await supabase
      .from('event_rsvps')
      .select('event_id')
      .eq('user_id', userId)
      .in('status', ['going', 'interested']);

    const eventIds = (rsvpEvents || []).map(r => r.event_id);
    if (eventIds.length === 0) return [];
    query = query.in('id', eventIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Enrich each event with RSVP counts
  const enriched = await Promise.all(
    data.map(async (event) => {
      const counts = await getRsvpCounts(event.id);
      return {
        ...event,
        hostName: event.host?.name || 'অজানা',
        hostAvatar: event.host?.profile_photo_url || null,
        goingCount: counts.going_count,
        interestedCount: counts.interested_count,
      };
    })
  );

  return enriched;
}

export async function setRsvp(eventId, userId, status) {
  const { data: existing } = await supabase
    .from('event_rsvps')
    .select('id, status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.status === status) {
      // Toggle off — remove RSVP
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return null;
    }

    const { error } = await supabase
      .from('event_rsvps')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
    return status;
  }

  const { error } = await supabase
    .from('event_rsvps')
    .insert({
      event_id: eventId,
      user_id: userId,
      status,
    });
  if (error) throw error;
  return status;
}

export async function getRsvpCounts(eventId) {
  const { data, error } = await supabase
    .rpc('get_event_rsvp_counts', { p_event_id: eventId });

  if (error) throw error;

  return {
    going_count: Number(data?.[0]?.going_count || 0),
    interested_count: Number(data?.[0]?.interested_count || 0),
  };
}

export async function getMyRsvp(eventId, userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.status || null;
}

export async function getEventGuestAvatars(eventId, limit = 5) {
  const { data, error } = await supabase
    .rpc('get_event_guest_avatars', { p_event_id: eventId, p_limit: limit });

  if (error) throw error;

  return (data || []).map(g => ({
    name: g.user_name,
    profilePhotoUrl: g.profile_photo_url,
  }));
}
