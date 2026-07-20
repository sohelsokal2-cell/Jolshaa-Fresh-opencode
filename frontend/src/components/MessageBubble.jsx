import React, { useState, useRef, useEffect } from 'react';
import { toggleReaction } from '../lib/messagingApi';

/* Facebook-style reaction emojis with labels */
const REACTION_EMOJIS = [
  { emoji: '👍', label: 'লাইক', labelEn: 'Like' },
  { emoji: '❤️', label: 'ভালোবাসা', labelEn: 'Love' },
  { emoji: '😂', label: 'হাহা', labelEn: 'Haha' },
  { emoji: '😮', label: 'বাহ', labelEn: 'Wow' },
  { emoji: '😢', label: 'দুঃখিত', labelEn: 'Sad' },
  { emoji: '😡', label: 'রাগ', labelEn: 'Angry' },
];

/* Group reactions by emoji for display badge */
function groupReactions(reactions) {
  const counts = {};
  reactions.forEach(r => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  });
  return Object.entries(counts).map(([emoji, count]) => ({ emoji, count }));
}

/* Facebook-style floating reaction picker */
function ReactionPicker({ isSent, onSelect, disabled }) {
  return (
    <div className={`fb-reaction-picker ${isSent ? 'picker-sent' : 'picker-received'}`}>
      {REACTION_EMOJIS.map(({ emoji, label, labelEn }) => (
        <button
          key={emoji}
          className="fb-reaction-option"
          onClick={() => onSelect(emoji)}
          disabled={disabled}
          aria-label={`${label} / ${labelEn}`}
          title={`${label} / ${labelEn}`}
        >
          <span className="fb-reaction-emoji">{emoji}</span>
          <span className="fb-reaction-label">{label}</span>
        </button>
      ))}
    </div>
  );
}

/* Reaction badge shown on message bubble */
function ReactionBadge({ reactions }) {
  const grouped = groupReactions(reactions);
  if (grouped.length === 0) return null;
  const total = reactions.length;
  const emojisToShow = grouped.slice(0, 3).map(g => g.emoji);
  return (
    <div className="fb-reaction-badge" title={reactions.map(r => r.emoji).join(' ')}>
      <span className="fb-badge-emojis">{emojisToShow.join('')}</span>
      {total > 1 && <span className="fb-badge-count">{total}</span>}
    </div>
  );
}

export default function MessageBubble({
  message,
  isSent,
  senderName,
  senderAvatar,
  avatarClass,
  formatMessageTime,
  userId,
  onReactionAdded,
  isGroup,
  isRead,
  onReply,
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reacting, setReacting] = useState(false);
  const pickerTimeout = useRef(null);
  const rowRef = useRef(null);

  const reactions = message.reactions || [];
  const messageType = message.message_type
    || (message.image_url && !message.audio_url ? 'image'
      : message.audio_url ? 'voice'
        : message.location_lat ? 'location'
          : 'text');

  const handleReactionClick = async (emoji) => {
    setReacting(true);
    setShowReactionPicker(false);
    try {
      await toggleReaction(message.id, userId, emoji);
      if (onReactionAdded) onReactionAdded(message.id);
    } catch (err) {
      console.error('Reaction failed:', err);
    } finally {
      setReacting(false);
    }
  };

  /* Show picker on hover with slight delay */
  const handleMouseEnter = () => {
    clearTimeout(pickerTimeout.current);
    pickerTimeout.current = setTimeout(() => setShowReactionPicker(true), 300);
  };
  const handleMouseLeave = () => {
    clearTimeout(pickerTimeout.current);
    pickerTimeout.current = setTimeout(() => setShowReactionPicker(false), 400);
  };

  useEffect(() => () => clearTimeout(pickerTimeout.current), []);

  /* Close picker on outside click */
  useEffect(() => {
    if (!showReactionPicker) return;
    const handler = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        setShowReactionPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showReactionPicker]);

  /* ── Shared hover actions bar ── */
  const HoverActions = () => (
    <div className={`msg-hover-actions ${isSent ? 'actions-sent' : 'actions-received'}`}>
      {onReply && (
        <button
          className="msg-action-btn"
          onClick={() => onReply(message)}
          title="উত্তর দিন / Reply"
          aria-label="Reply"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 00-4-4H4" />
          </svg>
        </button>
      )}
      <button
        className="msg-action-btn reaction-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowReactionPicker(prev => !prev)}
        title="প্রতিক্রিয়া যোগ করুন / React"
        aria-label="Add reaction"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
        </svg>
        <span className="reaction-btn-plus">+</span>
      </button>
    </div>
  );

  /* ── Image message ── */
  if (messageType === 'image' && message.image_url) {
    return (
      <div
        ref={rowRef}
        className={`msg-row ${isSent ? 'sent' : 'received'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isSent && isGroup && <div className={`msg-av ${avatarClass}`}>{senderAvatar}</div>}
        <div className={`bubble ${isSent ? 'sent' : 'received'} msg-image`} style={{ position: 'relative' }}>
          <img
            src={message.image_url}
            alt="Chat image"
            className="msg-image-inner"
            style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover' }}
          />
          {message.content && (
            <div className="msg-image-caption">
              <p className="bubble-text" style={{ color: 'white' }}>{message.content}</p>
            </div>
          )}
          <div className="msg-image-time-row">
            <span className="bubble-time" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {formatMessageTime(message.created_at)}
            </span>
          </div>
          {reactions.length > 0 && <ReactionBadge reactions={reactions} />}
        </div>
        {showReactionPicker && (
          <ReactionPicker isSent={isSent} onSelect={handleReactionClick} disabled={reacting} />
        )}
        <HoverActions />
      </div>
    );
  }

  /* ── Voice message ── */
  if (messageType === 'voice' && message.audio_url) {
    return (
      <div
        ref={rowRef}
        className={`msg-row ${isSent ? 'sent' : 'received'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isSent && isGroup && <div className={`msg-av ${avatarClass}`}>{senderAvatar}</div>}
        <div className={`bubble ${isSent ? 'sent' : 'received'}`} style={{ position: 'relative' }}>
          <div className="bubble-inner voice-note" style={{ padding: '10px 12px' }}>
            <audio
              ref={(el) => { el && (el.dataset.msgId = message.id); }}
              style={{ display: 'none' }}
              src={message.audio_url}
              onEnded={(e) => {
                const btn = e.target.parentElement.querySelector('.voice-play-btn');
                if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
              }}
            />
            <button
              className="voice-play-btn"
              onClick={(e) => {
                const audio = e.currentTarget.parentElement.querySelector('audio');
                if (audio) {
                  if (audio.paused) {
                    audio.play();
                    e.currentTarget.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
                  } else {
                    audio.pause();
                    e.currentTarget.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                  }
                }
              }}
              aria-label="ভয়েস নোট চালু করুন / Play voice note"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <div className="waveform" aria-label="Voice note waveform">
              {[8,14,20,12,18,24,10,16,22,14,8,18,20,12,16,10,22,8,14,18].map((h, i) => (
                <div key={i} className="wave-bar" style={{ height: `${h}px` }}></div>
              ))}
            </div>
            <span className="voice-duration">{formatVoiceDuration(message.audio_duration_sec)}</span>
          </div>
          <div className="bubble-time-row" style={{ padding: '0 12px 8px' }}>
            <span className="bubble-time">{formatMessageTime(message.created_at)}</span>
          </div>
          {reactions.length > 0 && <ReactionBadge reactions={reactions} />}
        </div>
        {showReactionPicker && (
          <ReactionPicker isSent={isSent} onSelect={handleReactionClick} disabled={reacting} />
        )}
        <HoverActions />
      </div>
    );
  }

  /* ── Location message ── */
  if (messageType === 'location' && message.location_lat) {
    return (
      <div
        ref={rowRef}
        className={`msg-row ${isSent ? 'sent' : 'received'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isSent && isGroup && <div className={`msg-av ${avatarClass}`}>{senderAvatar}</div>}
        <div className={`bubble ${isSent ? 'sent' : 'received'}`} style={{ position: 'relative' }}>
          <a href={`https://maps.google.com/?q=${message.location_lat},${message.location_lng}`} target="_blank" rel="noopener noreferrer">
            <div className="location-preview">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
              </svg>
              <span>{message.location_label || '📍 অবস্থান'}</span>
            </div>
          </a>
          <div className="bubble-time-row">
            <span className="bubble-time">{formatMessageTime(message.created_at)}</span>
          </div>
          {reactions.length > 0 && <ReactionBadge reactions={reactions} />}
        </div>
        {showReactionPicker && (
          <ReactionPicker isSent={isSent} onSelect={handleReactionClick} disabled={reacting} />
        )}
        <HoverActions />
      </div>
    );
  }

  /* ── Text message ── */
  return (
    <div
      ref={rowRef}
      className={`msg-row ${isSent ? 'sent' : 'received'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isSent && isGroup && <div className={`msg-av ${avatarClass}`}>{senderAvatar}</div>}
      <div className={`bubble ${isSent ? 'sent' : 'received'}`} style={{ position: 'relative' }}>
        {message.reply_to && (
          <div className="reply-quote">
            <div className="reply-quote-name">{message.reply_to.sender?.name || 'আপনি'}</div>
            <div className="reply-quote-text">
              {message.reply_to.content
                || (message.reply_to.image_url ? '📷 ছবি'
                  : message.reply_to.audio_url ? '🎤 ভয়েস নোট'
                    : '📎 ফাইল')}
            </div>
          </div>
        )}
        <div className="bubble-inner">
          <p className="bubble-text">{message.content}</p>
          <div className="bubble-time-row">
            <span className="bubble-time">{formatMessageTime(message.created_at)}</span>
            {isSent && (
              <span className="msg-status" title={isRead ? 'দেখা হয়েছে · Seen' : 'পাঠানো হয়েছে · Sent'}>
                {isRead ? (
                  <>
                    <span className="status-dot" style={{ background: 'rgba(255,255,255,0.7)' }}></span>
                    <span className="status-dot" style={{ background: 'rgba(255,255,255,0.7)', marginLeft: '-1px' }}></span>
                  </>
                ) : (
                  <span className="status-dot" style={{ background: 'rgba(255,255,255,0.45)' }}></span>
                )}
              </span>
            )}
          </div>
        </div>
        {reactions.length > 0 && <ReactionBadge reactions={reactions} />}
      </div>

      {/* Facebook-style floating reaction picker */}
      {showReactionPicker && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ReactionPicker isSent={isSent} onSelect={handleReactionClick} disabled={reacting} />
        </div>
      )}

      {/* Hover action buttons */}
      <HoverActions />
    </div>
  );
}

function formatVoiceDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
