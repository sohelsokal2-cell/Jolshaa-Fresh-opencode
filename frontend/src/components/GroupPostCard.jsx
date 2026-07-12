import React, { useState } from 'react';

export default function GroupPostCard({
  groupName = 'রান্নাঘর',
  groupIcon = '🍛',
  groupGradStyle = 'linear-gradient(135deg,#fde68a,#f59e0b)',
  memberCount = '১২,০৫৮ सदस्य',
  privacy = 'Private',
  authorName = 'তানভীর আহমেদ',
  authorAvatarClass = 'av-2',
  authorAvatarChar = 'ত',
  time = '৪৫ মিনিট আগে · 45 minutes ago',
  text = 'আজকের দুপুরের রান্না! কী খেয়েছেন সবাই?',
  isLargeText = false,
  hasMedia = false,
  mediaEmoji = '🍛',
  mediaGradClass = 'media-grad-1',
  reactions = ['😂', '❤️'],
  reactionsCount = '৯৬ জন',
  commentCount = '২৩টি মন্তব্য',
  shareCount = '',
  initiallyLiked = false,
  children
}) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [likeOffset, setLikeOffset] = useState(0);

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikeOffset(-1);
    } else {
      setLiked(true);
      setLikeOffset(1);
    }
  };

  // Parsing reactions count display
  let displayReactionsText = reactionsCount;
  if (likeOffset !== 0) {
    // If we liked/unliked, adjust count dynamically for better UX
    // Since it's a string like "৯৬ জন" or "৩৪৬ জন", we can just append or keep it as is,
    // but we can also display a count. Let's do a simple count translation or just update the display text.
    // e.g. "৯৬ জন" -> "৯৭ জন" (or similar).
    // Let's check: "৯৬" in Bengali is 96. If liked, we can show "৯৭ জন", if not, "৯৫ জন".
    // Let's write a simple helper or just show "৯৬+ জন".
    // Even simpler, if liked, append "+১", or just display a translated number or string.
    // Since it is structure-only, we can also just show the default text or adjust if possible.
    // Let's do: if liked, we display "৯৭ জন" (if it was ৯৬ জন), if unliked, "৯৬ জন".
    if (reactionsCount === '৯৬ জন') {
      displayReactionsText = liked ? '৯৭ জন' : '৯৬ জন';
    } else if (reactionsCount === '৩৪৬ জন') {
      displayReactionsText = liked ? '৩৪৭ জন' : '৩৪৬ জন';
    } else if (reactionsCount === '১৫ জন') {
      displayReactionsText = liked ? '১৬ জন' : '১৫ জন';
    }
  }

  return (
    <article className="post-card" aria-label={`Post in ${groupName} by ${authorName}`}>
      {/* Group context */}
      <div className="post-group-ctx">
        <div className="post-group-left">
          <div className="post-group-thumb" aria-hidden="true" style={{ background: groupGradStyle }}>
            {groupIcon}
          </div>
          <div>
            <div className="post-group-name-bn" tabIndex={0} role="link">{groupName}</div>
            <div className="post-group-meta">
              <span className="post-group-members">{memberCount}</span>
              <span className="post-group-sep">·</span>
              <span className="post-group-privacy">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                {privacy}
              </span>
            </div>
          </div>
        </div>
        <button className="post-more-btn" aria-label="Post options">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Author */}
      <div className="post-author">
        <div className={`post-avatar ${authorAvatarClass}`} aria-hidden="true">
          {authorAvatarChar}
        </div>
        <div>
          <div className="post-author-name" tabIndex={0} role="link">{authorName}</div>
          <div className="post-author-time">{time}</div>
        </div>
      </div>

      {/* Post text */}
      <div className={`post-text ${isLargeText ? 'large' : ''}`}>{text}</div>

      {/* Conditionally rendered children (e.g. PollBlock) */}
      {children}

      {/* Conditionally rendered media placeholder */}
      {hasMedia && (
        <div className="post-media-wrap">
          <div className={`post-media-placeholder ${mediaGradClass}`}>
            {mediaEmoji}
          </div>
        </div>
      )}

      {/* Reaction summary */}
      <div className="post-react-summary">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="react-emoji-row" aria-label="Reactions">
            {reactions.map((emoji, idx) => (
              <div key={idx} className="react-bubble">{emoji}</div>
            ))}
          </div>
          <span className="react-count" tabIndex={0} role="button">
            {displayReactionsText}
          </span>
        </div>
        <span className="comment-share-count" tabIndex={0} role="button">
          {commentCount} {shareCount && `· ${shareCount}`}
        </span>
      </div>

      {/* Reaction bar */}
      <div className="post-reaction-bar" role="group" aria-label="React to post">
        <button
          className={`react-btn ${liked ? 'liked' : ''}`}
          aria-pressed={liked}
          aria-label="Like post"
          onClick={handleLikeToggle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span>
            <div className="react-btn-bn">পছন্দ</div>
            <div className="react-btn-en">Like</div>
          </span>
        </button>
        <button className="react-btn" aria-label="Comment on post">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span>
            <div className="react-btn-bn">মন্তব্য</div>
            <div className="react-btn-en">Comment</div>
          </span>
        </button>
        <button className="react-btn" aria-label="Share post">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          <span>
            <div className="react-btn-bn">শেয়ার</div>
            <div className="react-btn-en">Share</div>
          </span>
        </button>
      </div>

      {/* Comment input */}
      <div className="post-comment-row">
        <div className="comment-avatar" aria-hidden="true">আ</div>
        <div className="comment-input-wrap">
          <input
            className="comment-input"
            type="text"
            placeholder="মন্তব্য করো... / Comment..."
            aria-label="Write a comment"
          />
          <div className="comment-icon-row" aria-label="Comment attachments">
            <button className="comment-icon-btn" aria-label="Add emoji">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </button>
            <button className="comment-icon-btn" aria-label="Add GIF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M10 9v6M7 12h3M14 9v3h3M14 12v3"/></svg>
            </button>
            <button className="comment-icon-btn" aria-label="Add photo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
