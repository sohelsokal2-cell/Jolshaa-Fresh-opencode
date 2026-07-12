import React, { useState, useEffect, useRef } from 'react';

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'received',
    text: 'আমিনুল ভাই, আসছেন তো আজকে? সবাই অপেক্ষা করছে! 😊',
    time: '১০:৩২ AM',
    type: 'text',
  },
  {
    id: 2,
    sender: 'sent',
    text: 'হ্যাঁ অবশ্যই! ৪টার দিকে পৌঁছাব, ট্র্যাফিক না থাকলে 😄',
    time: '১০:৪৫ AM',
    type: 'text',
    replyTo: {
      senderName: 'রাহেলা বেগম',
      text: 'আমিনুল ভাই, আসছেন তো আজকে? সবাই...',
    },
    status: 'delivered',
  },
  {
    id: 3,
    sender: 'sent',
    time: '১০:৪৬ AM',
    type: 'image',
    captionIcon: '🎉',
    status: 'seen',
  },
  {
    id: 4,
    sender: 'received',
    time: '১০:৪৮ AM',
    type: 'voice',
    duration: '0:24',
    playedBars: 7,
    barsCount: 20,
  },
  {
    id: 5,
    sender: 'sent',
    text: 'দেখ কত সুন্দর! এই জায়গাটা সত্যিই অসাধারণ ❤️',
    time: '১০:৫২ AM',
    type: 'text',
    reaction: '😍 1',
    status: 'seen',
  },
  {
    id: 6,
    sender: 'received',
    text: 'সত্যিই! এত সুন্দর জায়গা আগে দেখিনি। আপনি কোথায় গিয়েছিলেন?',
    time: '১০:৫৪ AM',
    type: 'text',
  },
];

export default function ChatWindow({ activeConversation, onToggleInfo }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState({}); // { [messageId]: true/false }
  const threadEndRef = useRef(null);

  // Scroll to bottom on load and when messages update
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeString = `${hours}:${minutes} ${ampm}`;

    const newMsg = {
      id: Date.now(),
      sender: 'sent',
      text: inputValue.trim(),
      time: timeString,
      type: 'text',
      status: 'sent',
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleVoicePlay = (msgId) => {
    setVoicePlaying(prev => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const hasText = inputValue.trim().length > 0;

  // Use activeConversation values if passed, otherwise default to Rahela Begum's details
  const name = activeConversation?.name || 'রাহেলা বেগম';
  const avatarChar = activeConversation?.avatarChar || 'র';
  const avatarClass = activeConversation?.avatarClass || 'av-1';

  return (
    <main className="chat-window" aria-label="Chat window">
      {/* Chat header */}
      <div className="chat-header">
        <div className="chat-contact-av-wrap">
          <div className={`chat-contact-av ${avatarClass}`}>{avatarChar}</div>
          <span className="chat-online-dot"></span>
        </div>
        <div className="chat-contact-info">
          <div className="chat-contact-name">{name}</div>
          <div className="chat-contact-status">
            <span className="chat-status-dot"></span>
            <span className="chat-status-bn">সক্রিয় আছেন</span>
            <span className="chat-status-en">· Active Now</span>
          </div>
        </div>

        {/* Call/Info Buttons */}
        <div className="chat-actions">
          <button className="chat-action-btn" title="অডিও কল / Audio Call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 015.08 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.09 9.63a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </button>
          <button className="chat-action-btn" title="ভিডিও কল / Video Call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
          <button className="chat-action-btn" title="তথ্য / Info" onClick={onToggleInfo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pinned message bar */}
      <div className="pinned-bar" aria-label="Pinned message">
        <span className="pinned-icon">📌</span>
        <div className="pinned-content">
          <div className="pinned-label">পিন করা বার্তা · Pinned</div>
          <div className="pinned-text">রাহেলা: কালকে সকাল ১০টার সময় আমরা ইফতারের জিনিসপত্র কিনতে বাজারে যাব। সবাই চলে আসবেন।</div>
        </div>
      </div>

      {/* Chat thread */}
      <div className="chat-thread" aria-label="Message thread">
        {/* Date divider */}
        <div className="date-divider" role="separator">
          <div className="date-divider-line"></div>
          <div className="date-divider-text">
            <span className="date-bn">আজকে</span>
            <span className="date-en">· Today</span>
          </div>
          <div className="date-divider-line"></div>
        </div>

        {/* Dynamic Messages */}
        {messages.map(msg => {
          const isSent = msg.sender === 'sent';

          return (
            <div key={msg.id} className={`msg-row ${isSent ? 'sent' : 'received'}`} style={{ marginTop: '4px' }}>
              {!isSent && (
                <div className={`msg-av ${avatarClass}`} aria-hidden="true">
                  {avatarChar}
                </div>
              )}

              {/* Message Content Bubble */}
              {msg.type === 'image' ? (
                <div className="bubble sent msg-image" style={{ background: 'none', borderRadius: '14px 14px 4px 14px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(27,107,90,0.2)' }}>
                  <div className="msg-image-placeholder" style={{ fontSize: '40px' }}>
                    {msg.captionIcon || '🍛'}
                  </div>
                  <div className="msg-image-caption">
                    <div className="msg-image-time-row">
                      <span className="bubble-time" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
                        {msg.time}
                      </span>
                      {msg.status === 'seen' && (
                        <span className="msg-status">
                          <span className="status-seen" title={`পড়েছেন · Seen`}>{avatarChar}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : msg.type === 'voice' ? (
                <div className={`bubble ${isSent ? 'sent' : 'received'}`}>
                  <div className="bubble-inner voice-note" style={{ padding: '10px 12px' }}>
                    <button
                      className="voice-play-btn"
                      aria-label="ভয়েস নোট প্লে/পজ করুন"
                      onClick={() => toggleVoicePlay(msg.id)}
                    >
                      {voicePlaying[msg.id] ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                    <div className="waveform" aria-label="Voice note waveform">
                      {Array.from({ length: msg.barsCount || 20 }).map((_, idx) => {
                        const played = idx < (msg.playedBars || 7);
                        // Wave bar height simulation
                        const heights = [8, 14, 20, 12, 18, 24, 10, 16, 22, 14, 8, 18, 20, 12, 16, 10, 22, 8, 14, 18];
                        const h = heights[idx % heights.length];
                        return (
                          <div
                            key={idx}
                            className={`wave-bar ${played ? 'played' : ''}`}
                            style={{ height: `${h}px` }}
                          />
                        );
                      })}
                    </div>
                    <span className="voice-duration">{msg.duration}</span>
                  </div>
                  <div className="bubble-time-row" style={{ padding: '0 12px 8px' }}>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                </div>
              ) : (
                // Text Message
                <div className={`bubble ${isSent ? 'sent' : 'received'}`} style={{ position: 'relative' }}>
                  <div className="bubble-inner">
                    {msg.replyTo && (
                      <div className="reply-quote">
                        <div className="reply-quote-name">{msg.replyTo.senderName}</div>
                        <div className="reply-quote-text">{msg.replyTo.text}</div>
                      </div>
                    )}
                    <p className="bubble-text">{msg.text}</p>
                    <div className="bubble-time-row">
                      <span className="bubble-time">{msg.time}</span>
                      {isSent && msg.status && (
                        <span className="msg-status">
                          {msg.status === 'sent' && (
                            <span className="status-dot" style={{ background: 'rgba(255,255,255,0.45)' }}></span>
                          )}
                          {msg.status === 'delivered' && (
                            <>
                              <span className="status-dot" style={{ background: 'rgba(255,255,255,0.7)' }}></span>
                              <span className="status-dot" style={{ background: 'rgba(255,255,255,0.7)', marginLeft: '-1px' }}></span>
                            </>
                          )}
                          {msg.status === 'seen' && (
                            <span className="status-seen" title={`পড়েছেন · Seen`}>{avatarChar}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {msg.reaction && (
                    <div className="bubble-reaction" aria-label="প্রতিক্রিয়া">
                      {msg.reaction}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        <div className="msg-row received" style={{ marginTop: '6px' }}>
          <div className={`msg-av ${avatarClass}`} aria-hidden="true">
            {avatarChar}
          </div>
          <div>
            <div className="typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
            <div className="typing-label">টাইপ করছেন... · typing...</div>
          </div>
        </div>

        {/* Dummy div to scroll to */}
        <div ref={threadEndRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        {/* Attachment popup */}
        <div className={`attach-popup ${attachOpen ? 'open' : ''}`} id="attachPopup">
          <button className="attach-option" aria-label="ছবি/ভিডিও / Photo or Video" onClick={() => setAttachOpen(false)}>
            <div className="attach-opt-icon" style={{ background: '#fff0e6' }}>📷</div>
            <div>
              <div className="attach-opt-bn">ছবি / ভিডিও</div>
              <div className="attach-opt-en">Photo / Video</div>
            </div>
          </button>
          <button className="attach-option" aria-label="ফাইল / File" onClick={() => setAttachOpen(false)}>
            <div className="attach-opt-icon" style={{ background: '#eff6ff' }}>📎</div>
            <div>
              <div className="attach-opt-bn">ফাইল</div>
              <div className="attach-opt-en">File</div>
            </div>
          </button>
          <button className="attach-option" aria-label="ভয়েস নোট / Voice Note" onClick={() => setAttachOpen(false)}>
            <div className="attach-opt-icon" style={{ background: '#f0fdf4' }}>🎤</div>
            <div>
              <div className="attach-opt-bn">ভয়েস নোট</div>
              <div className="attach-opt-en">Voice Note</div>
            </div>
          </button>
          <button className="attach-option" aria-label="লোকেশন / Location" onClick={() => setAttachOpen(false)}>
            <div className="attach-opt-icon" style={{ background: '#fef2f2' }}>📍</div>
            <div>
              <div className="attach-opt-bn">লোকেশন</div>
              <div className="attach-opt-en">Location</div>
            </div>
          </button>
        </div>

        {/* Input Controls */}
        <div className="input-row">
          {/* Emoji */}
          <button className="input-side-btn" aria-label="ইমোজি / Emoji">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>

          {/* Attach */}
          <button
            className={`input-side-btn ${attachOpen ? 'active-attach' : ''}`}
            id="attachBtn"
            onClick={() => setAttachOpen(prev => !prev)}
            aria-label="সংযুক্তি / Attachment"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Text input */}
          <div className="msg-input-wrap">
            <input
              id="msgInput"
              className="msg-input"
              type="text"
              placeholder="একটি বার্তা লিখুন... / Type a message..."
              aria-label="Message input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Send / Mic toggle */}
          <button
            className={`send-btn ${hasText ? '' : 'mic-mode'}`}
            id="sendBtn"
            aria-label={hasText ? 'বার্তা পাঠান / Send message' : 'ভয়েস রেকর্ড / Record voice note'}
            onClick={hasText ? handleSend : undefined}
          >
            {hasText ? (
              <svg id="sendIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'translateX(2px)' }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            ) : (
              <svg id="micIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
