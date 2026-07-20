import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { useAuth } from '../context/AuthContext';
import { fetchLiveStream } from '../lib/liveApi';
import { fetchLivekitToken } from '../lib/groupCallApi';
import '@livekit/components-styles';
import '../components/LiveVideo.css';

const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL;

export default function LiveVideoPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stream, setStream] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!LIVEKIT_WS_URL) throw new Error('LiveKit server URL is not configured.');
        const liveStream = await fetchLiveStream(streamId);
        if (liveStream.status !== 'live') throw new Error('This live video has ended.');
        const livekitToken = await fetchLivekitToken(liveStream.room_name);
        if (!cancelled) { setStream(liveStream); setToken(livekitToken); }
      } catch (err) { if (!cancelled) setError(err.message || 'Live video open করা যায়নি।'); }
    })();
    return () => { cancelled = true; };
  }, [streamId, user]);

  if (error) return <div className="live-page-state"><div>⚠️</div><p>{error}</p><button onClick={() => navigate('/feed')}>Back to Feed</button></div>;
  if (!stream || !token) return <div className="live-page-state"><div className="live-spinner" /><p>Joining live video…</p></div>;

  return <div className="live-page"><LiveKitRoom token={token} serverUrl={LIVEKIT_WS_URL} connect video={false} audio={false} onDisconnected={() => navigate('/feed')} style={{ height: '100%' }}><div className="live-room-header"><div><strong>{stream.title}</strong><span>🔴 Live now</span></div><button onClick={() => navigate('/feed')}>Leave</button></div><VideoConference /></LiveKitRoom></div>;
}
