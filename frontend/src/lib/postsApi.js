import { supabase } from '../config/supabaseClient';

const POSTS_PER_PAGE = 10;

export async function fetchPosts(limit = POSTS_PER_PAGE, offset = 0, currentUserId = null) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, name, profile_photo_url),
      reactions(id, reaction_type, user_id),
      comments(id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const postsWithCounts = data.map(post => {
    const reactionCounts = {};
    post.reactions.forEach(r => {
      reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
    });

    return {
      ...post,
      authorName: post.author?.name || 'অজানা ব্যবহারকারী',
      avatarUrl: post.author?.profile_photo_url || null,
      reactionCounts,
      totalReactions: post.reactions.length,
      commentsCount: post.comments.length,
      userReaction: currentUserId
        ? (post.reactions.find(r => r.user_id === currentUserId)?.reaction_type || null)
        : null,
    };
  });

  return postsWithCounts;
}

export async function createPost(content, imageFile = null, userId = null) {
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
    .insert({ content, image_url: imageUrl, author_id: userId })
    .select(`
      *,
      author:profiles(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    authorName: data.author?.name || 'অজানা ব্যবহারকারী',
    avatarUrl: data.author?.profile_photo_url || null,
    reactionCounts: {},
    totalReactions: 0,
    commentsCount: 0,
    userReaction: null,
  };
}

export async function toggleReaction(postId, userId, reactionType) {
  console.log('[toggleReaction]', { postId, userId, reactionType });
  const { data: existing } = await supabase
    .from('reactions')
    .select('id, reaction_type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.reaction_type === reactionType) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return null;
    } else {
      const { error } = await supabase
        .from('reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existing.id);
      if (error) throw error;
      return reactionType;
    }
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert({ post_id: postId, user_id: userId, reaction_type: reactionType });
    if (error) throw error;
    return reactionType;
  }
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(id, name, profile_photo_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map(c => ({
    ...c,
    authorName: c.author?.name || 'অজানা ব্যবহারকারী',
    avatarUrl: c.author?.profile_photo_url || null,
  }));
}

export async function addComment(postId, content, userId = null) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, content, author_id: userId })
    .select(`
      *,
      author:profiles(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    authorName: data.author?.name || 'অজানা ব্যবহারকারী',
    avatarUrl: data.author?.profile_photo_url || null,
  };
}
