import React from 'react';

const DEFAULT_REELS = [
  { id: 1, emoji: '🌅', count: '২.৪K', colorClass: 'rmt-1' },
  { id: 2, emoji: '🍛', count: '১.১K', colorClass: 'rmt-2' },
  { id: 3, emoji: '🌿', count: '৮৭৬', colorClass: 'rmt-3' },
  { id: 4, emoji: '🎶', count: '৩.৭K', colorClass: 'rmt-4' },
  { id: 5, emoji: '🚣', count: '৫৪৩', colorClass: 'rmt-5' },
  { id: 6, emoji: '🌃', count: '৯৩২', colorClass: 'rmt-6' },
];

export default function ReelsPreviewPanel({ reels = DEFAULT_REELS, onSeeAllClick, onReelClick }) {
  return (
    <div className="support-panel" aria-label="Reels tab preview">
      <div className="support-panel-header">
        <div className="sp-title">
          <span className="sp-title-bn">রিলস</span>
          <span className="sp-title-en">Reels</span>
        </div>
        <button
          className="sp-see-all"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={onSeeAllClick}
        >
          সব দেখুন · See all
        </button>
      </div>

      <div className="reels-mini-grid">
        {reels.map(reel => (
          <div
            key={reel.id}
            className="reels-mini-thumb"
            onClick={() => onReelClick?.(reel)}
          >
            <div className={`rmt-bg ${reel.colorClass}`}></div>
            <div className="rmt-emoji">{reel.emoji}</div>
            <div className="rmt-play">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21"/>
              </svg>
            </div>
            <div className="rmt-count">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ marginRight: '2px' }}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {reel.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
