import React from 'react';

export default function ChatHeader({
  activeConversation,
  isGroup,
  otherName,
  avatarChar,
  avatarClass,
  presenceText,
  memberCount,
  activeCount,
  onVoiceCall,
  onVideoCall,
  onToggleInfo,
}) {
  if (!activeConversation) return null;

  return (
    <div className="chat-header">
      <div className="chat-contact-av-wrap">
        <div className={`chat-contact-av ${avatarClass}`}>{avatarChar}</div>
        {!isGroup && presenceText?.text === 'অনলাইন' && <span className="chat-online-dot"></span>}
      </div>
      <div className="chat-contact-info">
        <div className="chat-contact-name">{otherName}</div>
        {isGroup ? (
          <div className="chat-contact-status">
            <span className="chat-status-en">{memberCount} জন সদস্য · {memberCount} members</span>
            <span className="chat-status-en" style={{ marginLeft: '4px' }}>· {activeCount || memberCount} active now</span>
          </div>
        ) : presenceText ? (
          <div className="chat-contact-status">
            {presenceText.text === 'অনলাইন' && <span className="chat-status-dot"></span>}
            <span className="chat-status-bn">{presenceText.bn}</span>
            <span className="chat-status-en">· Active now</span>
          </div>
        ) : null}
      </div>

      <div className="chat-actions">
        <button
          className="chat-action-btn"
          title="অডিও কল / Voice call"
          onClick={onVoiceCall}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94"/>
            <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17l-.08-.08z"/>
          </svg>
        </button>

        <button
          className="chat-action-btn"
          title="ভিডিও কল / Video call"
          onClick={onVideoCall}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 10l4.553-2.07A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.94L15 14"/>
            <rect x="1" y="7" width="14" height="11" rx="3"/>
            <circle cx="7" cy="12" r="2" fill="currentColor" opacity="0.25"/>
          </svg>
        </button>

        <button className="chat-action-btn" title="চ্যাট তথ্য / Chat Info" onClick={onToggleInfo}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
