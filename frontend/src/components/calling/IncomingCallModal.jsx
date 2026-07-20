import React from 'react';
import './Calling.css';

export default function IncomingCallModal({ callSession, onAccept, onDecline }) {
  if (!callSession) return null;

  const caller = callSession.caller || {};
  const callerName = caller.name || 'অজানা ব্যবহারকারী';
  const avatarChar = callerName.charAt(0);
  const avatarClass = caller.avatarClass || 'av-1';
  const isVideo = callSession.call_type === 'video';
  const callTypeText = isVideo ? 'ইনকামিং ভিডিও কল' : 'ইনকামিং অডিও কল';
  const callTypeEn = isVideo ? 'Incoming Video Call' : 'Incoming Voice Call';

  return (
    <div className="call-overlay-panel" role="dialog" aria-label="Incoming call">
      <div className="call-overlay-inner">
        <div className="call-type-text">
          {callTypeText}
          <span className="call-type-en">{callTypeEn}</span>
        </div>

        <div className="call-avatar-wrap">
          <div className="call-ring call-ring-1"></div>
          <div className="call-ring call-ring-2"></div>
          <div className="call-ring call-ring-3"></div>
          <div className={`call-av ${avatarClass}`}>{avatarChar}</div>
        </div>

        <div className="call-name-bn">{callerName}</div>
        <div className="call-name-en">{callerName}</div>

        <div className="call-actions">
          <div className="call-action-group">
            <button
              className="call-btn reject"
              onClick={onDecline}
              aria-label="কল প্রত্যাখ্যান করুন / Reject call"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67M23 1L1 23" />
              </svg>
            </button>
            <span className="call-btn-label">মুছুন · Reject</span>
          </div>

          <div className="call-action-group">
            <button
              className="call-btn accept"
              onClick={onAccept}
              aria-label="কল গ্রহণ করুন / Accept call"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10l4.553-2.07A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.94L15 14" />
                <rect x="1" y="7" width="14" height="11" rx="3" />
              </svg>
            </button>
            <span className="call-btn-label">গ্রহণ করুন · Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
