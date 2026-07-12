import React, { useState, useEffect, useRef } from 'react';
import reelVideoFrame from '../assets/reel_video_frame.png';

export default function ReelVideoFrame({
  creator,
  caption,
  audioName,
  viewerCount,
  onNavigateUp,
  onNavigateDown,
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState(null);
  const frameRef = useRef(null);

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const triggerTransition = (direction) => {
    setTransitionDir(direction);
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDir(null);
      if (direction === 'up') onNavigateUp?.();
      else onNavigateDown?.();
    }, 280);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        triggerTransition('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        triggerTransition('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateUp, onNavigateDown]);

  const frameClass = [
    'video-frame',
    isTransitioning && 'transitioning',
    isTransitioning && transitionDir && `transitioning-${transitionDir}`,
  ].filter(Boolean).join(' ');

  return (
    <div className="video-frame-wrap" role="main" aria-label={`Current Reel by ${creator?.name || 'Creator'}`}>
      {/* Progress bar */}
      <div className="video-progress" aria-label="Video progress">
        <div className="video-progress-fill"></div>
      </div>

      {/* The video frame */}
      <div className={frameClass} ref={frameRef}>
        {/* Video background (image with fallback) */}
        {!imgError ? (
          <img
            src={reelVideoFrame}
            className="video-bg"
            alt="Street food reel — রাস্তার খাবারের রিলস"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="video-bg-fallback">🎬</div>
        )}

        {/* Mute button */}
        <button
          className={`mute-btn ${isMuted ? 'muted' : ''}`}
          onClick={handleToggleMute}
          aria-label={isMuted ? 'আনমিউট / Unmute' : 'মিউট / Mute'}
        >
          {isMuted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          )}
        </button>

        {/* Live counter top-right */}
        <div className="reel-counter" aria-label="Live viewers">
          <span className="reel-counter-dot"></span>
          <span className="reel-counter-text">{viewerCount || '৪.২K দেখছেন · watching'}</span>
        </div>

        {/* Swipe hint */}
        <div className="swipe-hint" aria-hidden="true">
          <div className="swipe-hint-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M18 9l-6-6-6 6" />
            </svg>
          </div>
          <div className="swipe-hint-text">উপরে সোয়াইপ · Swipe up</div>
        </div>

        {/* Bottom overlay */}
        <div className="video-bottom-overlay">
          {/* Creator row */}
          <div className="creator-row">
            <div className="creator-av" aria-hidden="true">{creator?.avatar || 'প্র'}</div>
            <div>
              <div className="creator-name">{creator?.name || 'প্রিয়া রানী দাস'}</div>
              <div className="creator-handle">{creator?.handle || '@priya.foodie.bd'}</div>
            </div>
            <FollowButton />
          </div>

          {/* Audio chip */}
          <div className="audio-chip">
            <div className="audio-icon-wrap">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <span className="audio-text">🎵 {audioName || 'Original Audio — প্রিয়া রানী দাস'}</span>
          </div>

          {/* Caption */}
          <p className="caption-text">
            {caption || 'ঢাকার সেরা ঝালমুড়ি! 🌶️ এই স্বাদ একবার খেলে ভুলতে পারবেন না।'}
          </p>
          <span className="see-more-link" role="button" tabIndex="0">আরও দেখুন · See more</span>
        </div>
      </div>

      {/* Up/Down navigation arrows */}
      <div className="reel-nav-arrows" aria-label="Navigate reels">
        <button
          className="reel-nav-btn"
          aria-label="আগের রিলস / Previous reel"
          onClick={() => triggerTransition('up')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <button
          className="reel-nav-btn"
          aria-label="পরের রিলস / Next reel"
          onClick={() => triggerTransition('down')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function FollowButton() {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleToggle = () => {
    setIsFollowing((prev) => !prev);
  };

  return (
    <button
      className={`follow-btn ${isFollowing ? 'following' : ''}`}
      onClick={handleToggle}
      aria-label={isFollowing ? 'ফলো করা হয়েছে / Following' : 'ফলো করুন / Follow'}
    >
      {isFollowing ? (
        <>
          <span className="follow-btn-bn">✓ ফলো হয়েছে</span>
          <span className="follow-btn-en">Following</span>
        </>
      ) : (
        <>
          <span className="follow-btn-bn">+ ফলো করুন</span>
          <span className="follow-btn-en">Follow</span>
        </>
      )}
    </button>
  );
}
