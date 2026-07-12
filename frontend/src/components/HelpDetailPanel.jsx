import { useState } from 'react';
import { CATEGORY_MAP, URGENCY_MAP } from '../utils/sahajjoHelpers';

const HelpDetailPanel = ({ request, onResolve }) => {
  const [helperStates, setHelperStates] = useState({});
  const [isResolved, setIsResolved] = useState(false);

  if (!request) {
    return (
      <div className="sahajjo-detail-col">
        <div className="detail-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          একটি অনুরোধ নির্বাচন করুন
        </div>
      </div>
    );
  }

  const urgency = URGENCY_MAP[request.urgency];
  const category = CATEGORY_MAP[request.category];

  const handleAccept = (helperId) => {
    setHelperStates((prev) => ({
      ...prev,
      [helperId]: !prev[helperId],
    }));
  };

  const handleResolve = () => {
    const newResolved = !isResolved;
    setIsResolved(newResolved);
    if (onResolve) onResolve(request.id, newResolved);
  };

  const handleMessage = () => {
    // TODO: Open Messenger with help_coordination conversation type
    console.log('Open Messenger for help coordination with:', request.requester.name);
  };

  return (
    <div className="sahajjo-detail-col">
      <div className="detail-panel">
        {/* Banner */}
        <div className="dp-banner">
          <div className="dp-urg-pill-wrap">
            <div className={`urg-pill ${urgency.pillClass}`} style={{ display: 'inline-flex' }}>
              <div className="urg-dot" />
              <span className="urg-pill-bn">{urgency.label}</span>
              <span className="urg-pill-en">/ {urgency.labelEn}</span>
            </div>
          </div>
          <div className="dp-title">{request.title}</div>
          <div className="dp-cat-row">
            <span className="dp-cat-icon">{category.icon}</span>
            <span className="dp-cat-lbl">{category.label} / {category.labelEn}</span>
          </div>
          <div className="dp-time-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--urgent-red)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="dp-time-badge-bn">{request.timeRemaining}</span>
            <span style={{ color: 'var(--text-xlight)', fontSize: '9px', fontFamily: 'var(--font-en)' }}>/ {request.timeRemainingEn}</span>
          </div>
        </div>

        {/* Requester info */}
        <div className="dp-requester">
          <div className="dp-req-av" style={{ background: request.requester.avatarBg }}>
            {request.requester.avatar}
          </div>
          <div>
            <div className="dp-req-name">{request.requester.name}</div>
            <div className="dp-req-loc">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {request.requester.location}
            </div>
            <div className="dp-req-time">{request.timeAgo} পোস্ট করেছে · posted {request.timeAgoEn}</div>
          </div>
          <button className="dp-msg-btn" title="বার্তা পাঠাও / Send Message" onClick={handleMessage}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        </div>

        {/* Full description */}
        <div className="dp-desc">
          <div className="dp-desc-text">{request.fullDescription}</div>
        </div>

        {/* Helper list header */}
        <div className="dp-helpers-hdr">
          <div>
            <div className="dp-helpers-bn">সাহায্যের প্রস্তাব</div>
            <div className="dp-helpers-en">People Who Offered to Help</div>
          </div>
          <span className="dp-helpers-count">{request.helpers.length} জন</span>
        </div>

        {/* Helper rows */}
        {request.helpers.map((helper) => {
          const isAccepted = !!helperStates[helper.id];
          return (
            <div key={helper.id} className="helper-row">
              <div className="helper-av" style={{ background: helper.avatarBg }}>
                {helper.avatar}
              </div>
              <div className="helper-info">
                <div className="helper-name">{helper.name}</div>
                <div className="helper-msg">{helper.message}</div>
                <div className="helper-time">{helper.time} · {helper.location}</div>
              </div>
              <button
                className={`btn-accept ${isAccepted ? 'accepted' : ''}`}
                onClick={() => handleAccept(helper.id)}
              >
                {isAccepted && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                <div>
                  <div className="btn-acc-bn">{isAccepted ? 'গৃহীত' : 'গ্রহণ করো'}</div>
                  <div className="btn-acc-en">{isAccepted ? 'Accepted' : 'Accept'}</div>
                </div>
              </button>
            </div>
          );
        })}

        {/* Resolve button */}
        <div className="dp-resolve-wrap">
          <button
            className={`btn-resolve ${isResolved ? 'resolved' : ''}`}
            onClick={handleResolve}
          >
            {isResolved ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--urgent-green)" strokeWidth="2.8" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            )}
            <div>
              {isResolved ? (
                <>
                  <div className="br-resolved-bn">✓ সমস্যা সমাধান হয়েছে</div>
                  <div className="br-resolved-en">Problem Resolved · Thank you!</div>
                </>
              ) : (
                <>
                  <div className="br-bn">সমস্যা সমাধান হয়েছে</div>
                  <div className="br-en">Mark as Resolved</div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpDetailPanel;
