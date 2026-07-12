import React, { useState } from 'react';

export default function PagesSidebar({
  isOpen = false,
  invitesCount = 2,
  initialActiveNav = 'manage',
  onCreatePageClick
}) {
  const [activeNav, setActiveNav] = useState(initialActiveNav);

  return (
    <aside className={`sidebar-left ${isOpen ? 'open' : ''}`} aria-label="Pages sidebar">
      <div className="sb-header">
        <div className="sb-title-bn">পেজ</div>
        <div className="sb-title-en">Pages</div>
      </div>

      <a
        href="#"
        className="btn-create-page"
        onClick={(e) => {
          e.preventDefault();
          onCreatePageClick?.();
        }}
      >
        <div className="btn-cpage-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <div>
          <div className="btn-cpage-bn">পেজ তৈরি করো</div>
          <span className="btn-cpage-en">Create New Page</span>
        </div>
      </a>

      <div className="sb-nav-block">
        <a
          href="#"
          className={`sb-nav-item ${activeNav === 'manage' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('manage');
          }}
          aria-current={activeNav === 'manage' ? 'page' : undefined}
        >
          <div className="sb-nav-icon sni-teal">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round">
              <rect x="2" y="2" width="9" height="9" rx="2"/><rect x="13" y="2" width="9" height="9" rx="2"/>
              <rect x="2" y="13" width="9" height="9" rx="2"/><path d="M18 14v5M15.5 16.5h5"/>
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">তুমি পরিচালনা করো</div>
            <div className="sb-nav-text-en">Pages You Manage</div>
          </div>
        </a>

        <a
          href="#"
          className={`sb-nav-item ${activeNav === 'discover' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('discover');
          }}
          aria-current={activeNav === 'discover' ? 'page' : undefined}
        >
          <div className="sb-nav-icon sni-purp">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/><path d="M8 11h6M11 8v6"/>
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">আবিষ্কার করো</div>
            <div className="sb-nav-text-en">Discover Pages</div>
          </div>
        </a>

        <a
          href="#"
          className={`sb-nav-item ${activeNav === 'followed' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('followed');
          }}
          aria-current={activeNav === 'followed' ? 'page' : undefined}
        >
          <div className="sb-nav-icon sni-gold">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">ফলো করা পেজ</div>
            <div className="sb-nav-text-en">Followed Pages</div>
          </div>
        </a>

        <a
          href="#"
          className={`sb-nav-item ${activeNav === 'invites' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('invites');
          }}
          aria-current={activeNav === 'invites' ? 'page' : undefined}
        >
          <div className="sb-nav-icon sni-coral">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.2" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="3"/>
              <line x1="12" y1="9" x2="12" y2="15"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">আমন্ত্রণ</div>
            <div className="sb-nav-text-en">Page Invites</div>
          </div>
          {invitesCount > 0 && (
            <div className="sb-badge">{invitesCount}</div>
          )}
        </a>
      </div>
    </aside>
  );
}
