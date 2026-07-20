import { supabase } from '../config/supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '')
  || 'http://localhost:5000';

// Helper: get current session access token
async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// ─── 1-on-1 Call API ───

// Create a new call session (status='ringing')
export async function initiateCall(conversationId, callerId, calleeId, callType) {
  const { data, error } = await supabase
    .from('call_sessions')
    .insert({
      conversation_id: conversationId,
      caller_id: callerId,
      callee_id: calleeId,
      call_type: callType,
      status: 'ringing',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fetch TURN credentials from backend (Metered.ca)
export async function fetchTurnCredentials() {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${BACKEND_URL}/api/calls/turn-credentials`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch TURN credentials');
  return result.iceServers;
}

// Accept a call (update status='accepted')
export async function acceptCall(callId) {
  const { data, error } = await supabase
    .from('call_sessions')
    .update({ status: 'accepted', started_at: new Date().toISOString() })
    .eq('id', callId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Decline a call (update status='declined')
export async function declineCall(callId) {
  const { data, error } = await supabase
    .from('call_sessions')
    .update({ status: 'declined', ended_at: new Date().toISOString() })
    .eq('id', callId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// End an active call (update status='ended')
export async function endCall(callId) {
  const { data, error } = await supabase
    .from('call_sessions')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', callId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Subscribe to incoming calls for a user (Realtime on call_sessions)
export function subscribeToIncomingCalls(userId, onIncomingCall) {
  const channel = supabase
    .channel('incoming-calls')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'call_sessions',
        filter: `callee_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch full call session with caller profile
        const { data: callSession, error } = await supabase
          .from('call_sessions')
          .select(`
            *,
            caller:profiles!call_sessions_caller_id_fkey(id, name, profile_photo_url),
            callee:profiles!call_sessions_callee_id_fkey(id, name, profile_photo_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && callSession) {
          onIncomingCall(callSession);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to call status changes (for caller to know when callee accepts/declines)
export function subscribeToCallStatus(callId, onStatusChange) {
  const channel = supabase
    .channel(`call-status-${callId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'call_sessions',
        filter: `id=eq.${callId}`,
      },
      (payload) => {
        onStatusChange(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Signaling Channel (for SDP/ICE exchange) ───

// Create a signaling channel for a specific call
export function createSignalingChannel(callId) {
  return supabase.channel(`call:${callId}`, {
    config: { broadcast: { self: false } },
  });
}

// Send a signaling message (offer, answer, ice-candidate)
export async function sendSignalingMessage(channel, event, payload) {
  await channel.send({
    type: 'broadcast',
    event,
    payload,
  });
}

// Subscribe to signaling messages
export function subscribeToSignaling(channel, event, callback) {
  channel.on('broadcast', { event }, ({ payload }) => {
    callback(payload);
  });
}

// Subscribe to multiple signaling events at once
export function subscribeToAllSignaling(channel, handlers) {
  Object.entries(handlers).forEach(([event, callback]) => {
    channel.on('broadcast', { event }, ({ payload }) => {
      callback(payload);
    });
  });
}
