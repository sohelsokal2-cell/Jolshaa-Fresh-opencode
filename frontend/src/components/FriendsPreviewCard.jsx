import React from 'react';
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

export default function FriendsPreviewCard({ friends = [], totalFriendsCount = 0, isOwnProfile }) {
  const navigate = useNavigate();

  const handleFriendClick = (friend) => {
    navigate(`/profile/${friend.id}`);
  };

  if (friends.length === 0) {
    return (
      <div className="profile-card" aria-label="Friends preview card">
        <div className="friends-header-row">
          <div>
            <div className="card-title-bn">বন্ধু</div>
            <div className="card-title-en">Friends</div>
          </div>
        </div>
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          {isOwnProfile ? 'এখনো কোনো বন্ধু নেই।' : 'কোনো বন্ধু নেই।'}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card" aria-label="Friends preview card">
      <div className="friends-header-row">
        <div>
          <div className="card-title-bn">বন্ধু</div>
          <div className="card-title-en">Friends</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <span className="friends-count">{totalFriendsCount} জন · {totalFriendsCount} friends</span>
        </div>
      </div>

      <div className="friends-grid" role="list" aria-label="Friends preview grid">
        {friends.slice(0, 9).map(friend => (
          <div
            key={friend.id}
            className="friend-card"
            role="listitem"
            tabIndex="0"
            aria-label={`বন্ধু ${friend.name}`}
            onClick={() => handleFriendClick(friend)}
          >
            <div className="friend-photo">
              {friend.profile_photo_url ? (
                <img
                  src={friend.profile_photo_url}
                  alt={friend.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                />
              ) : (
                <div
                  className="friend-photo-fallback"
                  style={{
                    background: getAvatarColor(friend.name || ''),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    borderRadius: '10px',
                    fontSize: '22px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-bn)',
                  }}
                >
                  {friend.name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="friend-info">
              <div className="friend-name">{friend.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
