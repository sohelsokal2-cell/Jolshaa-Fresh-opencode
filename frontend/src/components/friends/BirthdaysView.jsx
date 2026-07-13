import React from 'react';
import { getAvatarColor, getInitial } from './friendsHelpers';

const DEMO_BIRTHDAYS = [
  { id: 'b1', name: 'তানভীর আহমেদ', date: 'আজ · Today' },
  { id: 'b2', name: 'সামিয়া আক্তার', date: 'আগামীকাল · Tomorrow' },
  { id: 'b3', name: 'রাহেলা বেগম', date: '৩ দিন পর · In 3 days' },
  { id: 'b4', name: 'করিম উদ্দিন', date: '৫ দিন পর · In 5 days' },
];

export default function BirthdaysView() {
  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <h3 className="fp-section-title">
          <span className="fp-st-bn">জন্মদিন</span>
          <span className="fp-st-en">Birthdays</span>
        </h3>
      </div>
      <div className="fp-bday-list">
        {DEMO_BIRTHDAYS.map(b => (
          <div key={b.id} className="fp-bday-row">
            <div className="fp-bday-avatar" style={{ background: getAvatarColor(b.name) }}>
              <span className="fp-avatar-char">{getInitial(b.name)}</span>
            </div>
            <div className="fp-bday-info">
              <span className="fp-bday-name">{b.name}</span>
              <span className="fp-bday-date">{b.date}</span>
            </div>
            <button className="fp-btn fp-btn-accept">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              শুভেচ্ছা পাঠান / Wish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
