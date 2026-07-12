import React from 'react';

export default function IncomingCallOverlay({ onAccept, onReject }) {
  return (
    <div className="call-overlay-panel" id="callPanel" aria-label="Incoming video call" role="dialog">
      <div className="call-demo-label">ডেমো: ইনকামিং কল · Incoming Call State</div>
      <div className="call-type-text">
        ইনকামিং ভিডিও কল
        <span className="call-type-en">Incoming Video Call</span>
      </div>
      <div className="call-avatar-wrap">
        <div className="call-ring call-ring-1"></div>
        <div className="call-ring call-ring-2"></div>
        <div className="call-ring call-ring-3"></div>
        <div className="call-av">র</div>
      </div>
      <div className="call-name-bn" style={{ marginTop: '14px' }}>রাহেলা বেগম</div>
      <div className="call-name-en">Raahela Begum</div>
      <div className="call-actions">
        {/* Reject */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <button className="call-btn reject" aria-label="কল প্রত্যাখ্যান করুন / Reject call" onClick={onReject}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67M23 1L1 23" />
            </svg>
          </button>
          <span className="call-btn-label">মুছুন · Reject</span>
        </div>
        {/* Accept */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <button className="call-btn accept" aria-label="কল গ্রহণ করুন / Accept call" onClick={onAccept}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 10l4.553-2.07A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.94L15 14" />
              <rect x="1" y="7" width="14" height="11" rx="3" />
            </svg>
          </button>
          <span className="call-btn-label">গ্রহণ করুন · Accept</span>
        </div>
      </div>
    </div>
  );
}
