import { useState } from 'react';

const WatchSidebar = ({ activeNav, onNavChange, activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', bn: 'সব', en: 'All' },
    { id: 'music', bn: 'সঙ্গীত', en: 'Music' },
    { id: 'gaming', bn: 'গেমিং', en: 'Gaming' },
    { id: 'news', bn: 'খবর', en: 'News' },
    { id: 'sports', bn: 'খেলা', en: 'Sports' },
    { id: 'fun', bn: 'মজার', en: 'Fun' },
    { id: 'cooking', bn: 'রান্না', en: 'Cooking' },
    { id: 'education', bn: 'শিক্ষা', en: 'Education' },
  ];

  const navItems = [
    { id: 'foryou', icon: '📺', iconClass: 'sni-foryou', bn: 'আপনার জন্য', en: 'For You' },
    { id: 'following', icon: '👥', iconClass: 'sni-follow', bn: 'অনুসরণকারী', en: 'Following' },
    { id: 'live', icon: '🔴', iconClass: 'sni-live', bn: 'লাইভ', en: 'Live', live: true },
    { id: 'saved', icon: '🔖', iconClass: 'sni-saved', bn: 'সংরক্ষিত', en: 'Saved' },
    { id: 'yourvideos', icon: '🎞️', iconClass: 'sni-yours', bn: 'আপনার ভিডিও', en: 'Your Videos', badge: '3' },
  ];

  return (
    <aside className="sidebar-left">
      <div className="sb-brand-hdr">
        <div className="sb-title-wrap">
          <div className="sb-icon">
            <span style={{ fontSize: '16px' }}>▶️</span>
          </div>
          <div>
            <div className="sb-title-bn">ওয়াচ</div>
            <div className="sb-title-en">Watch</div>
          </div>
        </div>
      </div>

      <div className="sb-cat-strip">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.bn}
          </button>
        ))}
      </div>

      <div className="sb-nav-section">
        <div className="sb-nav-lbl">BROWSE</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sb-nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => onNavChange(item.id)}
          >
            <div className={`sni-icon ${item.iconClass}`}>
              <span>{item.icon}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div className="sni-bn">{item.bn}</div>
              <div className="sni-en">{item.en}</div>
            </div>
            {item.live && <div className="sni-live-dot" />}
            {item.badge && <div className="sni-badge">{item.badge}</div>}
          </button>
        ))}
      </div>

      <div className="sb-divider" />

      <div className="sb-upload-cta">
        <div className="sb-upload-bn">নতুন ভিডিও আপলোড করুন</div>
        <span className="sb-upload-en">Upload New Video</span>
        <button className="btn-upload">
          <span style={{ fontSize: '13px' }}>📤</span>
          আপলোড করুন
        </button>
      </div>
    </aside>
  );
};

export default WatchSidebar;
