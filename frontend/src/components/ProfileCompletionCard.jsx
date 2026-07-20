import React, { useState } from 'react';

const COMPLETION_FIELDS = [
  { id: 'avatar', labelBn: 'প্রোফাইল ছবি', field: 'profile_photo_url' },
  { id: 'bio', labelBn: 'বায়ো', field: 'bio' },
  { id: 'location', labelBn: 'লোকেশন', field: 'location' },
];

export default function ProfileCompletionCard({ profileData }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const completedCount = COMPLETION_FIELDS.filter(f => profileData?.[f.field]).length;
  const percent = Math.round((completedCount / COMPLETION_FIELDS.length) * 100);

  if (percent === 100) return null;

  return (
    <div className="completion-card" aria-label="Profile completion prompt">
      <button
        className="completion-dismiss"
        onClick={() => setVisible(false)}
        aria-label="বন্ধ করুন / Dismiss"
      >
        ✕
      </button>
      <div className="completion-header">
        <span className="completion-emoji">🌟</span>
        <div>
          <div className="completion-title-bn">তোমার প্রোফাইল {percent}% সম্পূর্ণ</div>
          <div className="completion-title-en">
            Your profile is {percent}% complete — keep going!
          </div>
        </div>
      </div>
      <div className="completion-bar-wrap">
        <div
          className="completion-bar-fill"
          style={{ width: `${percent}%`, transition: 'width 0.4s ease' }}
        ></div>
      </div>
      <div className="completion-chips">
        {COMPLETION_FIELDS.map(chip => {
          const done = !!profileData?.[chip.field];
          return (
            <button
              key={chip.id}
              className="completion-chip"
              style={done
                ? { background: 'var(--teal)', color: 'white', borderColor: 'var(--teal)', cursor: 'default' }
                : {}
              }
              disabled={done}
            >
              {done ? `✓ ${chip.labelBn}` : chip.labelBn}
            </button>
          );
        })}
      </div>
    </div>
  );
}
