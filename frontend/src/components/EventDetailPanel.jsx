import { useState } from 'react';

const EventDetailPanel = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeGuestTab, setActiveGuestTab] = useState('going');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isGoing, setIsGoing] = useState(true);

  if (!event) {
    return (
      <aside className="detail-col" aria-label="Event detail">
        <div className="detail-col-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          একটি ইভেন্ট নির্বাচন করুন
        </div>
      </aside>
    );
  }

  const handleShare = (e) => {
    e.stopPropagation();
    console.log('Share:', event.title);
  };

  const handleDetailRsvp = () => {
    setIsGoing(!isGoing);
  };

  const goingGuests = event.guests?.going || [];
  const interestedGuests = event.guests?.interested || [];
  const currentGuests = activeGuestTab === 'going' ? goingGuests : interestedGuests;

  return (
    <aside className="detail-col" aria-label="Event detail">
      <div className="detail-col-inner">
        {/* Cover */}
        <div className="detail-cover">
          <div className="detail-cover-bg" style={{ background: event.coverGradient }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 35% 40%,rgba(124,58,237,0.18),transparent 60%)' }} />
            <span style={{ fontSize: '90px', opacity: 0.18, position: 'relative', zIndex: 1 }}>{event.emoji}</span>
          </div>
          <div className="detail-cover-overlay" />
          <div className="detail-date-badge">
            <div className="ddb-day">{event.day}</div>
            <div className="ddb-mon">{event.monthFull}</div>
            <div className="ddb-dow">{event.dayOfWeek}</div>
          </div>
          <div className="detail-cover-title">
            <div className="dct-title">{event.title}</div>
          </div>
        </div>

        {/* Body */}
        <div className="detail-body">
          <div className="detail-title">{event.title}</div>

          {/* When */}
          <div className="detail-info-row">
            <div className="dir-icon-wrap diw-teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div className="dir-bn">{event.whenBn} — {event.duration}</div>
              <div className="dir-en">{event.whenEn}</div>
            </div>
          </div>

          {/* Where */}
          <div className="detail-info-row">
            <div className="dir-icon-wrap diw-coral">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div className="dir-bn">{event.whereBn}</div>
              <div className="dir-en">{event.whereEn}</div>
            </div>
          </div>

          {/* Ticket */}
          {event.ticket && (
            <div className="detail-info-row" style={{ marginBottom: '14px' }}>
              <div className="dir-icon-wrap diw-amber">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M2 9a3 3 0 000 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 000-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z" />
                </svg>
              </div>
              <div>
                <div className="dir-bn">{event.ticket}</div>
                <div className="dir-en">{event.ticketEn}</div>
              </div>
            </div>
          )}

          {/* Host */}
          <div className="detail-host">
            <div className="dh-av" style={{ background: event.host.avatarBg }}>
              {event.host.avatar}
            </div>
            <div>
              <div className="dh-name">{event.host.name}</div>
              <div className="dh-role">{event.host.role}</div>
            </div>
            <button
              className="btn-follow-host"
              onClick={() => setIsFollowing(!isFollowing)}
              style={isFollowing ? { background: 'var(--teal)', color: 'white' } : {}}
            >
              {isFollowing ? '✓ ফলো করছেন' : '+ ফলো'}
            </button>
          </div>

          {/* Description */}
          <div className={`detail-desc ${!isExpanded ? 'clamped' : ''}`}>
            {event.description}
          </div>
          <button className="btn-read-more" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'কম পড়ুন / Read less' : 'আরও পড়ুন... / Read more'}
          </button>

          <div className="det-divider" />

          {/* Guest tabs */}
          <div className="guest-tabs-wrap">
            <div className="guest-tabs-hdr">অংশগ্রহণকারীরা / Guests</div>
            <div className="guest-tabs">
              <button
                className={`gtab ${activeGuestTab === 'going' ? 'active' : ''}`}
                onClick={() => setActiveGuestTab('going')}
              >
                ✓ যাচ্ছে ({goingGuests.length})
              </button>
              <button
                className={`gtab ${activeGuestTab === 'interested' ? 'active' : ''}`}
                onClick={() => setActiveGuestTab('interested')}
              >
                ♥ আগ্রহী ({interestedGuests.length})
              </button>
            </div>
            <div className="guest-list">
              {currentGuests.map((guest, i) => (
                <div key={i} className="guest-row">
                  <div className="ga-av" style={{ background: guest.avatarBg }}>
                    {guest.avatar}
                  </div>
                  <div>
                    <div className="ga-name">{guest.name}</div>
                    <div className="ga-mutual">{guest.mutual}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="det-divider" />

          {/* Comments preview */}
          <div className="detail-comments-hdr">মন্তব্য / Comments</div>
          {event.comments?.map((comment, i) => (
            <div key={i} className="comment-row">
              <div className="cr-av" style={{ background: comment.avatarBg }}>
                {comment.avatar}
              </div>
              <div className="cr-bubble">
                <div className="crb-name">{comment.name}</div>
                <div className="crb-text">{comment.text}</div>
              </div>
            </div>
          ))}
          <div className="comment-input-row">
            <div className="ci-av">আ</div>
            <input type="text" className="ci-input" placeholder="মন্তব্য করুন... / Write a comment..." />
          </div>
        </div>

        {/* Action buttons */}
        <div className="detail-actions">
          <button
            className="btn-det-rsvp"
            onClick={handleDetailRsvp}
            style={!isGoing ? { background: 'linear-gradient(135deg,#16a34a,#4ade80)' } : {}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {isGoing ? 'যাচ্ছি / Going' : 'যাচ্ছি ✓ / Going'}
          </button>
          <button className="btn-det-share" onClick={handleShare}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            শেয়ার
          </button>
        </div>
      </div>
    </aside>
  );
};

export default EventDetailPanel;
