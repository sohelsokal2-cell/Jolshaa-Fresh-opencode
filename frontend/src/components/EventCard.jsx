import { useState } from 'react';

const CATEGORY_COLORS = {
  music: {
    chip: { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' },
    tab: '#7c3aed',
  },
  sports: {
    chip: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
    tab: '#16a34a',
  },
  community: {
    chip: { background: '#f2f9f7', color: 'var(--teal)', border: '1px solid var(--teal-pale)' },
    tab: 'var(--teal)',
  },
  online: {
    chip: { background: '#f2f9f7', color: 'var(--teal)', border: '1px solid var(--teal-pale)' },
    tab: 'var(--teal)',
  },
  education: {
    chip: { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' },
    tab: '#d97706',
  },
  arts: {
    chip: { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' },
    tab: '#7c3aed',
  },
  tech: {
    chip: { background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd' },
    tab: '#0ea5e9',
  },
};

const EventCard = ({ event, isWide, selectedEventId, onSelectEvent }) => {
  const [rsvp, setRsvp] = useState(event.initialRsvp || 'none');

  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.community;

  const handleRsvp = (e, value) => {
    e.stopPropagation();
    setRsvp(value);
  };

  const handleCardClick = () => {
    onSelectEvent(event.id);
  };

  return (
    <div
      className={`event-card ${isWide ? 'ec-wide' : ''} ${selectedEventId === event.id ? 'selected' : ''}`}
      onClick={handleCardClick}
      style={{ animationDelay: `${event.id * 0.04}s` }}
    >
      <div className="ec-cover">
        <div className="ec-cover-bg" style={{ background: event.coverGradient }}>
          <div className="ec-cover-overlay" />
          <div
            className="ec-cover-emoji"
            style={isWide ? { fontSize: '90px', opacity: 0.18 } : {}}
          >
            {event.emoji}
          </div>
        </div>

        {event.isOnline && (
          <div className="ec-online-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            <span className="eob-bn">অনলাইন</span>
            <span className="eob-en">/ Online</span>
          </div>
        )}

        <div className="ec-date-badge">
          <div className="edb-day">{event.day}</div>
          <div className="edb-mon">{event.monthShort}</div>
          <div className="edb-dow">{event.dayOfWeek}</div>
        </div>
      </div>

      {isWide ? (
        <div className="ec-body-row">
          <div className="ec-body">
            <div className="ec-category-chip" style={colors.chip}>
              {event.categoryEmoji} {event.categoryLabel}
            </div>
            <div className="ec-title">{event.title}</div>
            <div className="ec-when">
              <span className="ec-when-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <div>
                <div className="ec-when-bn">{event.whenBn}</div>
                <div className="ec-when-en">{event.whenEn}</div>
              </div>
            </div>
            <div className="ec-where">
              <span className="ec-where-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div>
                <div className="ec-where-bn">{event.whereBn}</div>
                <div className="ec-where-en">{event.whereEn}</div>
              </div>
            </div>
            <div className="ec-going-row">
              <div className="avatar-stack">
                {event.avatars.map((av, i) => (
                  <div
                    key={i}
                    className="av-sm"
                    style={{ background: av.bg }}
                  >
                    {av.letter}
                  </div>
                ))}
                {event.extraCount && (
                  <div className="av-sm" style={{ background: '#6b7280', fontSize: '8px' }}>
                    +{event.extraCount}
                  </div>
                )}
              </div>
              <div>
                <div className="ec-going-text">{event.goingText}</div>
                <div className="ec-going-en">{event.goingEn}</div>
              </div>
            </div>
          </div>
          <div className="ec-right">
            <div className="rsvp-control">
              <button
                className={`rsvp-btn rb-going ${rsvp === 'going' ? 'selected' : ''}`}
                onClick={(e) => handleRsvp(e, 'going')}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                যাচ্ছি
              </button>
              <button
                className={`rsvp-btn rb-interest ${rsvp === 'interested' ? 'selected' : ''}`}
                onClick={(e) => handleRsvp(e, 'interested')}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                আগ্রহী
              </button>
              <button
                className={`rsvp-btn rb-cant ${rsvp === 'cant' ? 'selected' : ''}`}
                onClick={(e) => handleRsvp(e, 'cant')}
              >
                ✕ পারব না
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="ec-body">
          <div className="ec-category-chip" style={colors.chip}>
            {event.categoryEmoji} {event.categoryLabel}
          </div>
          <div className="ec-title">{event.title}</div>
          <div className="ec-when">
            <span className="ec-when-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <div>
              <div className="ec-when-bn">{event.whenBn}</div>
              <div className="ec-when-en">{event.whenEn}</div>
            </div>
          </div>
          <div className="ec-where">
            <span className="ec-where-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div>
              <div className="ec-where-bn">{event.whereBn}</div>
              <div className="ec-where-en">{event.whereEn}</div>
            </div>
          </div>
          <div className="ec-going-row">
            <div className="avatar-stack">
              {event.avatars.map((av, i) => (
                <div
                  key={i}
                  className="av-sm"
                  style={{ background: av.bg }}
                >
                  {av.letter}
                </div>
              ))}
              {event.extraCount && (
                <div className="av-sm" style={{ background: '#6b7280', fontSize: '8px' }}>
                  +{event.extraCount}
                </div>
              )}
            </div>
            <div>
              <div className="ec-going-text">{event.goingText}</div>
              <div className="ec-going-en">{event.goingEn}</div>
            </div>
          </div>
          <div className="rsvp-control">
            <button
              className={`rsvp-btn rb-going ${rsvp === 'going' ? 'selected' : ''}`}
              onClick={(e) => handleRsvp(e, 'going')}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              যাচ্ছি
            </button>
            <button
              className={`rsvp-btn rb-interest ${rsvp === 'interested' ? 'selected' : ''}`}
              onClick={(e) => handleRsvp(e, 'interested')}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              আগ্রহী
            </button>
            <button
              className={`rsvp-btn rb-cant ${rsvp === 'cant' ? 'selected' : ''}`}
              onClick={(e) => handleRsvp(e, 'cant')}
            >
              ✕ পারব না
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
