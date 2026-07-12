import React, { useState } from 'react';

const NAV_ITEMS = [
  {
    id: 'for-you',
    labelBn: 'তোমার জন্য',
    labelEn: 'For You',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
  {
    id: 'following',
    labelBn: 'ফলো করা',
    labelEn: 'Following',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="9" cy="7" r="3.5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M1 21c0-4 3.6-7 8-7s8 3 8 7" />
        <path d="M19 21c0-2.5-1.5-4.5-4-5.5" />
      </svg>
    ),
  },
  {
    id: 'my-reels',
    labelBn: 'আমার রিলস',
    labelEn: 'My Reels',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="4" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
  },
  {
    id: 'profile',
    labelBn: 'প্রোফাইল',
    labelEn: 'Profile',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function ReelsSidebar() {
  const [activeNav, setActiveNav] = useState('for-you');

  return (
    <aside className="reels-sidebar" aria-label="Reels navigation sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-bn">রিলস</div>
        <div className="sidebar-title-en">Reels &amp; Shorts</div>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
          role="button"
          tabIndex="0"
          aria-current={activeNav === item.id ? 'page' : undefined}
          onClick={() => setActiveNav(item.id)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveNav(item.id); }}
        >
          <div className="sidebar-nav-icon">{item.icon}</div>
          <div>
            <div className="sidebar-nav-text-bn">{item.labelBn}</div>
            <div className="sidebar-nav-text-en">{item.labelEn}</div>
          </div>
        </div>
      ))}

      <div className="sidebar-divider"></div>

      {/* Liked / Saved */}
      <div className="sidebar-settings-item" tabIndex="0" role="button">
        <svg className="sidebar-settings-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        <span className="sidebar-settings-text" style={{ fontFamily: 'var(--font-bn)', color: 'var(--text-grey)', fontSize: 12 }}>
          পছন্দ করা রিলস
        </span>
      </div>
      <div className="sidebar-settings-item" tabIndex="0" role="button">
        <svg className="sidebar-settings-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
        <span className="sidebar-settings-text" style={{ fontFamily: 'var(--font-bn)', color: 'var(--text-grey)', fontSize: 12 }}>
          সেভ করা রিলস
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }}></div>

      {/* Create Reel CTA */}
      <button
        className="sidebar-create-btn"
        aria-label="নতুন রিলস তৈরি করুন / Create Reel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-bn)', fontSize: 13, fontWeight: 700, color: 'white' }}>নতুন রিলস</div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: 9, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>Create Reel</div>
        </div>
      </button>
    </aside>
  );
}
