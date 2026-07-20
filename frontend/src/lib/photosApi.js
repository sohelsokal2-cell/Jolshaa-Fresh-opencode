import { supabase } from '../config/supabaseClient';

export async function fetchUserPhotos(userId) {
  const { data, error } = await supabase
    .from('post_media')
    .select('id, media_url, thumbnail_url, media_type, order_index, post:posts!post_media_post_id_fkey!inner(id, author_id, created_at)')
    .eq('media_type', 'image')
    .eq('post.author_id', userId)
    .order('created_at', { ascending: false, referencedTable: 'posts' });
  if (error) throw error;
  return (data || []).map(item => ({ ...item, created_at: item.post?.created_at, post_id: item.post?.id }));
}
