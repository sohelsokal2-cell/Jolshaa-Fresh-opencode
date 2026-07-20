import { supabase } from '../config/supabaseClient';

export async function createPage(name, category, description, coverFile, creatorId) {
  let coverUrl = null;

  if (coverFile) {
    const fileExt = coverFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `page-covers/${fileName}`;

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
    .from('pages')
    .insert({
      name,
      category,
      description,
      cover_image_url: coverUrl,
      creator_id: creatorId,
    })
    .select('*')
    .single();

  if (error) throw error;

  await supabase
    .from('page_followers')
    .insert({ page_id: data.id, user_id: creatorId });

  return data;
}

export async function fetchPages(filter, userId) {
  if (filter === 'managed') {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  if (filter === 'followed') {
    const { data, error } = await supabase
      .from('page_followers')
      .select(`
        page_id, followed_at,
        page:pages(id, name, category, description, cover_image_url, creator_id, created_at)
      `)
      .eq('user_id', userId)
      .order('followed_at', { ascending: false });

    if (error) throw error;
    return data.map(f => ({
      ...f.page,
      followedAt: f.followed_at,
      isFollowing: true,
    }));
  }

  if (filter === 'discover') {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function followPage(pageId, userId) {
  const { data, error } = await supabase
    .from('page_followers')
    .insert({ page_id: pageId, user_id: userId })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function unfollowPage(pageId, userId) {
  const { error } = await supabase
    .from('page_followers')
    .delete()
    .eq('page_id', pageId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function checkFollowStatus(pageId, userId) {
  const { data, error } = await supabase
    .from('page_followers')
    .select('id')
    .eq('page_id', pageId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function fetchPagePosts(pageId, currentUserId = null, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, profile_photo_url),
      reactions(id, reaction_type, user_id),
      comments(id)
    `)
    .eq('page_id', pageId)
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

export async function createPagePost(pageId, content, imageFile, authorId) {
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
      page_id: pageId,
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
