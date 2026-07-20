import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AVATAR_COLORS = [
  'linear-gradient(135deg,#1B6B5A,#2a9678)',
  'linear-gradient(135deg,#E85C4A,#f0816e)',
  'linear-gradient(135deg,#D4A04A,#e8c06a)',
  'linear-gradient(135deg,#4A7AE8,#6e9af0)',
  'linear-gradient(135deg,#8B5CF8,#a78bfa)',
  'linear-gradient(135deg,#EC4899,#f472b6)',
  'linear-gradient(135deg,#14B8A6,#5eead4)',
];
function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function FriendsPreviewPanel({ friends = [], totalCount = 0, isOwnProfile, showFullList = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const displayList = showFullList ? friends : friends.slice(0, 6);
  const filteredFriends = displayList.filter(friend =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFriendClick = (friend) => {
    navigate(`/profile/${friend.id}`);
  };

  if (friends.length === 0) {
    return (
      <div className="support-panel" aria-label="Friends tab preview">
        <div className="support-panel-header">
          <div className="sp-title">
            <span className="sp-title-bn">বন্ধু</span>
            <span className="sp-title-en">Friends · {totalCount}</span>
          </div>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          {isOwnProfile ? 'এখনো কোনো বন্ধু নেই।' : 'কোনো বন্ধু নেই।'}
        </div>
      </div>
    );
  }

  return (
    <div className="support-panel" aria-label="Friends tab preview">
      <div className="support-panel-header">
        <div className="sp-title">
          <span className="sp-title-bn">বন্ধু</span>
          <span className="sp-title-en">Friends · {totalCount}</span>
        </div>
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
            onClick={() => handleFriendClick(friend)}
          >
            <div className="fmg-photo">
              {friend.profile_photo_url ? (
                <img
                  src={friend.profile_photo_url}
                  alt={friend.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <div
                  className="fmg-ph-inner"
                  style={{
                    background: getAvatarColor(friend.name || ''),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    fontSize: '20px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-bn)',
                  }}
                >
                  {friend.name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="fmg-name">{friend.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
