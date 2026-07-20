import React, { useState } from 'react';
import { highlightMatch } from '../utils/highlight';

const DEFAULT_EVENTS = [
  {
    id: 1,
    title: 'মন্টুর কমেডি নাইট',
    description: 'ঢাকার কেন্দ্রীয় শহীদ মিনারে বিশাল কমেডি শো।',
    dateText: '২৫ ডিসেম্বর, ২০২৫',
    locationText: 'কেন্দ্রীয় শহীদ মিনার, ঢাকা',
    category: 'বিনোদন',
    coverUrl: null,
    gradient: 'linear-gradient(135deg,#fce7f3,#f9a8d4)',
    emoji: '🎭',
    hostName: 'মন্টু মিয়া'
  },
  {
    id: 2,
    title: 'বাংলা বইমেলা ২০২৫',
    description: 'বছরের সবচেয়ে বড় বই মেলা। হাজার হাজার বই ও লেখক।',
    dateText: '১৫-৩১ জানুয়ারি, ২০২৬',
    locationText: 'বঙ্গবন্ধু কনভেনশন সেন্টার, ঢাকা',
    category: 'শিক্ষা',
    coverUrl: null,
    gradient: 'linear-gradient(135deg,#d1fae5,#6ee7b7)',
    emoji: '📚',
    hostName: 'বাংলা একাডেমি'
  },
  {
    id: 3,
    title: 'ঢাকা ম্যারাথন ২০২৬',
    description: 'আন্তর্জাতিক ম্যারাথন প্রতিযোগিতা। ১০কিমি ও ২১কিমি বিভাগ।',
    dateText: '১০ ফেব্রুয়ারি, ২০২৬',
    locationText: 'হাতিরঝিল, ঢাকা',
    category: 'খেলাধুলা',
    coverUrl: null,
    gradient: 'linear-gradient(135deg,#bae6fd,#7dd3fc)',
    emoji: '🏃',
    hostName: 'বাংলাদেশ অলিম্পিক অ্যাসোসিয়েশন'
  }
];

export default function EventsResultsCard({
  events = DEFAULT_EVENTS,
  searchQuery = '',
  totalCountText = '৩টি',
  onSeeAllClick
}) {
  const [rsvpStates, setRsvpStates] = useState(() => {
    const initial = {};
    events.forEach(e => { initial[e.id] = null; });
    return initial;
  });

  const handleRsvp = (id, status) => {
    setRsvpStates(prev => ({ ...prev, [id]: prev[id] === status ? null : status }));
  };

  return (
    <div className="result-card" id="eventsCard">
      <div className="rc-header">
        <div className="rc-title-wrap">
          <div className="rc-icon" style={{ background: 'linear-gradient(135deg,#ec4899,#f43f5e)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="3"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div className="rc-title-bn">ইভেন্ট</div>
            <div className="rc-title-en">Events</div>
          </div>
        </div>
        <span className="rc-count-badge">{totalCountText}</span>
      </div>

      <div className="pages-list">
        {events.map((event, idx) => {
          const rsvp = rsvpStates[event.id];
          return (
            <React.Fragment key={event.id}>
              {idx > 0 && <div className="pr-divider" />}
              <div className="page-row">
                <div className="page-thumb" style={{ background: event.coverUrl ? 'none' : (event.gradient || 'linear-gradient(135deg,#ec4899,#f43f5e)') }}>
                  {event.coverUrl ? (
                    <img src={event.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                  ) : (
                    <span>{event.emoji || '📅'}</span>
                  )}
                </div>

                <div className="pgr-info">
                  <div className="pgr-name">{highlightMatch(event.title, searchQuery)}</div>
                  <div className="pgr-cat-row">
                    <span className="pgr-cat">{event.category}</span>
                    {event.dateText && <span className="pgr-fol"> · {event.dateText}</span>}
                  </div>
                  {event.locationText && (
                    <div className="pgr-desc" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {event.locationText}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    className={`btn-follow ${rsvp === 'going' ? 'following' : ''}`}
                    style={{ padding: '6px 10px', fontSize: '10px' }}
                    onClick={() => handleRsvp(event.id, 'going')}
                  >
                    {rsvp === 'going' ? '✓ যাচ্ছি' : 'যাচ্ছি'}
                  </button>
                  <button
                    className={`btn-follow ${rsvp === 'interested' ? 'following' : ''}`}
                    style={{ padding: '6px 10px', fontSize: '10px' }}
                    onClick={() => handleRsvp(event.id, 'interested')}
                  >
                    {rsvp === 'interested' ? '✓ আগ্রহী' : 'আগ্রহী'}
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="rc-see-all">
        <button className="btn-see-all" onClick={onSeeAllClick}>
          <span className="btn-sa-bn">সব দেখো</span>
          See all {totalCountText} events
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
