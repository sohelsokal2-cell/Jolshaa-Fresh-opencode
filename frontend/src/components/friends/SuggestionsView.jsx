import React, { useState } from 'react';
import { getAvatarColor, getInitial, toBnNumber } from './friendsHelpers';

const DEMO_SUGGESTIONS = [
  { id: 'p1', name: 'রিফাত হোসেন', mutual: 3 },
  { id: 'p2', name: 'নুসরাত জাহান', mutual: 7 },
  { id: 'p3', name: 'আরিফুল ইসলাম', mutual: 2 },
  { id: 'p4', name: 'মাহমুদা আক্তার', mutual: 5 },
  { id: 'p5', name: 'কামরুজ্জামান', mutual: 1 },
  { id: 'p6', name: 'ফারহানা পারভিন', mutual: 4 },
  { id: 'p7', name: 'সাইফুল ইসলাম', mutual: 6 },
  { id: 'p8', name: 'তাসনিয়া রহমান', mutual: 2 },
];

export default function SuggestionsView({ currentUserId, onAddFriend }) {
  const [dismissed, setDismissed] = useState({});
  const [added, setAdded] = useState({});

  async function handleAdd(s) {
    setAdded(prev => ({ ...prev, [s.id]: true }));
    try {
      await onAddFriend?.(s.id);
    } catch {
      setAdded(prev => { const n = { ...prev }; delete n[s.id]; return n; });
    }
  }

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <h3 className="fp-section-title">
          <span className="fp-st-bn">পরিচিতি হতে পারেন</span>
          <span className="fp-st-en">People You May Know</span>
        </h3>
      </div>
      <div className="fp-grid">
        {DEMO_SUGGESTIONS.filter(s => !dismissed[s.id]).map(s => (
          <div key={s.id} className="fp-card fp-card-suggestion">
            <button
              className="fp-card-dismiss"
              aria-label="Dismiss"
              onClick={() => setDismissed(prev => ({ ...prev, [s.id]: true }))}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="fp-card-top">
              <div className="fp-card-avatar" style={{ background: getAvatarColor(s.name) }}>
                <span className="fp-avatar-char">{getInitial(s.name)}</span>
              </div>
            </div>
            <div className="fp-card-info">
              <span className="fp-card-name">{s.name}</span>
              <span className="fp-card-mutual">{toBnNumber(s.mutual)} জন পারস্পরিক বন্ধু · {s.mutual} mutual</span>
            </div>
            {added[s.id] ? (
              <button className="fp-card-added-btn" disabled>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                অনুরোধ পাঠানো হয়েছে / Request Sent
              </button>
            ) : (
              <button
                className="fp-card-add-btn"
                onClick={() => handleAdd(s)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                বন্ধু যোগ করো / Add Friend
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
