import { supabase } from '../config/supabaseClient';

const POSTS_PER_PAGE = 10;

export async function fetchPosts(limit = POSTS_PER_PAGE, offset = 0, currentUserId = null) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, profile_photo_url),
      media:post_media(id, media_type, media_url, thumbnail_url, order_index, width, height),
      reactions(id, reaction_type, user_id),
      comments(id)
    `)
    .is('group_id', null)
    .is('page_id', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Tags are optional composer metadata. Do not make the whole feed fail while
  // the optional post_tags migration is still being applied.
  let tagsByPost = {};
  if (data.length) {
    const { data: tagRows, error: tagsError } = await supabase
      .from('post_tags')
      .select('post_id, user:profiles!post_tags_user_id_fkey(id, name, profile_photo_url)')
      .in('post_id', data.map(post => post.id));
    if (!tagsError) {
      tagsByPost = (tagRows || []).reduce((result, tag) => {
        (result[tag.post_id] ||= []).push(tag);
        return result;
      }, {});
    } else {
      console.warn('[fetchPosts] Optional post tags unavailable:', tagsError.message || tagsError);
    }
  }

  const postsWithCounts = data.map(post => {
    const reactionCounts = {};
    post.reactions.forEach(r => {
      reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
    });

    return {
      ...post,
      tags: tagsByPost[post.id] || [],
      media: (post.media || []).sort((a, b) => a.order_index - b.order_index),
      authorName: post.author?.name || 'অজানা ব্যবহারকারী',
      avatarUrl: (() => {
        let photo = post.author?.profile_photo_url || null;
        if (photo && photo.includes('name=User')) {
          photo = photo.replace('name=User', `name=${encodeURIComponent(post.author?.name || 'User')}`);
        }
        return photo;
      })(),
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

function generateVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.1, video.duration || 0);
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(objectUrl);
        if (blob) resolve(new File([blob], `${file.name}.jpg`, { type: 'image/jpeg' }));
        else reject(new Error('Could not generate video thumbnail'));
      }, 'image/jpeg', 0.82);
    };
    video.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not read video')); };
    video.src = objectUrl;
  });
}

async function uploadMedia(file, authorId, index) {
  const isVideo = file.type.startsWith('video/');
  const bucket = isVideo ? 'post-videos' : 'post-images';
  const ext = file.name.split('.').pop();
  const path = `posts/${authorId}/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  const mediaUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  let thumbnailUrl = null;
  if (isVideo) {
    const thumbnail = await generateVideoThumbnail(file);
    const thumbnailPath = `posts/${authorId}/thumb-${Date.now()}-${index}.jpg`;
    const { error: thumbError } = await supabase.storage.from('post-images').upload(thumbnailPath, thumbnail, { contentType: 'image/jpeg' });
    if (thumbError) throw thumbError;
    thumbnailUrl = supabase.storage.from('post-images').getPublicUrl(thumbnailPath).data.publicUrl;
  }

  return { media_type: isVideo ? 'video' : 'image', media_url: mediaUrl, thumbnail_url: thumbnailUrl, order_index: index, width: null, height: null };
}

export async function createPost(content, mediaFiles = [], postType = 'text', userId = null, options = {}) {
  // Backward-compatible support for the former createPost(content, imageFile, userId) signature.
  if (typeof File !== 'undefined' && mediaFiles instanceof File) {
    userId = postType;
    mediaFiles = [mediaFiles];
    postType = 'photo';
  }
  const files = Array.isArray(mediaFiles) ? mediaFiles.filter(Boolean) : [];

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    throw new Error('You must be signed in to create a post.');
  }

  // Always use the authenticated Supabase user, not an arbitrary client ID.
  const authorId = authUser.id;
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', authorId)
    .maybeSingle();

  if (profileFetchError) throw profileFetchError;

  // Repair accounts created before the profile insert flow was enabled.
  if (!profile) {
    const fallbackName = authUser.user_metadata?.full_name
      || authUser.user_metadata?.name
      || authUser.email?.split('@')[0]
      || 'Jolshaa User';
    const { error: profileInsertError } = await supabase
      .from('profiles')
      .insert({
        id: authorId,
        name: fallbackName,
        email: authUser.email || `${authorId}@profile.invalid`,
      });

    if (profileInsertError) throw profileInsertError;
  }

  const uploadedMedia = [];
  for (let index = 0; index < files.length; index += 1) {
    uploadedMedia.push(await uploadMedia(files[index], authorId, index));
  }

  const detectedType = postType === 'text'
    ? (uploadedMedia.some(media => media.media_type === 'video') ? 'video' : uploadedMedia.length ? 'photo' : 'text')
    : postType;
  const insertPayload = {
    content: content || '', image_url: null, author_id: authorId, post_type: detectedType,
    feeling: options.feeling || null, location_name: options.locationName || null,
    life_update: options.lifeUpdate || null, gif_url: options.gifUrl || null,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(insertPayload)
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, profile_photo_url),
      media:post_media(id, media_type, media_url, thumbnail_url, order_index, width, height)
    `)
    .single();

  if (error) {
    console.error('[createPost] Insert FAILED:', error);
    throw error;
  }

  if (uploadedMedia.length) {
    const { error: mediaError } = await supabase.from('post_media').insert(uploadedMedia.map(media => ({ ...media, post_id: data.id })));
    if (mediaError) throw mediaError;
  }

  if (options.taggedUserIds?.length) {
    const { error: tagError } = await supabase.from('post_tags').insert(
      [...new Set(options.taggedUserIds)].filter(id => id !== authorId).map(user_id => ({ post_id: data.id, user_id }))
    );
    if (tagError) throw tagError;
  }

  return {
    ...data,
    media: uploadedMedia,
    authorName: data.author?.name || 'অজানা ব্যবহারকারী',
    avatarUrl: (() => {
      let photo = data.author?.profile_photo_url || null;
      if (photo && photo.includes('name=User')) {
        photo = photo.replace('name=User', `name=${encodeURIComponent(data.author?.name || 'User')}`);
      }
      return photo;
    })(),
    reactionCounts: {},
    totalReactions: 0,
    commentsCount: 0,
    userReaction: null,
  };
}

export async function searchProfiles(query, currentUserId) {
  const { data, error } = await supabase.from('profiles').select('id, name, profile_photo_url')
    .neq('id', currentUserId || '').ilike('name', `%${query}%`).limit(8);
  if (error) throw error;
  return data || [];
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
      author:profiles!comments_author_id_fkey(id, name, profile_photo_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map(c => {
    const name = c.author?.name || 'অজানা ব্যবহারকারী';
    let photo = c.author?.profile_photo_url || null;
    if (photo && photo.includes('name=User')) {
      photo = photo.replace('name=User', `name=${encodeURIComponent(name)}`);
    }
    return {
      ...c,
      authorName: name,
      avatarUrl: photo,
    };
  });
}

export async function addComment(postId, content, userId = null) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, content, author_id: userId })
    .select(`
      *,
      author:profiles!comments_author_id_fkey(id, name, profile_photo_url)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    authorName: data.author?.name || 'অজানা ব্যবহারকারী',
    avatarUrl: (() => {
      let photo = data.author?.profile_photo_url || null;
      if (photo && photo.includes('name=User')) {
        photo = photo.replace('name=User', `name=${encodeURIComponent(data.author?.name || 'User')}`);
      }
      return photo;
    })(),
  };
}
