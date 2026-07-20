import { supabase } from '../config/supabaseClient';

export async function sendFriendRequest(requesterId, addresseeId) {
  console.log('sendFriendRequest called:', { requesterId, addresseeId });
  if (requesterId === addresseeId) throw new Error('Cannot send friend request to yourself');

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending',
    })
    .select('id, requester_id, addressee_id, status, created_at')
    .single();

  console.log('sendFriendRequest result:', { data, error });
  if (error) throw error;
  return data;
}

export function subscribeToFriendRequests(userId, onRequest) {
  const channel = supabase
    .channel(`friend-requests-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'friendships',
        filter: `addressee_id=eq.${userId}`,
      },
      payload => {
        if (payload.new?.status === 'pending') onRequest(payload.new);
      },
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function respondToFriendRequest(friendshipId, status, currentUserId) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .eq('addressee_id', currentUserId)
    .select('id, requester_id, addressee_id, status, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchFriendRequests(userId) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id, status, created_at, updated_at,
      requester:profiles!friendships_requester_id_fkey(id, name, profile_photo_url)
    `)
    .eq('addressee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(f => {
    const name = f.requester?.name || 'Unknown';
    let photo = f.requester?.profile_photo_url || null;
    if (photo && photo.includes('name=User')) {
      photo = photo.replace('name=User', `name=${encodeURIComponent(name)}`);
    }
    return {
      ...f,
      requesterName: name,
      requesterAvatar: photo,
    };
  });
}

export async function fetchFriends(userId) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id, status, created_at,
      requester:profiles!friendships_requester_id_fkey(id, name, profile_photo_url),
      addressee:profiles!friendships_addressee_id_fkey(id, name, profile_photo_url)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(f => {
    const friend = f.requester_id === userId ? f.addressee : f.requester;
    const name = friend?.name || 'Unknown';
    let photo = friend?.profile_photo_url || null;
    if (photo && photo.includes('name=User')) {
      photo = photo.replace('name=User', `name=${encodeURIComponent(name)}`);
    }
    return {
      friendshipId: f.id,
      id: friend?.id,
      name,
      avatarUrl: photo,
      since: f.created_at,
    };
  });
}

export async function fetchSentRequests(userId) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id, status, created_at, updated_at,
      addressee:profiles!friendships_addressee_id_fkey(id, name, profile_photo_url)
    `)
    .eq('requester_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(f => {
    const name = f.addressee?.name || 'Unknown';
    let photo = f.addressee?.profile_photo_url || null;
    if (photo && photo.includes('name=User')) {
      photo = photo.replace('name=User', `name=${encodeURIComponent(name)}`);
    }
    return {
      ...f,
      addresseeName: name,
      addresseeAvatar: photo,
    };
  });
}

export async function deleteFriendRequest(friendshipId, currentUserId) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

  if (error) throw error;
}

export const cancelSentRequest = deleteFriendRequest;
export const unfriend = deleteFriendRequest;

export async function checkFriendship(userId1, userId2) {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, status')
    .or(
      `and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`
    )
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function searchUsers(query, currentUserId) {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim();
  console.log('searchUsers:', { q, currentUserId });

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, profile_photo_url')
    .ilike('name', `%${q}%`)
    .neq('id', currentUserId)
    .limit(20);

  console.log('searchUsers result:', { data, error, count: data?.length });
  if (error) throw error;
  return data || [];
}

export async function fetchFriendsPageSuggestions(currentUserId) {
  // Get current user's friend IDs
  const { data: friendships, error: fError } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

  if (fError) throw fError;

  const friendIds = new Set();
  friendIds.add(currentUserId);
  (friendships || []).forEach(f => {
    friendIds.add(f.requester_id);
    friendIds.add(f.addressee_id);
  });

  // Get pending request user IDs (both sent and received)
  const { data: pending } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
    .eq('status', 'pending');

  (pending || []).forEach(f => {
    friendIds.add(f.requester_id);
    friendIds.add(f.addressee_id);
  });

  const excludeIds = [...friendIds];

  // Fetch some users not in friends/pending
  let query = supabase
    .from('profiles')
    .select('id, name, profile_photo_url')
    .neq('id', currentUserId)
    .limit(20);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data: users, error: uError } = await query;
  if (uError) throw uError;

  return users || [];
}

export async function fetchUpcomingBirthdays(userId) {
  // Get friend IDs
  const { data: friendships, error: fError } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (fError) throw fError;
  if (!friendships || friendships.length === 0) return [];

  const friendIds = friendships.map(f =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );

  // Fetch friends with date_of_birth
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, name, profile_photo_url, date_of_birth')
    .in('id', friendIds)
    .not('date_of_birth', 'is', null);

  if (pError) throw pError;
  if (!profiles || profiles.length === 0) return [];

  // Calculate upcoming birthdays (next 30 days)
  const today = new Date();
  const todayMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const withBirthday = profiles.map(p => {
    const dob = new Date(p.date_of_birth);
    const bdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

    // If birthday already passed this year, use next year
    if (bdayThisYear < today) {
      bdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffMs = bdayThisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      id: p.id,
      name: p.name,
      avatarUrl: p.profile_photo_url,
      dateOfBirth: p.date_of_birth,
      daysUntil: diffDays,
      date: bdayThisYear,
    };
  });

  // Filter: today, tomorrow, or within next 30 days
  const upcoming = withBirthday
    .filter(b => b.daysUntil >= 0 && b.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return upcoming;
}
