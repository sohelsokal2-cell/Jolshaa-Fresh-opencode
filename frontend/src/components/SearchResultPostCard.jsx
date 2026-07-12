import React, { useState } from 'react';
import { highlightMatch } from '../utils/highlight';

export default function SearchResultPostCard({
  searchQuery = 'মন্টু',
  authorName = 'মন্টু মিয়া',
  authorChar = 'ম',
  authorAvatarGrad = 'linear-gradient(135deg,#1B6B5A,#4ECDC4)',
  timeString = '৩ ঘন্টা আগে · 3 hours ago',
  locationString = 'ঢাকা · Dhaka',
  postText = 'আজকে আমাদের মহল্লায় মন্টু ভাইয়ের বাড়িতে একটা বিশাল দাওয়াত হলো! 🎉 সবাই মিলে কত্ত মজা করলাম। এই মুহূর্তগুলো সারাজীবন মনে থাকবে।',
  imageEmoji = '🎉',
  imageCaption = 'দাওয়াতের স্মৃতি — মন্টু ভাইয়ের বাড়ি, ঢাকা',
  initialReactCount = 148,
  commentCountText = '৩২টি মন্তব্য',
  initiallyReacted = true
}) {
  const [reacted, setReacted] = useState(initiallyReacted);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleReactClick = () => {
    setReacted(!reacted);
  };

  const reactCountDisplay = reacted
    ? initialReactCount + (initiallyReacted ? 0 : 1)
    : initialReactCount - (initiallyReacted ? 1 : 0);

  return (
    <div className="post-card">
      {/* Subtle Matched Post Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 16px 0' }}>
        <div className="rc-icon rci-post" style={{ width: '26px', height: '26px', borderRadius: '8px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-bn)', fontSize: '11.5px', color: 'var(--text-light)' }}>
          মিলে যাওয়া পোস্ট
        </span>
        <span style={{ fontFamily: 'var(--font-en)', fontSize: '9.5px', color: 'var(--text-xlight)' }}>
          / Matched Post
        </span>
      </div>

      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="post-av" style={{ background: authorAvatarGrad }}>
            {authorChar}
          </div>
          <div>
            <div className="post-name">{highlightMatch(authorName, searchQuery)}</div>
            <div className="post-meta-row">
              <div className="post-time-chip">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {timeString}
              </div>
              <div className="post-loc-chip">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {locationString}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
          {/* Follow toggle button */}
          <button
            className="post-follow-chip"
            style={isFollowing ? { background: 'var(--teal-xpale)', borderColor: 'var(--teal-pale)', color: 'var(--teal-light)' } : {}}
            onClick={() => setIsFollowing(!isFollowing)}
          >
            {isFollowing ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>ফলো করা</span>
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>ফলো করো</span>
              </>
            )}
          </button>
          
          <button className="post-options-btn" aria-label="More options">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Post Text */}
      <div className="post-text">
        {highlightMatch(postText, searchQuery)}
      </div>

      {/* Post Image Wrap */}
      <div className="post-img-wrap">
        <div className="post-img-placeholder">
          <div className="pip-overlay"></div>
          <div className="pip-emoji">{imageEmoji}</div>
          <div className="pip-label">
            <div className="pip-caption">{imageCaption}</div>
          </div>
        </div>
      </div>

      {/* Reaction Bar */}
      <div className="post-reaction-bar">
        <div className="prb-left">
          <div className="prb-emoji-stack">
            <div className="prb-emoji">❤️</div>
            <div className="prb-emoji">😂</div>
            <div className="prb-emoji">🎉</div>
          </div>
          <span className="prb-react-count">{reactCountDisplay}</span>
        </div>
        <div className="prb-right">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span className="prb-comments">{commentCountText}</span>
        </div>
      </div>

      {/* Post Action Buttons */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${reacted ? 'reacted' : ''}`}
          onClick={handleReactClick}
        >
          {reacted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--coral)" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          )}
          <span>পছন্দ · Like</span>
        </button>
        <button className="post-action-btn" onClick={() => alert('Comment button clicked')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span>মন্তব্য · Comment</span>
        </button>
        <button className="post-action-btn" onClick={() => alert('Share button clicked')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>শেয়ার · Share</span>
        </button>
      </div>
    </div>
  );
}
