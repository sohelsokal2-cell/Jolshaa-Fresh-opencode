import { supabase } from '../config/supabaseClient';

export async function createGroup(name, description, coverFile, privacy, creatorId) {
  let coverUrl = null;

  if (coverFile) {
    const fileExt = coverFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `group-covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, coverFile);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    coverUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      description,
      cover_image_url: coverUrl,
      privacy: privacy || 'public',
      creator_id: creatorId,
    })
    .select('*')
    .single();

  if (error) throw error;

  await supabase
    .from('group_members')
    .insert({ group_id: data.id, user_id: creatorId, role: 'admin' });

  return data;
}

export async function fetchGroups(filter, userId) {
  if (filter === 'joined') {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        group_id, joined_at,
        group:groups(id, name, description, cover_image_url, creator_id, privacy, created_at)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data.map(m => ({
      ...m.group,
      joinedAt: m.joined_at,
      isMember: true,
    }));
  }

  if (filter === 'discover') {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function joinGroup(groupId, userId) {
  const { data, error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId, role: 'member' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function leaveGroup(groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchGroupMembers(groupId) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id, role, joined_at,
      user:profiles(id, name, profile_photo_url)
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: false });

  if (error) throw error;

  return data.map(m => ({
    ...m,
    userName: m.user?.name || 'Unknown',
    avatarUrl: m.user?.profile_photo_url || null,
  }));
}

export async function checkMembership(groupId, userId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('id, role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchGroupPosts(groupId, currentUserId = null, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, profile_photo_url),
      reactions(id, reaction_type, user_id),
      comments(id)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map(post => {
    const reactionCounts = {};
    post.reactions.forEach(r => {
      reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
    });

    const userReaction = currentUserId
      ? post.reactions.find(r => r.user_id === currentUserId)?.reaction_type || null
      : null;

    return {
      ...post,
      authorName: post.author?.name || 'Unknown',
      avatarUrl: post.author?.profile_photo_url || null,
      reactionCounts,
      totalReactions: post.reactions.length,
      commentsCount: post.comments.length,
      userReaction,
    };
  });
}

export async function createGroupPost(groupId, content, imageFile, authorId) {
  let imageUrl = null;

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    imageUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      group_id: groupId,
    })
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    authorName: data.author?.name || 'Unknown',
    avatarUrl: data.author?.profile_photo_url || null,
    reactionCounts: {},
    totalReactions: 0,
    commentsCount: 0,
  };
}
