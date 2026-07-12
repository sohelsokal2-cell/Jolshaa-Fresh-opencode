import React from 'react';

const CATEGORIES = [
  {
    section: 'General',
    items: [
      { id: 'account', bn: 'অ্যাকাউন্ট', en: 'Account', iconClass: 'icon-account',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { id: 'privacy', bn: 'গোপনীয়তা', en: 'Privacy', iconClass: 'icon-privacy',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
      { id: 'security', bn: 'নিরাপত্তা', en: 'Security', iconClass: 'icon-security',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
      { id: 'notif', bn: 'নোটিফিকেশন', en: 'Notifications', iconClass: 'icon-notif',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
      { id: 'lang', bn: 'ভাষা', en: 'Language', iconClass: 'icon-lang',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
      { id: 'block', bn: 'ব্লক তালিকা', en: 'Blocked List', iconClass: 'icon-block',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
    ],
  },
  {
    section: 'Creator',
    items: [
      { id: 'money', bn: 'মনিটাইজেশন', en: 'Monetization', iconClass: 'icon-money',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    ],
  },
  {
    section: 'Support',
    items: [
      { id: 'help', bn: 'সাহায্য কেন্দ্র', en: 'Help Center', iconClass: 'icon-help',
        svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    ],
  },
];

export default function SettingsSidebar({ activeCategory, onCategoryChange, user = {} }) {
  const userName = user.name || 'আরিফ হোসেন';
  const userHandle = user.handle || '@arif.hossain · Jolshaa';
  const userInitial = user.initial || 'আ';

  return (
    <aside className="sidebar-left" aria-label="Settings navigation">
      <div className="sb-hdr">
        <div className="sb-hdr-icon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
        <div>
          <div className="sb-title-bn">সেটিংস</div>
          <div className="sb-title-en">Settings</div>
        </div>
      </div>

      {/* User mini-card */}
      <div className="sb-user-card">
        <div className="suc-av">{userInitial}</div>
        <div>
          <div className="suc-name">{userName}</div>
          <div className="suc-handle">{userHandle}</div>
        </div>
      </div>

      {CATEGORIES.map((group) => (
        <div className="sb-cat-section" key={group.section}>
          <div className="sb-cat-lbl">{group.section}</div>
          {group.items.map((item) => (
            <button
              key={item.id}
              className={`sb-cat-item ${activeCategory === item.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(item.id)}
            >
              <div className={`sci-icon ${item.iconClass}`}>{item.svg}</div>
              <div className="sci-text">
                <div className="sci-bn">{item.bn}</div>
                <div className="sci-en">{item.en}</div>
              </div>
              <svg className="sci-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
