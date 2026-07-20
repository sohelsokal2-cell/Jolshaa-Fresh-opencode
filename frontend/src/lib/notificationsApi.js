import { supabase } from '../config/supabaseClient';

export async function fetchNotifications(userId, limit = 30, offset = 0) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id, recipient_id, actor_id, type, reference_id, is_read, created_at, title, body,
      actor:profiles!notifications_actor_id_fkey(id, name, profile_photo_url)
    `)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map(n => ({
    ...n,
    actorName: n.actor?.name || null,
    actorAvatar: n.actor?.profile_photo_url || null,
  }));
}

export async function fetchNotificationCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId);

  if (error) throw error;
  return count || 0;
}

export async function fetchUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

export async function markAsRead(notificationId, userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('recipient_id', userId);

  if (error) throw error;
}

export async function markAllAsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

export function subscribeToNotifications(userId, onNewNotification, channelName = 'notifications-realtime') {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        console.log('[Realtime] New notification:', payload.new);
        onNewNotification(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
