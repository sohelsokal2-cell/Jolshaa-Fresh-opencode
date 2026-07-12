import React from 'react';

const DEFAULT_HIGHLIGHTS = [
  {
    id: 1,
    emoji: '🌅',
    labelBn: 'ভ্রমণ',
    colorClass: 'hl-1',
  },
  {
    id: 2,
    emoji: '🍛',
    labelBn: 'খাবার',
    colorClass: 'hl-2',
  },
  {
    id: 3,
    emoji: '🌿',
    labelBn: 'প্রকৃতি',
    colorClass: 'hl-3',
  },
];

export default function HighlightsCard({
  highlights = DEFAULT_HIGHLIGHTS,
  onAddHighlightClick,
  onHighlightClick,
}) {
  return (
    <div className="profile-card" aria-label="Highlights card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-bn">হাইলাইটস</span>
          <span className="card-title-en">Highlights</span>
        </div>
        <button
          className="card-edit-btn"
          aria-label="হাইলাইট পরিচালনা / Manage highlights"
          onClick={onAddHighlightClick}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div className="highlights-scroll" role="list" aria-label="Highlights list">
        {/* Add highlights — dashed-border circle prompt */}
        <div
          className="highlight-add"
          role="button"
          tabIndex="0"
          aria-label="হাইলাইট যোগ করুন / Add highlight"
          onClick={onAddHighlightClick}
        >
          <div className="highlight-add-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div className="highlight-add-label-bn">হাইলাইট যোগ করুন</div>
          <div className="highlight-add-label-en">Add Highlight</div>
        </div>

        {/* Filled highlight items */}
        {highlights.map(hl => (
          <div
            key={hl.id}
            className="highlight-item"
            role="listitem"
            tabIndex="0"
            aria-label={`${hl.labelBn} হাইলাইট`}
            onClick={() => onHighlightClick?.(hl)}
          >
            <div className="highlight-circle">
              <div className={`highlight-bg ${hl.colorClass}`}>
                {hl.emoji}
              </div>
            </div>
            <div className="highlight-label-bn">{hl.labelBn}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
