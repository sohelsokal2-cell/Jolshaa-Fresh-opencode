import React, { useState } from 'react';
import { getAvatarColor, getInitial } from './friendsHelpers';

export default function FriendCard({ friend, onMessage, onUnfriend }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fp-card">
      <div className="fp-card-top">
        <div
          className="fp-card-avatar"
          style={{ background: friend.avatarUrl ? 'none' : getAvatarColor(friend.name) }}
        >
          {friend.avatarUrl ? (
            <img src={friend.avatarUrl} alt={friend.name} />
          ) : (
            <span className="fp-avatar-char">{getInitial(friend.name)}</span>
          )}
        </div>
        <button
          className="fp-card-more"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="More options"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
          </svg>
        </button>
        {menuOpen && (
          <div className="fp-card-menu" onMouseLeave={() => setMenuOpen(false)}>
            <button
              className="fp-card-menu-item fp-menu-danger"
              onClick={() => { onUnfriend?.(friend); setMenuOpen(false); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
              আনফ্রেন্ড করো / Unfriend
            </button>
          </div>
        )}
      </div>
      <div className="fp-card-info">
        <span className="fp-card-name">{friend.name}</span>
        {friend.mutual != null && (
          <span className="fp-card-mutual">{friend.mutual} জন পারস্পরিক বন্ধু · {friend.mutual} mutual</span>
        )}
        {friend.since && (
          <span className="fp-card-since">{friend.sinceLabel || ''}</span>
        )}
      </div>
      <button className="fp-card-msg-btn" onClick={() => onMessage?.(friend)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        বার্তা পাঠাও / Message
      </button>
    </div>
  );
}
