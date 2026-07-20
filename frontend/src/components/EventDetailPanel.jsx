import { useState } from 'react';

const EventDetailPanel = ({ event, myRsvp, onRsvpChange, eventId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeGuestTab, setActiveGuestTab] = useState('going');

  if (!event) {
    return (
      <aside className="detail-col" aria-label="Event detail">
        <div className="detail-col-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          একটি ইভেন্ট নির্বাচন করুন
        </div>
      </aside>
    );
  }

  const rsvp = myRsvp || 'none';

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    }
  };

  const handleRsvp = (status) => {
    if (onRsvpChange && eventId) onRsvpChange(eventId, status);
  };

  const goingGuests = event.guests?.going || [];
  const interestedGuests = event.guests?.interested || [];
  const currentGuests = activeGuestTab === 'going' ? goingGuests : interestedGuests;
  const goingCount = event.goingCount || 0;
  const interestedCount = event.interestedCount || 0;

  const { dayBn, monthFull, dayOfWeek } = event.event_date ? (() => {
    const d = new Date(event.event_date);
    return {
      dayBn: d.toLocaleDateString('bn-BD', { day: 'numeric' }),
      monthFull: d.toLocaleDateString('bn-BD', { month: 'long' }),
      dayOfWeek: d.toLocaleDateString('bn-BD', { weekday: 'long' }),
    };
  })() : { dayBn: event.day, monthFull: event.monthFull, dayOfWeek: event.dayOfWeek };

  const whenBn = event.whenBn || '';
  const whenEn = event.whenEn || '';

  return (
    <aside className="detail-col" aria-label="Event detail">
      <div className="detail-col-inner">
        {/* Cover */}
        <div className="detail-cover">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
            />
          ) : (
            <div className="detail-cover-bg" style={{ background: event.coverGradient || 'linear-gradient(140deg,#1a3a2a,#2d6a4a)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 35% 40%,rgba(124,58,237,0.18),transparent 60%)' }} />
              <span style={{ fontSize: '90px', opacity: 0.18, position: 'relative', zIndex: 1 }}>{event.emoji || '📅'}</span>
            </div>
          )}
          <div className="detail-cover-overlay" />
          <div className="detail-date-badge">
            <div className="ddb-day">{dayBn}</div>
            <div className="ddb-mon">{monthFull}</div>
            <div className="ddb-dow">{dayOfWeek}</div>
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
              <div className="dir-bn">{whenBn}</div>
              <div className="dir-en">{whenEn}</div>
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
              <div className="dir-bn">{event.whereBn || event.location_text || 'ঢাকা'}</div>
              <div className="dir-en">{event.whereEn || (event.location_type === 'online' ? 'Online Event' : 'Dhaka, Bangladesh')}</div>
            </div>
          </div>

          {/* Host */}
          <div className="detail-host">
            <div className="dh-av" style={{ background: 'linear-gradient(135deg,var(--teal),#2a9678)' }}>
              {event.hostName?.charAt(0) || '?'}
            </div>
            <div>
              <div className="dh-name">{event.hostName || 'অজানা আয়োজক'}</div>
              <div className="dh-role">আয়োজক / Host</div>
            </div>
          </div>

          {/* Description */}
          <div className={`detail-desc ${!isExpanded ? 'clamped' : ''}`}>
            {event.description}
          </div>
          {event.description && event.description.length > 100 && (
            <button className="btn-read-more" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'কম পড়ুন / Read less' : 'আরও পড়ুন... / Read more'}
            </button>
          )}

          <div className="det-divider" />

          {/* Guest tabs — only showing aggregate counts, no individual list from DB */}
          <div className="guest-tabs-wrap">
            <div className="guest-tabs-hdr">অংশগ্রহণকারীরা / Guests</div>
            <div className="guest-tabs">
              <button
                className={`gtab ${activeGuestTab === 'going' ? 'active' : ''}`}
                onClick={() => setActiveGuestTab('going')}
              >
                ✓ যাচ্ছে ({goingCount})
              </button>
              <button
                className={`gtab ${activeGuestTab === 'interested' ? 'active' : ''}`}
                onClick={() => setActiveGuestTab('interested')}
              >
                ♥ আগ্রহী ({interestedCount})
              </button>
            </div>
            <div className="guest-list">
              {currentGuests.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                  {activeGuestTab === 'going' ? 'এখনো কেউ যাচ্ছে না' : 'এখনো কেউ আগ্রহী নন'}
                </div>
              ) : (
                currentGuests.map((guest, i) => (
                  <div key={i} className="guest-row">
                    <div className="ga-av" style={{ background: 'linear-gradient(135deg,var(--teal),#2a9678)' }}>
                      {guest.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="ga-name">{guest.name}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="det-divider" />
        </div>

        {/* Action buttons */}
        <div className="detail-actions">
          <button
            className="btn-det-rsvp"
            onClick={() => handleRsvp(rsvp === 'going' ? 'not_going' : 'going')}
            style={rsvp === 'going' ? { background: 'linear-gradient(135deg,#16a34a,#4ade80)' } : {}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {rsvp === 'going' ? 'যাচ্ছি ✓ / Going' : 'যাচ্ছি / Going'}
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
