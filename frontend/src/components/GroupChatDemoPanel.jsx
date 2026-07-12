import React from 'react';

export default function GroupChatDemoPanel() {
  return (
    <div className="group-demo-panel" id="groupDemoPanel" aria-label="Group chat variant demo">
      <div className="gdp-label">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5">
          <circle cx="9" cy="7" r="3" />
          <path d="M3 21c0-3 2.7-5 6-5" />
          <circle cx="17" cy="7" r="2" />
          <path d="M14 21c0-2.5 1.8-4 4-4" />
        </svg>
        <span className="gdp-label-text">গ্রুপ চ্যাট ভ্যারিয়েন্ট · Group Chat State</span>
      </div>

      <div className="gdp-header">
        <div className="group-av-stack">
          <div className="group-av-mini gam-1">র</div>
          <div className="group-av-mini gam-2">ক</div>
        </div>
        <div>
          <div className="group-name-bn">পরিবার গ্রুপ 👨‍👩‍👧‍👦</div>
          <div className="group-meta-en">8 members · 3 active now</div>
        </div>
        <div className="gdp-actions">
          <button className="gdp-act-btn" title="অডিও কল">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.08 9.81 19.79 19.79 0 01.11 1.18 2 2 0 012.11 1h3a2 2 0 012 1.72 12 12 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12 12 0 002.81.7A2 2 0 0122 16z" />
            </svg>
          </button>
          <button className="gdp-act-btn" title="গ্রুপ তথ্য">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </div>

      <div className="gdp-members">
        <div className="gdp-members-label">সদস্যরা · Members</div>
        <div className="gdp-member">
          <div className="gdp-member-av av-1">র</div>
          <div className="gdp-member-name">রাহেলা বেগম</div>
          <span className="gdp-admin-badge">Admin</span>
        </div>
        <div className="gdp-member">
          <div className="gdp-member-av av-2">ক</div>
          <div className="gdp-member-name">করিম উদ্দিন</div>
          <span className="gdp-admin-badge">Admin</span>
        </div>
        <div className="gdp-member">
          <div className="gdp-member-av av-4">ত</div>
          <div className="gdp-member-name">তানভীর আহমেদ</div>
        </div>
        <div className="gdp-member" style={{ opacity: 0.6, fontStyle: 'italic' }}>
          <span style={{ fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)' }}>
            + ৫ জন আরো · +5 more members
          </span>
        </div>
      </div>
    </div>
  );
}
