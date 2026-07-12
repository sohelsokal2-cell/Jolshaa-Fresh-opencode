import React, { useState } from 'react';

const DEFAULT_GROUPS = [
  {
    id: 1,
    name: 'বাংলাদেশ ট্রাভেল ক্লাব',
    emoji: '✈️',
    gradient: 'linear-gradient(135deg,#22d3ee,#0891b2)',
    statusClass: 'status-active-now',
    statusTextBn: 'এখনই সক্রিয়',
    statusTextEn: 'Active now'
  },
  {
    id: 2,
    name: 'রান্নাঘর',
    emoji: '🍛',
    gradient: 'linear-gradient(135deg,#fde68a,#f59e0b)',
    statusClass: 'status-recent',
    statusTextBn: '৩৫ মিনিট আগে সক্রিয়',
    statusTextEn: 'Active 35m ago'
  },
  {
    id: 3,
    name: 'ঢাকা ফটোগ্রাফি',
    emoji: '📷',
    gradient: 'linear-gradient(135deg,#c4b5fd,#7c3aed)',
    statusClass: 'status-hours',
    statusTextBn: '২ ঘণ্টা আগে সক্রিয়',
    statusTextEn: 'Active 2h ago'
  },
  {
    id: 4,
    name: 'খেলাধুলার আসর',
    emoji: '⚽',
    gradient: 'linear-gradient(135deg,#bbf7d0,#16a34a)',
    statusClass: 'status-hours',
    statusTextBn: '৫ ঘণ্টা আগে সক্রিয়',
    statusTextEn: 'Active 5h ago'
  },
  {
    id: 5,
    name: 'বই পড়ুয়া',
    emoji: '📚',
    gradient: 'linear-gradient(135deg,#fde2c5,#f97316)',
    statusClass: 'status-days',
    statusTextBn: '২ দিন আগে সক্রিয়',
    statusTextEn: 'Active 2 days ago'
  }
];

export default function GroupsSidebar({
  isOpen = false,
  onToggleSidebar,
  groups = DEFAULT_GROUPS,
  initialActiveNav = 'feed'
}) {
  const [activeNav, setActiveNav] = useState(initialActiveNav);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`sidebar-left ${isOpen ? 'open' : ''}`} aria-label="Groups navigation sidebar">
      {/* Header */}
      <div className="sb-header">
        <div className="sb-header-titles">
          <div className="sb-header-title-bn">গ্রুপ</div>
          <div className="sb-header-title-en">Groups</div>
        </div>
        <button className="sb-settings-btn" aria-label="Group settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="sb-search">
        <span className="sb-search-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="গ্রুপ খুঁজুন... / Search groups..."
          aria-label="Search groups"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Navigation items */}
      <nav className="sb-nav-block" aria-label="Groups sub-navigation">
        <a
          href="#"
          className={`sb-nav-item ${activeNav === 'feed' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveNav('feed'); }}
          aria-current={activeNav === 'feed' ? 'page' : undefined}
        >
          <div className="sb-nav-icon icon-feed">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1B6B5A" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">তোমার ফিড</div>
            <div className="sb-nav-text-en">Your Feed</div>
          </div>
        </a>
        <a
          href="#"
          className={`sb-nav-item ${activeNav === 'discover' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveNav('discover'); }}
          aria-current={activeNav === 'discover' ? 'page' : undefined}
        >
          <div className="sb-nav-icon icon-discover">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D4A04A" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">আবিষ্কার করো</div>
            <div className="sb-nav-text-en">Discover</div>
          </div>
        </a>
        <a
          href="#"
          className={`sb-nav-item ${activeNav === 'mygroups' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveNav('mygroups'); }}
          aria-current={activeNav === 'mygroups' ? 'page' : undefined}
        >
          <div className="sb-nav-icon icon-mygroup">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E85C4A" strokeWidth="2.2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">তোমার গ্রুপ</div>
            <div className="sb-nav-text-en">Your Groups</div>
          </div>
        </a>
      </nav>

      {/* Create Group button */}
      <button className="sb-create-btn" aria-label="নতুন গ্রুপ তৈরি করো — Create New Group">
        <div className="sb-create-plus" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div>
          <div className="sb-create-text-bn">নতুন গ্রুপ তৈরি করো</div>
          <div className="sb-create-text-en">Create New Group</div>
        </div>
      </button>

      {/* Joined Groups header */}
      <div className="sb-section-header">
        <div className="sb-section-titles">
          <div className="sb-section-title-bn">যে গ্রুপে যোগ দিয়েছো</div>
          <div className="sb-section-title-en">Groups You've Joined</div>
        </div>
        <a href="#" className="sb-see-all" aria-label="See all joined groups" onClick={(e) => e.preventDefault()}>সব দেখো</a>
      </div>

      {/* Joined group list */}
      <div className="sb-group-list" role="list">
        {filteredGroups.map(group => (
          <a
            key={group.id}
            href="#"
            className={`sb-group-item ${group.statusClass}`}
            role="listitem"
            aria-label={`${group.name} — ${group.statusTextBn}`}
            onClick={(e) => e.preventDefault()}
          >
            <div className="sb-group-thumb">
              <div className="sb-group-thumb-inner" style={{ background: group.gradient }}>
                {group.emoji}
              </div>
            </div>
            <div className="sb-group-info">
              <div className="sb-group-name-bn">{group.name}</div>
              <div className="sb-group-status">
                <span className="sb-status-dot" aria-hidden="true"></span>
                <div>
                  <div className="sb-status-text-bn">{group.statusTextBn}</div>
                  <div className="sb-status-text-en">{group.statusTextEn}</div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </aside>
  );
}
