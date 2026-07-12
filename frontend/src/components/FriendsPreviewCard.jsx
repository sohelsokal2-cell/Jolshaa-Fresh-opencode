import React from 'react';

const DEFAULT_FRIENDS = [
  { id: 1, name: 'রাহেলা বেগম', avatarChar: 'র', avatarClass: 'fa-1', mutualCount: '১২' },
  { id: 2, name: 'করিম উদ্দিন', avatarChar: 'ক', avatarClass: 'fa-2', mutualCount: '৮' },
  { id: 3, name: 'তানভীর আহমেদ', avatarChar: 'ত', avatarClass: 'fa-3', mutualCount: '৫' },
  { id: 4, name: 'সামিয়া আক্তার', avatarChar: 'স', avatarClass: 'fa-4', mutualCount: '১৫' },
  { id: 5, name: 'নাবিলা ইসলাম', avatarChar: 'না', avatarClass: 'fa-5', mutualCount: '৩' },
  { id: 6, name: 'ফারহান হোসেন', avatarChar: 'ফ', avatarClass: 'fa-6', mutualCount: '৭' },
  { id: 7, name: 'মিমি আক্তার', avatarChar: 'মি', avatarClass: 'fa-7', mutualCount: '২১' },
  { id: 8, name: 'জাহিদ হাসান', avatarChar: 'জা', avatarClass: 'fa-8', mutualCount: '৪' },
  { id: 9, name: 'লিমা রহমান', avatarChar: 'লি', avatarClass: 'fa-9', mutualCount: '৯' },
];

export default function FriendsPreviewCard({
  friends = DEFAULT_FRIENDS,
  totalFriendsCount = 89,
  onSeeAllClick,
  onFriendClick
}) {
  return (
    <div className="profile-card" aria-label="Friends preview card">
      <div className="friends-header-row">
        <div>
          <div className="card-title-bn">বন্ধু</div>
          <div className="card-title-en">Friends</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <span className="friends-count">{totalFriendsCount} জন · {totalFriendsCount} friends</span>
          <button
            className="see-all-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'right' }}
            aria-label="সব বন্ধু দেখুন / See all friends"
            onClick={onSeeAllClick}
          >
            সব দেখুন · See all
          </button>
        </div>
      </div>

      <div className="friends-grid" role="list" aria-label="Friends preview grid">
        {friends.map(friend => (
          <div
            key={friend.id}
            className="friend-card"
            role="listitem"
            tabIndex="0"
            aria-label={`বন্ধু ${friend.name}`}
            onClick={() => onFriendClick?.(friend)}
          >
            <div className="friend-photo">
              <div className={`friend-photo-fallback ${friend.avatarClass || 'fa-1'}`}>
                {friend.avatarChar}
              </div>
            </div>
            <div className="friend-info">
              <div className="friend-name">{friend.name}</div>
              <div className="friend-mutual">{friend.mutualCount} mutual</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
