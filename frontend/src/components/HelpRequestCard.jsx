import { useState, useCallback } from 'react';
import { CATEGORY_MAP, URGENCY_MAP } from '../utils/sahajjoHelpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { offerHelp } from '../lib/sahajjoApi';

const timeAgo = (dateStr) => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  const days = Math.floor(hrs / 24);
  return `${days} দিন আগে`;
};

const timeRemaining = (deadline, urgency) => {
  if (urgency === 'days') return { bn: 'অনুসন্ধান', en: 'ongoing' };
  if (!deadline) return { bn: '—', en: '—' };
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl - now;
  if (diffMs <= 0) return { bn: 'সময় শেষ', en: 'expired' };
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hrs > 0) return { bn: `${hrs} ঘণ্টা`, en: `${hrs}h ${mins}m left` };
  return { bn: `${mins} মিনিট`, en: `${mins}m left` };
};

const HelpRequestCard = ({ request, selectedRequestId, onSelectRequest, isNew, helperCount = 0, hasUserOffered = false, onOfferSent }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isHelped, setIsHelped] = useState(hasUserOffered);
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  const urgency = URGENCY_MAP[request.urgency];
  const category = CATEGORY_MAP[request.category];
  const isResolved = request.status === 'resolved';
  const tr = timeRemaining(request.deadline, request.urgency);

  const handleHelp = useCallback(async (e) => {
    e.stopPropagation();
    if (isHelped || !user || offerSubmitting) return;

    setOfferSubmitting(true);
    try {
      await offerHelp(request.id, user.id, '');
      setIsHelped(true);
      if (onOfferSent) onOfferSent(request.id);
    } catch (err) {
      console.error('Failed to offer help:', err);
      if (err.message?.includes('duplicate')) {
        setIsHelped(true);
      } else {
        showToast('সাহায্য প্রস্তাব পাঠানো যায়নি। আবার চেষ্টা করুন।');
      }
    } finally {
      setOfferSubmitting(false);
    }
  }, [isHelped, user, offerSubmitting, request.id, onOfferSent, showToast]);

  const requesterInitial = request.requester?.name?.[0] || '?';
  const avatarBg = 'linear-gradient(135deg,#1B6B5A,#4ECDC4)';

  return (
    <div
      className={`request-card ${urgency.cardClass} ${selectedRequestId === request.id ? 'selected' : ''} ${isResolved ? 'resolved-card' : ''} ${isNew ? 'new-request' : ''}`}
      onClick={() => onSelectRequest(request.id)}
      tabIndex="0"
    >
      {request.image_url && (
        <div className="rc-image-wrap">
          <img src={request.image_url} alt="" className="rc-image" />
        </div>
      )}

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
          <span className="rc-time-ago">{timeAgo(request.created_at)}</span>
        </div>
      </div>

      <div className="rc-requester">
        <div className="req-av" style={{ background: avatarBg }}>
          {requesterInitial}
        </div>
        <div>
          <div className="req-name">{request.requester?.name || 'অজ্ঞাত'}</div>
          <div className="req-loc">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {request.location_upazila ? `${request.location_upazila}, ` : ''}{request.location_district}
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
            <span className="tr-val" style={request.urgency === 'days' ? { color: 'var(--urgent-green)' } : {}}>{tr.bn}</span>
            <div>
              <div className="tr-bn">{request.urgency === 'days' ? 'অনুসন্ধান' : 'বাকি'}</div>
              <div className="tr-en">{tr.en}</div>
            </div>
          </div>
          <div className="helper-count">
            <div>
              <div className="hc-text-bn">{helperCount} জন সাহায্য করতে চান</div>
              <div className="hc-text-en">{helperCount} people offered to help</div>
            </div>
          </div>
        </div>
        <button
          className={`btn-can-help ${isHelped ? 'helped' : ''}`}
          onClick={handleHelp}
          disabled={isHelped || offerSubmitting || isResolved}
        >
          {isHelped ? '✅' : '🤝'}
          <div>
            <div className="bch-bn">
              {isHelped ? 'সাহায্যের প্রস্তাব দেওয়া হয়েছে' : offerSubmitting ? 'পাঠানো হচ্ছে...' : 'আমি সাহায্য করতে পারি'}
            </div>
            <div className="bch-en">{isHelped ? 'Offer Sent' : offerSubmitting ? 'Sending...' : 'I Can Help'}</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default HelpRequestCard;
