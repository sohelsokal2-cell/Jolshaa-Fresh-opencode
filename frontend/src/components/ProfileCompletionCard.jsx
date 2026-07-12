import React, { useState } from 'react';

const INITIAL_CHIPS = [
  { id: 'av', labelBn: 'প্রোফাইল ছবি', completed: false },
  { id: 'work', labelBn: 'কর্মস্থল', completed: false },
  { id: 'education', labelBn: 'শিক্ষা', completed: false },
];

export default function ProfileCompletionCard() {
  const [visible, setVisible] = useState(true);
  const [chips, setChips] = useState(INITIAL_CHIPS);

  if (!visible) return null;

  // Calculate dynamic completion percentage:
  // Base is 60%. Each completed task adds 13% or 14% to reach 100%.
  const completedCount = chips.filter(c => c.completed).length;
  let percent = 60;
  if (completedCount === 1) percent = 73;
  if (completedCount === 2) percent = 86;
  if (completedCount === 3) percent = 100;

  const handleChipClick = (id) => {
    setChips(prev =>
      prev.map(chip => (chip.id === id ? { ...chip, completed: true } : chip))
    );
  };

  return (
    <div className="completion-card" id="completionCard" aria-label="Profile completion prompt">
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
            {percent === 100
              ? 'Congratulations! Your profile is complete!'
              : `Your profile is ${percent}% complete — keep going!`}
          </div>
        </div>
      </div>
      <div className="completion-pct">{percent}% · {percent === 100 ? '১০০' : percent === 86 ? '৮৬' : percent === 73 ? '৭৩' : '৬০'}%</div>
      <div className="completion-bar-wrap">
        <div
          className="completion-bar-fill"
          style={{
            width: `${percent}%`,
            transition: 'width 0.4s ease',
            animation: 'none', // Override keyframe so transition handles subsequent changes smoothly
          }}
        ></div>
      </div>
      <div className="completion-chips">
        {chips.map(chip => (
          <button
            key={chip.id}
            className="completion-chip"
            style={
              chip.completed
                ? { background: 'var(--teal)', color: 'white', borderColor: 'var(--teal)', cursor: 'default' }
                : {}
            }
            disabled={chip.completed}
            aria-label={`${chip.labelBn} যোগ করুন`}
            onClick={() => handleChipClick(chip.id)}
          >
            {!chip.completed && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: '5px' }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
            {chip.completed ? `✓ ${chip.labelBn}` : chip.labelBn}
          </button>
        ))}
      </div>
    </div>
  );
}
