import { supabase } from '../config/supabaseClient';

export async function sendFriendRequest(requesterId, addresseeId) {
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

  if (error) throw error;
  return data;
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

  return data.map(f => ({
    ...f,
    requesterName: f.requester?.name || 'Unknown',
    requesterAvatar: f.requester?.profile_photo_url || null,
  }));
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
    return {
      friendshipId: f.id,
      id: friend?.id,
      name: friend?.name || 'Unknown',
      avatarUrl: friend?.profile_photo_url || null,
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

  return data.map(f => ({
    ...f,
    addresseeName: f.addressee?.name || 'Unknown',
    addresseeAvatar: f.addressee?.profile_photo_url || null,
  }));
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
