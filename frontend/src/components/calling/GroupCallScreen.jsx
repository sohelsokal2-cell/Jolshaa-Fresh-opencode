import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { useAuth } from '../../context/AuthContext';
import { fetchLivekitToken } from '../../lib/groupCallApi';
import '@livekit/components-styles';
import './Calling.css';

const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL;

export default function GroupCallScreen({ roomName, onLeave }) {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomName || !user) return;

    let cancelled = false;

    async function getToken() {
      try {
        setLoading(true);
        setError(null);
        const livekitToken = await fetchLivekitToken(roomName);
        if (!cancelled) {
          setToken(livekitToken);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch LiveKit token:', err);
          setError(err.message || 'টোকেন আনতে ব্যর্থ হয়েছে।');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getToken();

    return () => { cancelled = true; };
  }, [roomName, user]);

  if (loading) {
    return (
      <div className="group-call-screen">
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'var(--font-bn)',
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>কল রুমে যোগ দিচ্ছে...</div>
          <div style={{ fontSize: '13px', opacity: 0.6, fontFamily: 'var(--font-en)' }}>
            Joining call room...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-call-screen">
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'var(--font-bn)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>{error}</div>
          <button
            onClick={onLeave}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--teal, #1B6B5A)',
              color: 'white',
              fontFamily: 'var(--font-bn)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ফিরে যান / Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="group-call-screen">
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}>
          <div style={{ fontSize: '16px' }}>টোকেন পাওয়া যায়নি</div>
          <button
            onClick={onLeave}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--teal, #1B6B5A)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-call-screen">
      <LiveKitRoom
        token={token}
        serverUrl={LIVEKIT_WS_URL}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={onLeave}
        style={{ height: '100%' }}
      >
        <div className="group-call-header">
          <div className="group-call-title">গ্রুপ কল / Group Call</div>
          <button
            onClick={onLeave}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#e74c3c',
              color: 'white',
              fontFamily: 'var(--font-bn)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            কল ছাড়ুন / Leave
          </button>
        </div>
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
