import React from 'react';

export default function PageCard({
  id,
  name = 'দৈনিক বাংলাদেশ টাইমস',
  type = 'সংবাদ ও মিডিয়া · News & Media Page',
  followersCountBn = '৪৫,৮৩২ অনুসারী',
  followersCountEn = '45.8K Followers',
  emoji = '📰',
  thumbGradient = 'linear-gradient(140deg,#1B6B5A,#4ECDC4)',
  accentColor = 'teal', // 'teal' | 'coral' | 'purple'
  notificationCount = 3,
  messageCount = 12,
  reachCount = '৮.৩K',
  isDropdownOpen = false,
  onDropdownToggle,
  onCreatePostClick,
  onPromoteClick
}) {
  return (
    <div className={`page-card pc-${accentColor}`}>
      <div className="pc-main">
        {/* Thumbnail */}
        <div className="pc-thumb" style={{ background: thumbGradient }}>
          {emoji}
        </div>

        {/* Info */}
        <div className="pc-info">
          <div className="pc-name">{name}</div>
          <div className="pc-type">{type}</div>
          <div className="pc-followers-row">
            <span className="pc-fol-bn">{followersCountBn}</span>
            <span className="pc-fol-dot">·</span>
            <span className="pc-fol-en">{followersCountEn}</span>
          </div>

          {/* Chips */}
          <div className="pc-chips">
            <div
              className="pc-chip chip-notif"
              style={notificationCount === 0 ? { opacity: 0.5 } : {}}
            >
              <div className="chip-icon-half">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <div className="chip-body">
                <span className="chip-num">{notificationCount}</span>
                <span className="chip-lbn">বিজ্ঞপ্তি</span>
                <span className="chip-len">Notifs</span>
              </div>
            </div>

            <div
              className="pc-chip chip-msg"
              style={messageCount === 0 ? { opacity: 0.5 } : {}}
            >
              <div className="chip-icon-half">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <div className="chip-body">
                <span className="chip-num">{messageCount}</span>
                <span className="chip-lbn">বার্তা</span>
                <span className="chip-len">Msgs</span>
              </div>
            </div>
          </div>
        </div>

        {/* More Actions Dropdown */}
        <div className="pc-more-wrap">
          <button
            className={`pc-more-btn ${isDropdownOpen ? 'is-open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onDropdownToggle?.();
            }}
            aria-expanded={isDropdownOpen}
            aria-label="More options"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
          
          <div className={`pc-dropdown ${isDropdownOpen ? 'open' : ''}`} role="menu">
            <div className="dd-item" role="menuitem" onClick={() => alert(`${name} page switched!`)}>
              <div className="dd-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 3a2.828 2.828 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </div>
              <div>
                <div className="dd-item-bn">এখনই সুইচ করো</div>
                <div className="dd-item-en">Switch to this Page</div>
              </div>
            </div>
            
            <div className="dd-item" role="menuitem" onClick={() => alert('Link copied!')}>
              <div className="dd-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div>
                <div className="dd-item-bn">লিংক কপি করো</div>
                <div className="dd-item-en">Copy Page Link</div>
              </div>
            </div>

            <div className="dd-item" role="menuitem" onClick={() => alert('Shared!')}>
              <div className="dd-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </div>
              <div>
                <div className="dd-item-bn">শেয়ার করো</div>
                <div className="dd-item-en">Share this Page</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pc-actions">
        <button
          className="btn-pc-post"
          onClick={() => onCreatePostClick?.(id)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <div>
            <div className="btn-pc-post-bn">পোস্ট তৈরি করো</div>
            <div className="btn-pc-post-en">Create Post</div>
          </div>
        </button>

        <button
          className="btn-pc-promote"
          onClick={() => onPromoteClick?.(id)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7a4f00" strokeWidth="2.2" strokeLinecap="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <div>
            <div className="btn-pc-promote-bn">প্রচার করো</div>
            <div className="btn-pc-promote-en">Promote</div>
          </div>
        </button>

        <div className="pc-perf">
          <span className="pc-perf-lbl">এ সপ্তাহে ·</span>
          <div className="pc-reach-pill">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
            <span className="pc-reach-val">{reachCount}</span>
            <span className="pc-reach-en">reach</span>
          </div>
        </div>
      </div>
    </div>
  );
}
