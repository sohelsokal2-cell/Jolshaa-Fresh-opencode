import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUpcomingBirthdays } from '../../lib/friendsApi';
import { getAvatarColor, getInitial } from './friendsHelpers';

function toBnNumber(n) {
  const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(n).replace(/\d/g, d => bnDigits[parseInt(d)]);
}

function getBirthdayLabel(daysUntil) {
  if (daysUntil === 0) return 'আজ · Today';
  if (daysUntil === 1) return 'আগামীকাল · Tomorrow';
  return `${toBnNumber(daysUntil)} দিন পর · In ${daysUntil} days`;
}

export default function BirthdaysView() {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadBirthdays();
  }, [user]);

  async function loadBirthdays() {
    setLoading(true);
    try {
      const data = await fetchUpcomingBirthdays(user.id);
      setBirthdays(data);
    } catch (err) {
      console.error('Failed to load birthdays:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fp-section">
        <div className="fp-section-head">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">জন্মদিন</span>
            <span className="fp-st-en">Birthdays</span>
          </h3>
        </div>
        <div className="fp-loading">
          <div className="fp-spinner"></div>
          <span>লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <h3 className="fp-section-title">
          <span className="fp-st-bn">জন্মদিন</span>
          <span className="fp-st-en">Birthdays</span>
        </h3>
      </div>
      {birthdays.length === 0 ? (
        <div className="fp-empty">
          <div className="fp-empty-icon">🎂</div>
          <p className="fp-empty-bn">আগামী ৩০ দিনে কোনো বন্ধুর জন্মদিন নেই</p>
          <p className="fp-empty-en">No friend birthdays in the next 30 days</p>
        </div>
      ) : (
        <div className="fp-bday-list">
          {birthdays.map(b => (
            <div key={b.id} className="fp-bday-row">
              <div
                className="fp-bday-avatar"
                style={{ background: b.avatarUrl ? 'none' : getAvatarColor(b.name) }}
              >
                {b.avatarUrl ? (
                  <img src={b.avatarUrl} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span className="fp-avatar-char">{getInitial(b.name)}</span>
                )}
              </div>
              <div className="fp-bday-info">
                <span className="fp-bday-name">{b.name}</span>
                <span className="fp-bday-date">{getBirthdayLabel(b.daysUntil)}</span>
              </div>
              <button className="fp-btn fp-btn-accept">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                শুভেচ্ছা পাঠান / Wish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
