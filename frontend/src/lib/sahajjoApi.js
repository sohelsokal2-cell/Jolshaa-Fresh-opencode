import { supabase } from '../config/supabaseClient';

// ─── Create Help Request ───
export async function createHelpRequest({
  requesterId,
  category,
  urgency,
  title,
  description,
  imageFile,
  district,
  upazila,
  deadline,
}) {
  let imageUrl = null;

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const filePath = `help-requests/${requesterId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('help-request-images')
      .upload(filePath, imageFile, { contentType: imageFile.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('help-request-images').getPublicUrl(filePath);
    imageUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('help_requests')
    .insert({
      requester_id: requesterId,
      category,
      urgency,
      title,
      description,
      image_url: imageUrl,
      location_district: district,
      location_upazila: upazila || null,
      deadline: deadline || null,
      status: 'open',
    })
    .select(`
      *,
      requester:profiles!help_requests_requester_id_fkey(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

// ─── Fetch Help Requests (with filters) ───
export async function fetchHelpRequests({ category, sortBy, status = 'open' } = {}) {
  let query = supabase
    .from('help_requests')
    .select(`
      *,
      requester:profiles!help_requests_requester_id_fkey(id, name, profile_photo_url)
    `)
    .eq('status', status);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    // Default: sort by urgency (high first) then by newest
    query = query.order('urgency', { ascending: true })
               .order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─── Fetch Single Help Request Detail ───
export async function fetchHelpRequestDetail(requestId) {
  const { data, error } = await supabase
    .from('help_requests')
    .select(`
      *,
      requester:profiles!help_requests_requester_id_fkey(id, name, profile_photo_url)
    `)
    .eq('id', requestId)
    .single();

  if (error) throw error;
  return data;
}

// ─── Fetch a single request by ID (for realtime) ───
export async function fetchHelpRequestById(requestId) {
  const { data, error } = await supabase
    .from('help_requests')
    .select(`
      *,
      requester:profiles!help_requests_requester_id_fkey(id, name, profile_photo_url)
    `)
    .eq('id', requestId)
    .single();

  if (error) throw error;
  return data;
}

// ─── Offer Help ───
export async function offerHelp(requestId, helperId, message = '') {
  const { data, error } = await supabase
    .from('help_offers')
    .insert({
      request_id: requestId,
      helper_id: helperId,
      message: message || null,
      status: 'offered',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Fetch Help Offers for a Request ───
export async function fetchHelpOffers(requestId) {
  const { data, error } = await supabase
    .from('help_offers')
    .select(`
      *,
      helper:profiles!help_offers_helper_id_fkey(id, name, profile_photo_url)
    `)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// ─── Batch fetch helper counts via RPC (no row exposure) ───
export async function fetchHelperCounts(requestIds) {
  if (!requestIds.length) return {};

  const counts = {};
  // Fire all RPC calls in parallel — each is lightweight (COUNT with SECURITY DEFINER)
  const results = await Promise.all(
    requestIds.map(async (id) => {
      const { data, error } = await supabase.rpc('get_help_offer_count', { req_id: id });
      return { id, count: error ? 0 : (data || 0) };
    })
  );
  results.forEach(({ id, count }) => { counts[id] = count; });
  return counts;
}

// ─── Check if current user already offered help on requests ───
export async function fetchUserOffers(requestIds, userId) {
  if (!requestIds.length || !userId) return {};

  const { data, error } = await supabase
    .from('help_offers')
    .select('request_id')
    .in('request_id', requestIds)
    .eq('helper_id', userId);

  if (error) throw error;

  const offered = {};
  (data || []).forEach((row) => {
    offered[row.request_id] = true;
  });
  return offered;
}

// ─── Accept a Helper Offer ───
export async function acceptHelper(offerId) {
  const { data, error } = await supabase
    .from('help_offers')
    .update({ status: 'accepted' })
    .eq('id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Resolve a Help Request ───
export async function resolveRequest(requestId) {
  const { data, error } = await supabase
    .from('help_requests')
    .update({ status: 'resolved' })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Fetch Live Stats ───
export async function fetchHelpStats() {
  const [resolved, active, helpers, districts] = await Promise.all([
    supabase
      .from('help_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'resolved'),
    supabase
      .from('help_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('help_offers')
      .select('helper_id', { count: 'exact', head: true }),
    supabase
      .from('help_requests')
      .select('location_district')
      .eq('status', 'open'),
  ]);

  if (resolved.error) throw resolved.error;
  if (active.error) throw active.error;
  if (helpers.error) throw helpers.error;
  if (districts.error) throw districts.error;

  const uniqueDistricts = new Set(
    (districts.data || []).map((r) => r.location_district)
  );

  return {
    resolved: resolved.count || 0,
    active: active.count || 0,
    helpers: helpers.count || 0,
    districts: uniqueDistricts.size || 0,
  };
}

// ─── Realtime: Subscribe to new help requests ───
export function subscribeToHelpRequests(onNewRequest) {
  const channel = supabase
    .channel('help-requests-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'help_requests',
      },
      async (payload) => {
        console.log('[Realtime] New help request raw:', payload.new);
        // Fetch full record with profile join
        try {
          const full = await fetchHelpRequestById(payload.new.id);
          onNewRequest(full);
        } catch (err) {
          console.error('[Realtime] Failed to fetch full request:', err);
          onNewRequest(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Help requests channel status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Realtime: Subscribe to new help offers for a specific request ───
export function subscribeToHelpOffers(requestId, onNewOffer) {
  const channel = supabase
    .channel(`help-offers-${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'help_offers',
        filter: `request_id=eq.${requestId}`,
      },
      (payload) => {
        console.log('[Realtime] New help offer:', payload.new);
        onNewOffer(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Help offers channel status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
