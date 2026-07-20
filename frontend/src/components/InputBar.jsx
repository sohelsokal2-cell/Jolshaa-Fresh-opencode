import React, { useState, useRef, useEffect } from 'react';
import { formatRecordingTime } from '../hooks/useVoiceRecorder';

/* Popular emoji categories — Facebook Messenger style */
const EMOJI_CATEGORIES = [
  {
    label: '😊', name: 'Smileys',
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🤠','🥳','😇','🤓','🥸'],
  },
  {
    label: '❤️', name: 'Hearts',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☯️','🛐','🆚','💯','✔️','❌','❎','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','❗','❓','💢','💥','💫','💦','💨','🕳️','💬','💭','💤'],
  },
  {
    label: '👋', name: 'Gestures',
    emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','👀','👁️','👅','👄','🫦','🫁','🫀'],
  },
  {
    label: '🌸', name: 'Nature',
    emojis: ['🌸','🌺','🌻','🌹','🌷','🌼','💐','🍀','🌿','🍃','🍂','🍁','🍄','🌾','🌱','🌲','🌳','🌴','🌵','🎋','🎍','🌊','🌀','🌈','⛈️','🌤️','🌥️','🌦️','🌧️','🌩️','🌪️','🌫️','🌬️','🔥','💧','🌊','🌙','⭐','🌟','✨','⚡','☄️','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙'],
  },
  {
    label: '🎉', name: 'Activities',
    emojis: ['🎉','🎊','🎈','🎁','🎀','🎗️','🎟️','🎫','🏆','🥇','🥈','🥉','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🥊','🥋','🎯','🏹','🛹','🎮','🕹️','🎲','🎭','🎪','🤹','🎨','🖼️','🎰','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝'],
  },
  {
    label: '🍕', name: 'Food',
    emojis: ['🍕','🍔','🌮','🌯','🍜','🍛','🍣','🍱','🍩','🍪','🍰','🎂','🍫','🍬','🍭','🍮','🍯','🍺','🥂','🍾','☕','🧋','🥤','🍵','🫖','🧃','🥛','🍶','🍻','🥃','🍷','🍸','🍹','🧊','🫙','🧂','🫕','🥘','🫔','🥗','🥙','🧆','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖'],
  },
];

export default function InputBar({
  inputValue,
  onInputChange,
  onInputKeyDown,
  sending,
  hasText,
  attachOpen,
  onToggleAttach,
  onAttachClick,
  onFileDocClick,
  onEmojiClick,
  recorder,
  onStartVoiceRecording,
  onStopRecording,
  onCancelRecording,
  locationSending,
  onShareLocation,
  onSend,
  fileInputRef,
  fileDocInputRef,
  onImageUpload,
  onFileUpload,
  attachPopupRef,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const emojiPickerRef = useRef(null);

  /* Close emoji picker on outside click */
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji) => {
    onEmojiClick && onEmojiClick(emoji);
    // Also insert directly into input
    const syntheticEvent = { target: { value: inputValue + emoji } };
    onInputChange(syntheticEvent);
  };

  return (
    <div className="chat-input-bar">
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageUpload} />
      <input ref={fileDocInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.zip" style={{ display: 'none' }} onChange={onFileUpload} />

      {/* Attachment popup */}
      <div ref={attachPopupRef} className={`attach-popup ${attachOpen ? 'open' : ''}`} id="attachPopup">
        <button className="attach-option" onClick={onAttachClick} aria-label="ছবি/ভিডিও / Photo or Video">
          <div className="attach-opt-icon" style={{ background: '#fff0e6' }}>📷</div>
          <div>
            <div className="attach-opt-bn">ছবি / ভিডিও</div>
            <div className="attach-opt-en">Photo / Video</div>
          </div>
        </button>
        <button className="attach-option" onClick={onFileDocClick} aria-label="ফাইল / File">
          <div className="attach-opt-icon" style={{ background: '#eff6ff' }}>📎</div>
          <div>
            <div className="attach-opt-bn">ফাইল</div>
            <div className="attach-opt-en">File</div>
          </div>
        </button>
        <button className="attach-option" onClick={onStartVoiceRecording} aria-label="ভয়েস নোট / Voice Note">
          <div className="attach-opt-icon" style={{ background: '#f0fdf4' }}>🎤</div>
          <div>
            <div className="attach-opt-bn">ভয়েস নোট</div>
            <div className="attach-opt-en">Voice Note</div>
          </div>
        </button>
        <button className="attach-option" onClick={onShareLocation} aria-label="লোকেশন / Location" disabled={locationSending}>
          <div className="attach-opt-icon" style={{ background: '#fef2f2' }}>📍</div>
          <div>
            <div className="attach-opt-bn">{locationSending ? 'পাঠানো হচ্ছে...' : 'লোকেশন'}</div>
            <div className="attach-opt-en">Location</div>
          </div>
        </button>
      </div>

      {/* Facebook-style Emoji Picker Panel */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="fb-emoji-picker">
          {/* Category tabs */}
          <div className="fb-emoji-categories">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                className={`fb-emoji-cat-btn ${activeCategory === idx ? 'active' : ''}`}
                onClick={() => setActiveCategory(idx)}
                title={cat.name}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Category name */}
          <div className="fb-emoji-cat-name">{EMOJI_CATEGORIES[activeCategory].name}</div>
          {/* Emoji grid */}
          <div className="fb-emoji-grid">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
              <button
                key={i}
                className="fb-emoji-item"
                onClick={() => handleEmojiSelect(emoji)}
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {recorder.isRecording ? (
        <div className="voice-recording-row">
          <div className="voice-recording-indicator">
            <span className="voice-recording-dot"></span>
            রেকর্ড হচ্ছে... {formatRecordingTime(recorder.recordingTime)}
          </div>
          <button className="voice-recording-cancel" onClick={onCancelRecording} aria-label="বাতিল করুন / Cancel">✕</button>
          <button className="voice-recording-stop" onClick={onStopRecording} aria-label="পাঠান / Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="input-row">
          {/* Emoji button — opens picker */}
          <button
            className={`input-side-btn ${showEmojiPicker ? 'active-emoji' : ''}`}
            aria-label="ইমোজি / Emoji"
            onClick={() => setShowEmojiPicker(prev => !prev)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>

          {/* Attach */}
          <button
            className={`input-side-btn ${attachOpen ? 'active-attach' : ''}`}
            onClick={onToggleAttach}
            aria-label="সংযুক্ত করুন / Attach"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Text input */}
          <div className="msg-input-wrap">
            <input
              className="msg-input"
              type="text"
              placeholder="একটি বার্তা লিখুন... / Type a message..."
              aria-label="Message input"
              value={inputValue}
              onChange={onInputChange}
              onKeyDown={onInputKeyDown}
              disabled={sending}
            />
          </div>

          {/* Send / Mic */}
          <button
            className={`send-btn ${!hasText ? 'mic-mode' : ''}`}
            aria-label={hasText ? 'বার্তা পাঠান / Send message' : 'ভয়েস নোট / Voice note'}
            onClick={hasText ? onSend : onStartVoiceRecording}
            disabled={sending}
            style={{ opacity: sending ? 0.6 : 1 }}
          >
            {hasText ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'translateX(2px)' }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
