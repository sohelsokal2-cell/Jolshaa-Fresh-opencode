import { supabase } from '../config/supabaseClient';

// ─── Fetch a user profile by ID ───
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (data && data.profile_photo_url && data.profile_photo_url.includes('name=User')) {
    data.profile_photo_url = data.profile_photo_url.replace('name=User', `name=${encodeURIComponent(data.name || 'User')}`);
  }
  return data;
}

// ─── Update own profile fields ───
export async function updateProfile(userId, fields) {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

// ─── Upload avatar to profile-avatars bucket ───
export async function uploadAvatar(userId, file) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-avatars')
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('profile-avatars')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// ─── Upload cover photo to profile-covers bucket ───
export async function uploadCoverPhoto(userId, file) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-covers')
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('profile-covers')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// ─── Fetch friendship status between two users ───
export async function fetchFriendshipStatus(userId, otherUserId) {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, status, requester_id, addressee_id')
    .or(`and(requester_id.eq.${userId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${userId})`)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ─── Send friend request ───
export async function sendFriendRequest(requesterId, addresseeId) {
  const { data, error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Accept friend request ───
export async function acceptFriendRequest(friendshipId) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Remove / cancel friend ───
export async function removeFriend(friendshipId) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
}

// ─── Fetch friend count for a user ───
export async function fetchFriendCount(userId) {
  const { count, error } = await supabase
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) throw error;
  return count || 0;
}

// ─── Fetch accepted friends for a user (with profile data) ───
export async function fetchFriends(userId, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id,
      requester:profiles!friendships_requester_id_fkey(id, name, profile_photo_url),
      addressee:profiles!friendships_addressee_id_fkey(id, name, profile_photo_url)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map(f => {
    const isRequester = f.requester_id === userId;
    const friendProfile = isRequester ? f.addressee : f.requester;
    const name = friendProfile?.name || 'Unknown';
    let photo = friendProfile?.profile_photo_url || null;
    if (photo && photo.includes('name=User')) {
      photo = photo.replace('name=User', `name=${encodeURIComponent(name)}`);
    }
    return {
      friendshipId: f.id,
      id: friendProfile?.id,
      name,
      profile_photo_url: photo,
    };
  });
}

// ─── Fetch user posts by author_id (main feed: group_id and page_id NULL) ───
export async function fetchProfilePosts(userId, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, profile_photo_url),
      media:post_media(id, media_type, media_url, thumbnail_url, order_index, width, height),
      reactions(id, reaction_type, user_id),
      comments(id)
    `)
    .eq('author_id', userId)
    .is('group_id', null)
    .is('page_id', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map(post => {
    const reactionCounts = {};
    post.reactions.forEach(r => {
      reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
    });
    return {
      ...post,
      media: (post.media || []).sort((a, b) => a.order_index - b.order_index),
      authorName: post.author?.name || 'Unknown',
      avatarUrl: post.author?.profile_photo_url || null,
      reactionCounts,
      totalReactions: post.reactions.length,
      commentsCount: post.comments.length,
    };
  });
}

// ─── Fetch user's photo posts (posts with image_url) ───
export async function fetchProfilePhotos(userId, limit = 30, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, image_url, created_at')
    .eq('author_id', userId)
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}
