import { supabase } from '../config/supabaseClient';

const VIDEOS_PER_PAGE = 12;

// Max file size: 50MB (Supabase free tier limit)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

// TODO: For larger videos, consider external hosting (Cloudflare Stream / Mux)
// Supabase free tier has a 50MB per-file limit. Production should use
// a dedicated video hosting service for better performance and no size limits.

function validateFileSize(file, maxSize, label) {
  if (file && file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    throw new Error(`${label} ফাইল সাইজ ${sizeMB}MB — সর্বোচ্চ ${maxMB}MB অনুমোদিত। ছোট ফাইল ব্যবহার করুন।`);
  }
}

export async function uploadVideo(uploaderId, title, description, videoFile, thumbnailFile) {
  validateFileSize(videoFile, MAX_VIDEO_SIZE, 'ভিডিও');
  validateFileSize(thumbnailFile, MAX_THUMBNAIL_SIZE, 'থাম্বনেইল');

  const videoExt = videoFile.name.split('.').pop();
  const videoPath = `user-videos/${uploaderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${videoExt}`;

  const { data: videoUpload, error: videoUploadError } = await supabase.storage
    .from('watch-videos')
    .upload(videoPath, videoFile, { contentType: videoFile.type });

  if (videoUploadError) throw videoUploadError;

  const { data: videoUrlData } = supabase.storage
    .from('watch-videos')
    .getPublicUrl(videoPath);

  let thumbnailUrl = null;
  if (thumbnailFile) {
    const thumbExt = thumbnailFile.name.split('.').pop();
    const thumbPath = `thumbnails/${uploaderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${thumbExt}`;

    const { data: thumbUpload, error: thumbUploadError } = await supabase.storage
      .from('watch-thumbnails')
      .upload(thumbPath, thumbnailFile, { contentType: thumbnailFile.type });

    if (thumbUploadError) throw thumbUploadError;

    const { data: thumbUrlData } = supabase.storage
      .from('watch-thumbnails')
      .getPublicUrl(thumbPath);

    thumbnailUrl = thumbUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('videos')
    .insert({
      uploader_id: uploaderId,
      title,
      description: description || null,
      video_url: videoUrlData.publicUrl,
      thumbnail_url: thumbnailUrl,
    })
    .select(`
      *,
      uploader:profiles(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    uploaderName: data.uploader?.name || 'অজানা',
    uploaderAvatar: data.uploader?.profile_photo_url || null,
  };
}

export async function fetchVideos(filter = 'for_you', page = 0, userId = null) {
  const from = page * VIDEOS_PER_PAGE;
  const to = from + VIDEOS_PER_PAGE - 1;

  let query = supabase
    .from('videos')
    .select(`
      *,
      uploader:profiles(id, name, profile_photo_url)
    `)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filter === 'yourvideos' && userId) {
    query = query.eq('uploader_id', userId);
  } else if (filter === 'live') {
    query = query.eq('is_live', true);
  }
  // 'for_you' and 'following' return all videos (following needs a follows table — future feature)

  const { data, error } = await query;
  if (error) throw error;

  return data.map(v => ({
    ...v,
    uploaderName: v.uploader?.name || 'অজানা',
    uploaderAvatar: v.uploader?.profile_photo_url || null,
  }));
}

export async function fetchVideoById(videoId) {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      uploader:profiles(id, name, profile_photo_url)
    `)
    .eq('id', videoId)
    .single();

  if (error) throw error;

  return {
    ...data,
    uploaderName: data.uploader?.name || 'অজানা',
    uploaderAvatar: data.uploader?.profile_photo_url || null,
  };
}

export async function incrementView(videoId, viewerId = null) {
  // Only insert a view record for authenticated viewers (viewer_id has a FK to profiles)
  if (viewerId) {
    const { error: insertError } = await supabase
      .from('video_views')
      .insert({
        video_id: videoId,
        viewer_id: viewerId,
      });

    // If duplicate (user already viewed), silently ignore
    if (insertError) {
      if (insertError.code === '23505') return false; // unique violation
      throw insertError;
    }
  }

  // Increment the denormalized counter on the videos table
  const { error: updateError } = await supabase
    .rpc('increment_video_view', { p_video_id: videoId });

  if (updateError) throw updateError;

  return true;
}

export async function toggleSaveVideo(userId, videoId) {
  const { data: existing } = await supabase
    .from('saved_videos')
    .select('id')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('saved_videos')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from('saved_videos')
    .insert({ user_id: userId, video_id: videoId });
  if (error) throw error;
  return true;
}

export async function isVideoSaved(userId, videoId) {
  if (!userId) return false;
  const { data } = await supabase
    .from('saved_videos')
    .select('id')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .maybeSingle();
  return !!data;
}
