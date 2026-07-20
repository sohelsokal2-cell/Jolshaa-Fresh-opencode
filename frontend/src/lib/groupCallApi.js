import { supabase } from '../config/supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '')
  || 'http://localhost:5000';

// Fetch LiveKit access token from backend
export async function fetchLivekitToken(roomName) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const response = await fetch(`${BACKEND_URL}/api/calls/livekit/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ roomName }),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Failed to fetch LiveKit token');
  return result.token;
}
