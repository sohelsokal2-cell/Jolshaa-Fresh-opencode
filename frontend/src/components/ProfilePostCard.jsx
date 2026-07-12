import React, { useState } from 'react';
import coverPhoto from '../assets/profile_cover_photo_1783610015722.png';

export default function ProfilePostCard({ post }) {
  const [liked, setLiked] = useState(post.initiallyLiked || false);

  const toggleLike = () => {
    setLiked(prev => !prev);
  };

  // Profile-specific avatar fallback character or default
  const avatarChar = post.authorAvatarChar || 'স';

  return (
    <article className={`post-card ${post.isPinned ? 'pinned' : ''}`} aria-label={post.isPinned ? 'Pinned post' : 'Post'}>
      {/* Pinned Badge */}
      {post.isPinned && (
        <div className="pinned-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="pinned-badge-text-bn">📌 পিন করা পোস্ট</span>
          <span className="pinned-badge-text-en">· Pinned Post</span>
        </div>
      )}

      {/* Post Header */}
      <div className="post-header">
        <div className="post-av">{avatarChar}</div>
        <div className="post-meta">
          <div className="post-author">{post.authorName || 'Md Sohel'}</div>
          <div className="post-time-row">
            <span className="post-time">{post.timeString}</span>
            <div className="post-audience">
              {post.privacy === 'Public' ? (
                <>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: '3px' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10A15.3 15.3 0 018 12a15.3 15.3 0 014-10z"/>
                  </svg>
                  Public
                </>
              ) : (
                <>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: '3px' }}>
                    <circle cx="9" cy="7" r="3.5"/><path d="M3 21c0-4 3.6-6 6-6"/><path d="M16 21c0-4-3.6-6-6-6"/>
                  </svg>
                  Friends
                </>
              )}
            </div>
          </div>
        </div>
        <button className="post-options-btn" aria-label="পোস্ট বিকল্প / Post options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </div>

      {/* Post Body */}
      <div className="post-body">
        <p className="post-text-bn">{post.textBn}</p>
      </div>

      {/* Video Block */}
      {post.isVideo ? (
        <div className="post-video-block" tabIndex="0" role="button" aria-label="ভিডিও চালু করুন / Play video">
          <div className="post-video-thumb">🎬</div>
          <div className="post-video-overlay"></div>
          <div className="post-video-play">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <div className="post-video-meta">
            <div className="post-video-views">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {post.viewsCount} views
            </div>
            <div className="post-video-duration">{post.videoDuration}</div>
          </div>
        </div>
      ) : post.hasImage ? (
        /* Image Block */
        <div className="post-image-block">
          <img
            src={post.mediaSrc === 'cover' ? coverPhoto : post.mediaSrc}
            className="post-img"
            alt={post.mediaAlt || 'Post image'}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
          <div className="post-img-fallback pi-2" style={{ display: 'none' }}>🌅</div>
        </div>
      ) : post.captionIcon ? (
        /* Minimal fallback block for emojis/icon posts */
        <div className="post-image-block">
          <div className="post-img-fallback pi-1">{post.captionIcon}</div>
        </div>
      ) : null}

      {/* Post stats row */}
      <div className="post-stats-row">
        <div className="post-stat-left">
          {post.reactionsList ? (
            post.reactionsList.map((emoji, idx) => (
              <span key={idx} className="post-stat-emoji">{emoji}</span>
            ))
          ) : (
            <>
              <span className="post-stat-emoji">❤️</span>
              <span className="post-stat-emoji">😍</span>
            </>
          )}
          <span className="post-stat-count" style={{ marginLeft: '4px' }}>
            {liked ? (parseInt(post.reactionsCount) + 1) : post.reactionsCount}
          </span>
        </div>
        <div className="post-stat-right">
          <span className="post-stat-item">{post.commentsCount} মন্তব্য</span>
          <span className="post-stat-item" style={{ marginLeft: '6px' }}>{post.sharesCount} শেয়ার</span>
        </div>
      </div>

      {/* Reaction Bar */}
      <div className="post-reaction-bar">
        <button
          className={`reaction-btn ${liked ? 'liked' : ''}`}
          onClick={toggleLike}
          aria-label="পছন্দ করুন"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? '#E85C4A' : 'none'}
            stroke={liked ? '#E85C4A' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span className="reaction-btn-bn">পছন্দ · Like</span>
        </button>
        <button className="reaction-btn" aria-label="মন্তব্য করুন">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/>
          </svg>
          <span className="reaction-btn-bn">মন্তব্য · Comment</span>
        </button>
        <button className="reaction-btn" aria-label="শেয়ার করুন">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span className="reaction-btn-bn">শেয়ার · Share</span>
        </button>
      </div>
    </article>
  );
}
