import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { createLiveStream, endLiveStream } from '../lib/liveApi';
import { fetchLivekitToken } from '../lib/groupCallApi';
import '@livekit/components-styles';
import './LiveVideo.css';

const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL;

export default function LiveVideoModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [stream, setStream] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle(''); setStream(null); setToken(null); setError(''); setLoading(false);
    }
  }, [isOpen]);

  const startLive = async () => {
    if (!LIVEKIT_WS_URL) { setError('LiveKit server URL is not configured.'); return; }
    setLoading(true); setError('');
    try {
      const liveStream = await createLiveStream(user?.id, title || 'Live video');
      const livekitToken = await fetchLivekitToken(liveStream.room_name);
      setStream(liveStream); setToken(livekitToken);
    } catch (err) {
      console.error('[LiveVideo] Failed to start:', err);
      setError(err.message || 'Live video start করা যায়নি।');
    } finally { setLoading(false); }
  };

  const stopLive = async () => {
    try { if (stream) await endLiveStream(stream.id, user?.id); }
    catch (err) { console.error('[LiveVideo] Failed to end:', err); }
    finally { showToast('Live video ended.'); onClose?.(); }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/live/${stream.id}`); showToast('Live link copied.'); }
    catch { showToast('Live link copy করা যায়নি।'); }
  };

  if (!isOpen) return null;
  return createPortal(
    <div className="live-modal-backdrop" onMouseDown={stream ? undefined : onClose}>
      <div className={`live-modal${stream ? ' live-modal-active' : ''}`} onMouseDown={e => e.stopPropagation()}>
        {!stream ? (
          <>
            <div className="live-modal-header"><h2>🔴 Go Live</h2><button onClick={onClose} aria-label="Close">×</button></div>
            <p className="live-modal-subtitle">ক্যামেরা ও মাইক্রোফোন চালু করে আপনার বন্ধুদের সাথে live হন।</p>
            <label className="live-title-label">Live title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you talking about?" maxLength={100} /></label>
            {error && <div className="live-error">{error}</div>}
            <div className="live-modal-actions"><button className="live-secondary-btn" onClick={onClose}>Cancel</button><button className="live-primary-btn" onClick={startLive} disabled={loading}>{loading ? 'Starting…' : 'Start Live'}</button></div>
          </>
        ) : (
          <LiveKitRoom token={token} serverUrl={LIVEKIT_WS_URL} connect video audio onDisconnected={stopLive} style={{ height: '100%' }}>
            <div className="live-room-header"><div><strong>{stream.title}</strong><span>🔴 Live now</span></div><div className="live-room-actions"><button onClick={copyLink}>Copy link</button><button className="live-end-btn" onClick={stopLive}>End live</button></div></div>
            <VideoConference />
          </LiveKitRoom>
        )}
      </div>
    </div>, document.body,
  );
}
