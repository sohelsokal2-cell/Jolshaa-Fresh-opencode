import { useState } from 'react';
import { CATEGORY_MAP, URGENCY_MAP } from '../utils/sahajjoHelpers';

const HelpRequestCard = ({ request, selectedRequestId, onSelectRequest, isResolved }) => {
  const [isHelped, setIsHelped] = useState(false);

  const urgency = URGENCY_MAP[request.urgency];
  const category = CATEGORY_MAP[request.category];

  const handleHelp = (e) => {
    e.stopPropagation();
    setIsHelped(!isHelped);
  };

  const handleCardClick = () => {
    onSelectRequest(request.id);
  };

  return (
    <div
      className={`request-card ${urgency.cardClass} ${selectedRequestId === request.id ? 'selected' : ''} ${isResolved ? 'resolved-card' : ''}`}
      onClick={handleCardClick}
      tabIndex="0"
    >
      <div className="rc-top">
        <div className="rc-top-left">
          <div className={`rc-cat-icon ${category.iconClass}`}>{category.icon}</div>
          <div className="rc-main">
            <div className={`urg-pill ${urgency.pillClass}`}>
              <div className="urg-dot" />
              <span className="urg-pill-bn">{urgency.label}</span>
              <span className="urg-pill-en">/ {urgency.labelEn}</span>
            </div>
            <div className="rc-title">{request.title}</div>
            <div className="rc-desc">{request.description}</div>
          </div>
        </div>
        <div className="rc-cat-label">
          <span className="cat-lbl">{category.label} / {category.labelEn}</span>
          <span className="rc-time-ago">{request.timeAgo}</span>
        </div>
      </div>

      <div className="rc-requester">
        <div className="req-av" style={{ background: request.requester.avatarBg }}>
          {request.requester.avatar}
        </div>
        <div>
          <div className="req-name">{request.requester.name}</div>
          <div className="req-loc">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {request.requester.location}
          </div>
        </div>
      </div>

      <div className="rc-footer">
        <div className="rc-footer-left">
          <div className={`time-remaining ${request.urgency === 'immediate' ? 'tr-urgent' : ''}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={request.urgency === 'immediate' ? 'var(--urgent-red)' : request.urgency === 'hours' ? 'var(--amber)' : 'var(--urgent-green)'} strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="tr-val" style={request.urgency === 'days' ? { color: 'var(--urgent-green)' } : {}}>{request.timeRemaining}</span>
            <div>
              <div className="tr-bn">{request.urgency === 'days' ? 'অনুসন্ধান' : 'বাকি'}</div>
              <div className="tr-en">{request.urgency === 'days' ? 'ongoing' : 'left'}</div>
            </div>
          </div>
          <div className="helper-count">
            <div className="hc-faces">
              {request.helpers.slice(0, 3).map((helper, i) => (
                <div key={i} className="hc-av" style={{ background: helper.avatarBg }}>
                  {helper.avatar}
                </div>
              ))}
            </div>
            <div>
              <div className="hc-text-bn">{request.helpers.length} জন সাহায্য করতে চান</div>
              <div className="hc-text-en">{request.helpers.length} people offered to help</div>
            </div>
          </div>
        </div>
        <button
          className={`btn-can-help ${isHelped ? 'helped' : ''}`}
          onClick={handleHelp}
        >
          {isHelped ? '✅' : '🤝'}
          <div>
            <div className="bch-bn">
              {isHelped ? 'সাহায্যের প্রস্তাব দেওয়া হয়েছে' : 'আমি সাহায্য করতে পারি'}
            </div>
            <div className="bch-en">{isHelped ? 'Offer Sent' : 'I Can Help'}</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default HelpRequestCard;
