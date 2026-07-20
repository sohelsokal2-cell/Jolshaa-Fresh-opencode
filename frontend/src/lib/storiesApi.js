import { supabase } from '../config/supabaseClient';

export async function fetchActiveStories() {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id, user_id, content, media_url, background, created_at, expires_at,
      author:profiles!stories_user_id_fkey(id, name, profile_photo_url)
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createStory(userId, { content, mediaFile, background }) {
  let mediaUrl = null;

  if (mediaFile) {
    const ext = mediaFile.name.split('.').pop();
    const path = `stories/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(path, mediaFile, { contentType: mediaFile.type });
    if (uploadError) throw uploadError;
    mediaUrl = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      content: content?.trim() || '',
      media_url: mediaUrl,
      background: background || 'linear-gradient(145deg,#1B6B5A,#2a9678)',
    })
    .select(`
      id, user_id, content, media_url, background, created_at, expires_at,
      author:profiles!stories_user_id_fkey(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchViewedStoryIds(userId, storyIds) {
  if (!userId || !storyIds.length) return [];
  const { data, error } = await supabase
    .from('story_views')
    .select('story_id')
    .eq('viewer_id', userId)
    .in('story_id', storyIds);
  if (error) throw error;
  return (data || []).map(item => item.story_id);
}

export async function markStoryViewed(storyId, viewerId) {
  if (!storyId || !viewerId) return;
  const { error } = await supabase
    .from('story_views')
    .upsert({ story_id: storyId, viewer_id: viewerId, viewed_at: new Date().toISOString() });
  if (error) throw error;
}
