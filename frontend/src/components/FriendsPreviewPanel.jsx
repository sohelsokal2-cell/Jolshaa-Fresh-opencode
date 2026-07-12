import React, { useState } from 'react';

const DEFAULT_FRIENDS = [
  { id: 1, name: 'রাহেলা বেগম', avatarChar: 'র', avatarClass: 'fa-1', mutualCount: '১২' },
  { id: 2, name: 'করিম উদ্দিন', avatarChar: 'ক', avatarClass: 'fa-2', mutualCount: '৮' },
  { id: 3, name: 'তানভীর', avatarChar: 'ত', avatarClass: 'fa-3', mutualCount: '৫' },
  { id: 4, name: 'সামিয়া আক্তার', avatarChar: 'স', avatarClass: 'fa-4', mutualCount: '১৫' },
  { id: 5, name: 'নাবিলা', avatarChar: 'না', avatarClass: 'fa-5', mutualCount: '৩' },
  { id: 6, name: 'ফারহান', avatarChar: 'ফ', avatarClass: 'fa-6', mutualCount: '৭' },
];

export default function FriendsPreviewPanel({
  friends = DEFAULT_FRIENDS,
  totalCount = 89,
  onSeeAllClick,
  onFriendClick
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="support-panel" aria-label="Friends tab preview">
      <div className="support-panel-header">
        <div className="sp-title">
          <span className="sp-title-bn">বন্ধু</span>
          <span className="sp-title-en">Friends · {totalCount}</span>
        </div>
        <button
          className="sp-see-all"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={onSeeAllClick}
        >
          সব দেখুন · See all
        </button>
      </div>

      <div className="friends-mini-search">
        <div className="fms-inner">
          <span className="fms-icon">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="বন্ধু খুঁজুন... / Search friends"
            aria-label="Search friends"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="friends-mini-grid">
        {filteredFriends.map(friend => (
          <div
            key={friend.id}
            className="fmg-card"
            onClick={() => onFriendClick?.(friend)}
          >
            <div className="fmg-photo">
              <div className={`fmg-ph-inner ${friend.avatarClass || 'fa-1'}`}>
                {friend.avatarChar}
              </div>
            </div>
            <div className="fmg-name">{friend.name}</div>
            <div className="fmg-mutual">{friend.mutualCount} mutual</div>
          </div>
        ))}
      </div>
    </div>
  );
}
