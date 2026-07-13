import React, { useState, useMemo } from 'react';
import FriendCard from './FriendCard';
import { toBnNumber, timeAgo } from './friendsHelpers';

export default function AllFriendsView({ friends = [], searchQuery = '', onMessage, onUnfriend }) {
  const [sortBy, setSortBy] = useState('recent');

  const displayFriends = useMemo(() => {
    let list = friends.map(f => ({
      ...f,
      sinceLabel: timeAgo(f.since),
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [friends, sortBy, searchQuery]);

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <div className="fp-section-title-group">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">তোমার বন্ধুরা</span>
            <span className="fp-st-en">Your Friends</span>
          </h3>
          <span className="fp-section-count">{toBnNumber(friends.length)} জন</span>
        </div>
        <div className="fp-sort-wrap">
          <select
            className="fp-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="recent">সম্প্রতি যোগ হয়েছে · Recently Added</option>
            <option value="name">নাম অনুযায়ী · Alphabetical</option>
          </select>
          <svg className="fp-sort-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      {displayFriends.length === 0 ? (
        <div className="fp-empty">
          <div className="fp-empty-icon">👥</div>
          <p className="fp-empty-bn">কোনো বন্ধু পাওয়া যায়নি</p>
          <p className="fp-empty-en">No friends found</p>
        </div>
      ) : (
        <div className="fp-grid">
          {displayFriends.map(friend => (
            <FriendCard
              key={friend.friendshipId}
              friend={friend}
              onMessage={onMessage}
              onUnfriend={onUnfriend}
            />
          ))}
        </div>
      )}
    </div>
  );
}
