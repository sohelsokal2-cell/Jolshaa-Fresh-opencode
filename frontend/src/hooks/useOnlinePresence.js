import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../config/supabaseClient';

/**
 * Single combined hook: listens to presence events AND broadcasts current user.
 * ONE channel per mount with a unique suffix to prevent React StrictMode
 * double-mount cache conflicts (cannot add callbacks after subscribe error).
 *
 * @param {string} conversationId
 * @param {string|null} currentUserId  - own user id to broadcast; pass null to listen-only
 * @param {string[]} participantIds    - other participants to fetch last_seen_at for
 */
export function useChatPresence(conversationId, currentUserId, participantIds = []) {
  const [presenceUsers, setPresenceUsers] = useState({});

  // Stable ref so async callbacks don't use stale state
  const presenceUsersRef = useRef({});
  useEffect(() => {
    presenceUsersRef.current = presenceUsers;
  }, [presenceUsers]);

  // Keep a stable ref for participantIds to avoid re-running the effect on array recreation
  const participantIdsRef = useRef(participantIds);
  useEffect(() => {
    participantIdsRef.current = participantIds;
  }, [participantIds]);

  useEffect(() => {
    if (!conversationId) return;

    // Unique suffix prevents Supabase client-side channel cache conflicts
    // when React StrictMode mounts the component twice
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase.channel(`presence:${conversationId}:${uniqueId}`);
    let isCancelled = false;

    channel
      .on('presence', { event: 'sync' }, () => {
        if (isCancelled) return;
        const state = channel.presenceState();
        const users = {};
        Object.entries(state).forEach(([key, presences]) => {
          if (Array.isArray(presences) && presences.length > 0) {
            const p = presences[0];
            const uid = p.user_id || key;
            users[uid] = { isOnline: true, lastSeen: new Date() };
          }
        });
        setPresenceUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (isCancelled) return;
        newPresences.forEach(p => {
          const uid = p.user_id || key;
          setPresenceUsers(prev => ({ ...prev, [uid]: { isOnline: true, lastSeen: new Date() } }));
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (isCancelled) return;
        leftPresences.forEach(p => {
          const uid = p.user_id || key;
          setPresenceUsers(prev => ({ ...prev, [uid]: { isOnline: false, lastSeen: new Date() } }));
        });
      });

    channel.subscribe(async (status) => {
      if (isCancelled) return;

      if (status === 'SUBSCRIBED') {
        // Broadcast own presence if currentUserId provided
        if (currentUserId) {
          try {
            await channel.track({ user_id: currentUserId, online_at: new Date().toISOString() });
          } catch (err) {
            console.error('Failed to track presence:', err);
          }
        }

        // Fetch last_seen_at for offline participants (one-shot on subscribe)
        const ids = participantIdsRef.current;
        if (ids.length > 0) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('id, last_seen_at')
              .in('id', ids);

            if (data && !isCancelled) {
              setPresenceUsers(prev => {
                const updates = {};
                data.forEach(profile => {
                  if (!prev[profile.id]?.isOnline) {
                    updates[profile.id] = {
                      isOnline: false,
                      lastSeen: profile.last_seen_at ? new Date(profile.last_seen_at) : null,
                    };
                  }
                });
                return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
              });
            }
          } catch (err) {
            console.error('Failed to fetch last_seen_at:', err);
          }
        }
      }
    });

    // Throttled last_seen_at update on user activity (only when broadcasting)
    let lastUpdate = 0;
    const THROTTLE_MS = 15000;
    const handleActivity = async () => {
      if (!currentUserId || isCancelled) return;
      const now = Date.now();
      if (now - lastUpdate < THROTTLE_MS) return;
      lastUpdate = now;
      try {
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', currentUserId);
      } catch (err) {
        // Silent — activity tracking is non-critical
      }
    };

    if (currentUserId) {
      const events = ['mousedown', 'keydown', 'touchstart'];
      events.forEach(evt => window.addEventListener(evt, handleActivity));

      return () => {
        isCancelled = true;
        events.forEach(evt => window.removeEventListener(evt, handleActivity));
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]); // participantIds intentionally excluded — fetched via ref on subscribe

  const getPresenceText = useCallback((userId) => {
    const p = presenceUsers[userId];
    if (!p) return null;

    if (p.isOnline) return { text: 'অনলাইন', color: '#22c55e', bn: 'অনলাইন' };

    if (p.lastSeen) {
      const diffMs = Date.now() - new Date(p.lastSeen).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return { text: 'এখনই', color: '#22c55e', bn: 'এখনই' };
      if (diffMins < 60) return { text: `${diffMins} মিনিট আগে`, color: '#9ca3af', bn: `${diffMins} মিনিট আগে` };
      if (diffHours < 24) return { text: `${diffHours} ঘণ্টা আগে`, color: '#9ca3af', bn: `${diffHours} ঘণ্টা আগে` };
      return { text: `${diffDays} দিন আগে`, color: '#9ca3af', bn: `${diffDays} দিন আগে` };
    }

    return { text: 'অফলাইন', color: '#9ca3af', bn: 'অফলাইন' };
  }, [presenceUsers]);

  return { presenceUsers, getPresenceText };
}

/**
 * Backward-compatible wrapper (listen-only, no broadcasting).
 * Used where we only want to check presence without the current user broadcasting.
 */
export function useOnlinePresence(conversationId, participantIds = []) {
  const { presenceUsers, getPresenceText } = useChatPresence(conversationId, null, participantIds);
  return {
    isOnline: Object.values(presenceUsers).some(u => u.isOnline),
    lastSeenAt: null,
    presenceUsers,
    getPresenceText,
    error: '',
  };
}

/**
 * Stub — broadcasting is now handled inside useChatPresence.
 * Kept so any existing imports don't break.
 */
export function useBroadcastPresence() {
  // No-op: broadcasting is handled by useChatPresence (called from Messenger.jsx)
}
