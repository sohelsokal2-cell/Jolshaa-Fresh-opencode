import { supabase } from '../config/supabaseClient';

export async function createLiveStream(hostId, title = 'Live video') {
  if (!hostId) throw new Error('You must be signed in to go live.');
  const roomName = `live-${crypto.randomUUID()}`;
  const { data, error } = await supabase
    .from('live_streams')
    .insert({ host_id: hostId, title: title.trim() || 'Live video', room_name: roomName })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchLiveStream(streamId) {
  const { data, error } = await supabase
    .from('live_streams')
    .select('*')
    .eq('id', streamId)
    .single();

  if (error) throw error;
  return data;
}

export async function endLiveStream(streamId, hostId) {
  const { data, error } = await supabase
    .from('live_streams')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', streamId)
    .eq('host_id', hostId)
    .eq('status', 'live')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}
