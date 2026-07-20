import { useState, useEffect } from 'react';
import { CATEGORY_MAP, URGENCY_MAP } from '../utils/sahajjoHelpers';
import { useAuth } from '../context/AuthContext';
import { fetchHelpOffers, acceptHelper, resolveRequest, subscribeToHelpOffers } from '../lib/sahajjoApi';

const timeAgo = (dateStr) => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const HelpDetailPanel = ({ request, onRequestResolved }) => {
  const { user } = useAuth();
  const [helpers, setHelpers] = useState([]);
  const [loadingHelpers, setLoadingHelpers] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!request) return;
    let cancelled = false;

    async function load() {
      setLoadingHelpers(true);
      try {
        const offers = await fetchHelpOffers(request.id);
        if (!cancelled) setHelpers(offers);
      } catch (err) {
        console.error('Failed to load helpers:', err);
      } finally {
        if (!cancelled) setLoadingHelpers(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [request?.id]);

  // Realtime: subscribe to new offers for the selected request
  useEffect(() => {
    if (!request) return;

    const unsubscribe = subscribeToHelpOffers(request.id, () => {
      // Re-fetch full list with helper profile
      fetchHelpOffers(request.id).then((offers) => {
        setHelpers(offers);
      });
    });

    return () => unsubscribe();
  }, [request?.id]);

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
  const isResolved = request.status === 'resolved';
  const isOwner = user && request.requester_id === user.id;

  const requesterInitial = request.requester?.name?.[0] || '?';
  const avatarBg = 'linear-gradient(135deg,#1B6B5A,#4ECDC4)';

  const handleAccept = async (offerId) => {
    setAcceptingId(offerId);
    try {
      await acceptHelper(offerId);
      setHelpers((prev) =>
        prev.map((h) => (h.id === offerId ? { ...h, status: 'accepted' } : h))
      );
    } catch (err) {
      console.error('Failed to accept helper:', err);
      alert('গ্রহণ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await resolveRequest(request.id);
      if (onRequestResolved) onRequestResolved();
    } catch (err) {
      console.error('Failed to resolve request:', err);
      alert('সমাধান করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setResolving(false);
    }
  };

  const handleMessage = () => {
    console.log('Open Messenger for help coordination with:', request.requester?.name);
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
            <span className="dp-time-badge-bn">{isResolved ? 'সমাধান হয়েছে' : request.urgency === 'days' ? 'অনুসন্ধান' : 'বাকি'}</span>
            <span style={{ color: 'var(--text-xlight)', fontSize: '9px', fontFamily: 'var(--font-en)' }}>/ {isResolved ? 'resolved' : request.urgency === 'days' ? 'ongoing' : 'remaining'}</span>
          </div>
        </div>

        {/* Requester info */}
        <div className="dp-requester">
          <div className="dp-req-av" style={{ background: avatarBg }}>
            {requesterInitial}
          </div>
          <div>
            <div className="dp-req-name">{request.requester?.name || 'অজ্ঞাত'}</div>
            <div className="dp-req-loc">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {request.location_upazila ? `${request.location_upazila}, ` : ''}{request.location_district}
            </div>
            <div className="dp-req-time">{timeAgo(request.created_at)} পোস্ট করেছে · posted {timeAgo(request.created_at)}</div>
          </div>
          <button className="dp-msg-btn" title="বার্তা পাঠাও / Send Message" onClick={handleMessage}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        </div>

        {/* Image */}
        {request.image_url && (
          <div className="dp-image-wrap">
            <img src={request.image_url} alt="Help request" className="dp-image" />
          </div>
        )}

        {/* Full description */}
        <div className="dp-desc">
          <div className="dp-desc-text">{request.description}</div>
        </div>

        {/* Helper list header */}
        <div className="dp-helpers-hdr">
          <div>
            <div className="dp-helpers-bn">সাহায্যের প্রস্তাব</div>
            <div className="dp-helpers-en">People Who Offered to Help</div>
          </div>
          <span className="dp-helpers-count">{helpers.length} জন</span>
        </div>

        {/* Helper rows */}
        {loadingHelpers ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '12px' }}>
            লোড হচ্ছে...
          </div>
        ) : helpers.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '12px' }}>
            এখনো কেউ সাহায্যের প্রস্তাব দেননি।
          </div>
        ) : (
          helpers.map((helper) => {
            const isAccepted = helper.status === 'accepted';
            const helperInitial = helper.helper?.name?.[0] || '?';
            const helperAvatarBg = isAccepted
              ? 'linear-gradient(135deg,#1B6B5A,#4ECDC4)'
              : 'linear-gradient(135deg,#7c3aed,#a78bfa)';

            return (
              <div key={helper.id} className={`helper-row ${isAccepted ? 'helper-accepted' : ''}`}>
                <div className="helper-av" style={{ background: helperAvatarBg }}>
                  {helperInitial}
                </div>
                <div className="helper-info">
                  <div className="helper-name">{helper.helper?.name || 'অজ্ঞাত'}</div>
                  {helper.message && <div className="helper-msg">{helper.message}</div>}
                  <div className="helper-time">{timeAgo(helper.created_at)}</div>
                </div>
                {isOwner && !isResolved && (
                  <button
                    className={`btn-accept ${isAccepted ? 'accepted' : ''}`}
                    onClick={() => handleAccept(helper.id)}
                    disabled={isAccepted || acceptingId === helper.id}
                  >
                    {isAccepted && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <div>
                      <div className="btn-acc-bn">{isAccepted ? 'গৃহীত' : acceptingId === helper.id ? 'গ্রহণ হচ্ছে...' : 'গ্রহণ করো'}</div>
                      <div className="btn-acc-en">{isAccepted ? 'Accepted' : acceptingId === helper.id ? 'Accepting...' : 'Accept'}</div>
                    </div>
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Resolve button */}
        {isOwner && (
          <div className="dp-resolve-wrap">
            <button
              className={`btn-resolve ${isResolved ? 'resolved' : ''}`}
              onClick={handleResolve}
              disabled={isResolved || resolving}
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
                    <div className="br-bn">{resolving ? 'সমাধান হচ্ছে...' : 'সমস্যা সমাধান হয়েছে'}</div>
                    <div className="br-en">{resolving ? 'Resolving...' : 'Mark as Resolved'}</div>
                  </>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpDetailPanel;
