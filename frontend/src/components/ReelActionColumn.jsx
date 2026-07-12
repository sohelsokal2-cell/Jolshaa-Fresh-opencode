import React, { useState, useEffect, useRef } from 'react';

export default function ReelActionColumn({ creator, likeCount, commentCount, shareCount, starCount }) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount || '১৮.৪K');
  const [isStarred, setIsStarred] = useState(false);
  const [starFeedback, setStarFeedback] = useState(null);
  const starTimerRef = useRef(null);

  const handleToggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setCurrentLikeCount(next ? '১৮.৫K' : '১৮.৪K');
      return next;
    });
  };

  const handleToggleStar = () => {
    // Clear any existing timer
    if (starTimerRef.current) {
      clearTimeout(starTimerRef.current);
    }

    setIsStarred((prev) => {
      const next = !prev;
      if (next) {
        // TODO: Open star purchase/gift-sending modal here in the future
        setStarFeedback('+ উপহার পাঠানো হয়েছে!');
        starTimerRef.current = setTimeout(() => {
          setStarFeedback(null);
          starTimerRef.current = null;
        }, 2500);
      } else {
        setStarFeedback(null);
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (starTimerRef.current) clearTimeout(starTimerRef.current);
    };
  }, []);

  return (
    <div className="action-column" aria-label="Video actions">
      {/* Creator avatar with follow + */}
      <div className="action-item action-creator-av-wrap" aria-label={`Creator profile — ${creator?.name || 'Creator'}`}>
        <div className="action-creator-av">{creator?.avatar || 'প্র'}</div>
        <span className="action-follow-plus">+</span>
      </div>

      {/* Like / Heart */}
      <div className="action-item">
        <button
          className={`action-icon-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleToggleLike}
          aria-label="পছন্দ করুন / Like"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? '#E85C4A' : 'none'} stroke={isLiked ? '#E85C4A' : 'white'} strokeWidth="2" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            <line x1="3.5" y1="12" x2="1" y2="12" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <line x1="20.5" y1="12" x2="23" y2="12" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <line x1="12" y1="1.5" x2="12" y2="0" stroke="white" strokeWidth="1.5" opacity="0.5" />
          </svg>
        </button>
        <span className="action-count" style={isLiked ? { color: '#E85C4A' } : undefined}>
          {currentLikeCount}
        </span>
        <span className="action-label-bn">পছন্দ</span>
      </div>

      {/* Comment */}
      <div className="action-item">
        <button className="action-icon-btn" aria-label="মন্তব্য / Comment">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <circle cx="8.5" cy="11" r="1" fill="white" />
            <circle cx="12" cy="11" r="1" fill="white" />
            <circle cx="15.5" cy="11" r="1" fill="white" />
          </svg>
        </button>
        <span className="action-count">{commentCount || '৩.২K'}</span>
        <span className="action-label-bn">মন্তব্য</span>
      </div>

      {/* Share */}
      <div className="action-item">
        <button className="action-icon-btn" aria-label="শেয়ার / Share">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="6.5" cy="12" r="3" />
            <path d="M9.5 12h10M17 9l3 3-3 3" />
            <path d="M9.5 9.5 Q6 5 3 8" strokeWidth="1.2" opacity="0.5" />
          </svg>
        </button>
        <span className="action-count">{shareCount || '৮৪৭'}</span>
        <span className="action-label-bn">শেয়ার</span>
      </div>

      {/* Star/Gift — Jolshaa monetization */}
      <div className="action-item">
        <button
          className={`action-icon-btn star-btn ${isStarred ? 'starred' : ''}`}
          onClick={handleToggleStar}
          aria-label="উপহার পাঠান / Send a Gift Star"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#F5C842' }} />
                <stop offset="100%" style={{ stopColor: '#D4A04A' }} />
              </linearGradient>
            </defs>
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              stroke="url(#goldGrad)"
              fill={isStarred ? 'url(#goldGrad)' : 'none'}
            />
            <circle cx="12" cy="12" r="2" fill="#D4A04A" opacity="0.4" />
          </svg>
          <span className="star-sparkle" aria-hidden="true"></span>
        </button>
        <span className="action-count" style={{ color: starFeedback ? '#D4A04A' : undefined, fontSize: starFeedback ? 9 : undefined }}>
          {starFeedback || 'উপহার'}
        </span>
        <span className="action-label-bn" style={{ color: 'rgba(212,160,74,0.7)' }}>Gift Star</span>
      </div>

      {/* More options */}
      <div className="action-item" style={{ marginTop: 6 }}>
        <button className="action-more-btn" aria-label="আরও বিকল্প / More options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
