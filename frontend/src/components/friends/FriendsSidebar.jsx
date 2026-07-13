import React from 'react';
import { toBnNumber } from './friendsHelpers';

export default function FriendsSidebar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  requestCount = 0,
}) {
  const tabs = [
    { id: 'all', bn: 'সব বন্ধু', en: 'All Friends', count: null },
    { id: 'requests', bn: 'বন্ধুর অনুরোধ', en: 'Friend Requests', count: requestCount },
    { id: 'sent', bn: 'পাঠানো অনুরোধ', en: 'Sent Requests', count: null },
    { id: 'suggestions', bn: 'পরিচিতি হতে পারেন', en: 'People You May Know', count: null },
    { id: 'birthdays', bn: 'জন্মদিন', en: 'Birthdays', count: null },
  ];

  return (
    <aside className="fp-sidebar">
      <div className="fp-sidebar-head">
        <h2 className="fp-sidebar-title">
          <span className="fp-title-bn">বন্ধুরা</span>
          <span className="fp-title-en">Friends</span>
        </h2>
      </div>

      <div className="fp-search-wrap">
        <svg className="fp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          className="fp-search-input"
          placeholder="বন্ধু খুঁজুন... / Search friends..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <nav className="fp-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`fp-tab ${activeTab === tab.id ? 'fp-tab-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="fp-tab-text">
              <span className="fp-tab-bn">{tab.bn}</span>
              <span className="fp-tab-en">{tab.en}</span>
            </div>
            {tab.count != null && tab.count > 0 && (
              <span className="fp-tab-badge">{toBnNumber(tab.count)}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
