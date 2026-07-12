import React, { useState } from 'react';

export default function InfoPanel({ activeConversation }) {
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'files' | 'links'
  const [isMuted, setIsMuted] = useState(false);

  // Default fallback values if no activeConversation is loaded
  const name = activeConversation?.name || 'রাহেলা বেগম';
  const avatarChar = activeConversation?.avatarChar || 'র';
  const avatarClass = activeConversation?.avatarClass || 'av-1';

  return (
    <aside className="info-panel" id="infoPanel" aria-label="Chat information panel">
      {/* Profile */}
      <div className="info-profile">
        <div className={`info-av ${avatarClass}`}>{avatarChar}</div>
        <div className="info-name">{name}</div>
        <div className="info-mutual">৬ জন পারস্পরিক বন্ধু · 6 mutual friends</div>
      </div>

      {/* Tabs */}
      <div className="info-tabs">
        <button
          className={`info-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
          aria-pressed={activeTab === 'media'}
        >
          <span className="info-tab-bn">মিডিয়া</span>
          <span className="info-tab-en">Media</span>
        </button>
        <button
          className={`info-tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
          aria-pressed={activeTab === 'files'}
        >
          <span className="info-tab-bn">ফাইল</span>
          <span className="info-tab-en">Files</span>
        </button>
        <button
          className={`info-tab ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
          aria-pressed={activeTab === 'links'}
        >
          <span className="info-tab-bn">লিংক</span>
          <span className="info-tab-en">Links</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'media' && (
        <div className="info-section">
          <div className="info-section-label">শেয়ার করা মিডিয়া · Shared Media</div>
          <div className="media-grid">
            <div className="media-thumb"><div className="media-thumb-inner mt-1">🎉</div></div>
            <div className="media-thumb"><div className="media-thumb-inner mt-2">🌅</div></div>
            <div className="media-thumb"><div className="media-thumb-inner mt-3">🍛</div></div>
            <div className="media-thumb"><div className="media-thumb-inner mt-4">👨‍👩‍👧</div></div>
            <div className="media-thumb"><div className="media-thumb-inner mt-5">🌿</div></div>
            <div className="media-thumb"><div className="media-thumb-inner mt-6">☕</div></div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="info-section" style={{ padding: '16px 14px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          কোনো ফাইল শেয়ার করা হয়নি
        </div>
      )}

      {activeTab === 'links' && (
        <div className="info-section" style={{ padding: '16px 14px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          কোনো লিংক শেয়ার করা হয়নি
        </div>
      )}

      {/* Pinned messages */}
      <div className="info-section">
        <div className="info-section-label">📌 পিন করা বার্তা · Pinned Messages</div>
        <div className="pinned-msg-item">
          <span className="pinned-msg-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <div>
            <div className="pinned-msg-text">আজকে বিকেল ৪টায় একসাথে দেখা করবো — ধানমন্ডি লেক সাইডে।</div>
            <div className="pinned-msg-time">আজ · 9:15 AM</div>
          </div>
        </div>
        <div className="pinned-msg-item">
          <span className="pinned-msg-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <div>
            <div className="pinned-msg-text">রাহেলার জন্মদিন: ১৪ই জুলাই 🎂</div>
            <div className="pinned-msg-time">গত সপ্তাহে · Last week</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="info-action"
        role="button"
        tabIndex="0"
        aria-label="নোটিফিকেশন নিঃশব্দ — Mute notifications"
        onClick={() => setIsMuted(prev => !prev)}
      >
        <div className="info-action-left">
          <div className="info-action-icon ia-teal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
              <path d="M17 16.95A7 7 0 015 12v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <div>
            <div className="info-action-bn">নোটিফিকেশন নিঃশব্দ</div>
            <div className="info-action-en">Mute Notifications</div>
          </div>
        </div>
        <button
          className={`toggle-switch ${isMuted ? 'on' : ''}`}
          id="muteToggle"
          aria-label="Mute toggle"
          onClick={(e) => {
            e.stopPropagation(); // Avoid double click event triggers
            setIsMuted(prev => !prev);
          }}
        />
      </div>

      <div className="info-action" role="button" tabIndex="0" aria-label="প্রোফাইল দেখুন — View Profile">
        <div className="info-action-left">
          <div className="info-action-icon ia-grey">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div className="info-action-bn">প্রোফাইল দেখুন</div>
            <div className="info-action-en">View Profile</div>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-xlight)" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      <div className="info-action danger" role="button" tabIndex="0" aria-label="ব্লক করুন — Block">
        <div className="info-action-left">
          <div className="info-action-icon ia-red">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div>
            <div className="info-action-bn" style={{ color: 'var(--coral-dark)' }}>ব্লক করুন</div>
            <div className="info-action-en">Block</div>
          </div>
        </div>
      </div>

      <div className="info-action danger" role="button" tabIndex="0" aria-label="কথোপকথন মুছুন — Delete conversation">
        <div className="info-action-left">
          <div className="info-action-icon ia-red">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>
          <div>
            <div className="info-action-bn" style={{ color: 'var(--coral-dark)' }}>কথোপকথন মুছুন</div>
            <div className="info-action-en">Delete Conversation</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
