import React, { useEffect, useRef, useState } from 'react';
import useWebRTCCall, { CALL_STATE } from '../../hooks/useWebRTCCall';
import './Calling.css';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveCallScreen({ callSession, localUserId, onCallEnd }) {
  const [duration, setDuration] = useState(0);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    endCall,
  } = useWebRTCCall({
    callId: callSession?.id,
    localUserId,
    isInitiator: callSession?.caller_id === localUserId,
    onCallEnd,
  });

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Duration timer
  useEffect(() => {
    if (callState !== CALL_STATE.CONNECTED) return;

    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState]);

  const handleEndCall = () => {
    endCall();
  };

  if (!callSession) return null;

  const other = callSession.caller_id === localUserId
    ? callSession.callee
    : callSession.caller;
  const otherName = other?.name || 'অজানা ব্যবহারকারী';
  const avatarChar = otherName.charAt(0);
  const isVideo = callSession.call_type === 'video';

  const stateLabel = {
    [CALL_STATE.GETTING_MEDIA]: 'মিডিয়া লোড হচ্ছে...',
    [CALL_STATE.CONNECTING]: 'সংযোগ হচ্ছে...',
    [CALL_STATE.CONNECTED]: 'সংযুক্ত',
    [CALL_STATE.DISCONNECTED]: 'সংযোগ বিচ্ছিন্ন',
    [CALL_STATE.FAILED]: 'সংযোগ ব্যর্থ',
    [CALL_STATE.ENDED]: 'কল শেষ',
  };

  return (
    <div className="active-call-screen">
      {/* Header */}
      <div className="active-call-header">
        <div className="active-call-info">
          <div className="active-call-avatar">{avatarChar}</div>
          <div>
            <div className="active-call-name">{otherName}</div>
            <div className="active-call-status">
              {stateLabel[callState] || callState}
            </div>
          </div>
        </div>
        {callState === CALL_STATE.CONNECTED && (
          <div className="active-call-timer">{formatDuration(duration)}</div>
        )}
      </div>

      {/* Connection state indicator */}
      {(callState === CALL_STATE.CONNECTING || callState === CALL_STATE.GETTING_MEDIA) && (
        <div className="call-state-indicator connecting">
          {stateLabel[callState]}
        </div>
      )}
      {callState === CALL_STATE.FAILED && (
        <div className="call-state-indicator failed">
          সংযোগ ব্যর্থ হয়েছে / Connection failed
        </div>
      )}

      {/* Video/Audio area */}
      {isVideo ? (
        <div className="active-call-videos">
          {/* Remote video */}
          <div className="remote-video-container">
            {remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline />
            ) : (
              <div className="remote-video-placeholder">
                <div className="remote-video-avatar">{avatarChar}</div>
              </div>
            )}
          </div>

          {/* Local video (picture-in-picture) */}
          {localStream && !isVideoOff && (
            <div className="local-video-container">
              <video ref={localVideoRef} autoPlay playsInline muted />
            </div>
          )}
        </div>
      ) : (
        <div className="audio-call-container">
          <div className="audio-call-avatar">
            <div className="call-ring"></div>
            <div className="call-ring"></div>
            <div className="call-ring"></div>
            {avatarChar}
          </div>
          <div className="audio-call-name">{otherName}</div>
          <div className="audio-call-status">
            {stateLabel[callState] || callState}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="active-call-controls">
        <div>
          <button
            className={`call-control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            aria-label={isMuted ? 'আনমিউট / Unmute' : 'মিউট / Mute'}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
          <div className="call-control-label">
            {isMuted ? 'মিউটেড' : 'মিউট'}
          </div>
        </div>

        {isVideo && (
          <div>
            <button
              className={`call-control-btn ${isVideoOff ? 'active' : ''}`}
              onClick={toggleVideo}
              aria-label={isVideoOff ? 'ভিডিও চালু / Turn video on' : 'ভিডিও বন্ধ / Turn video off'}
            >
              {isVideoOff ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              )}
            </button>
            <div className="call-control-label">
              {isVideoOff ? 'ভিডিও বন্ধ' : 'ভিডিও'}
            </div>
          </div>
        )}

        <div>
          <button
            className="call-control-btn end-call"
            onClick={handleEndCall}
            aria-label="কল শেষ করুন / End call"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67M23 1L1 23" />
            </svg>
          </button>
          <div className="call-control-label">শেষ</div>
        </div>
      </div>
    </div>
  );
}
