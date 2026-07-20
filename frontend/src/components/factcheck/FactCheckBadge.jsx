import React from 'react';
import './FactCheckBadge.css';

/**
 * FactCheckBadge — Small badge used inside PostCard to show verification status.
 *
 * Props:
 *   enabled: boolean — whether fact-check is enabled on this post (if false, renders nothing)
 *   status: 'unverified' | 'true' | 'false' | 'mislead'
 *   onClick: callback when unverified badge is clicked (opens vote modal)
 *   voteCount: number of votes (for display)
 *   percentage: percentage of majority verdict (for true/mislead display)
 */
export default function FactCheckBadge({ enabled = false, status = 'unverified', onClick, voteCount = 0, percentage }) {
  if (!enabled) return null;
  if (status === 'true') {
    return (
      <div className="fcbadge-true">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--true-mid)" strokeWidth="3" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ✓ সত্যি বলে মনে হচ্ছে
        {percentage && (
          <span className="fcbadge-true-en" style={{ marginLeft: 4 }}>
            · {percentage}% community verified
          </span>
        )}
      </div>
    );
  }

  if (status === 'mislead') {
    return (
      <div className="fcbadge-mislead">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--mislead-mid)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        ~ বিভ্রান্তিকর
        {percentage && (
          <span style={{ fontFamily: 'var(--font-en)', fontSize: 9, color: 'var(--mislead-amb)', marginLeft: 4 }}>
            · {percentage}% flagged misleading
          </span>
        )}
      </div>
    );
  }

  if (status === 'false') {
    return (
      <div className="fcbadge-mislead" style={{
        background: 'var(--false-pale, #fdf0ef)',
        borderColor: 'var(--false-border, rgba(217,83,79,0.20))',
        color: 'var(--false-mid, #c0392b)',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--false-mid)" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        ✗ গুজব
        {percentage && (
          <span style={{ fontFamily: 'var(--font-en)', fontSize: 9, color: 'var(--false-coral)', marginLeft: 4 }}>
            · {percentage}% flagged false
          </span>
        )}
      </div>
    );
  }

  // Default: unverified — clickable chip
  return (
    <button className="fcbadge-unverified" onClick={onClick} aria-label="ভোট দিন">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
      </svg>
      ⚑ ভোট দিন
      <span style={{ fontFamily: 'var(--font-en)', fontSize: 9, opacity: 0.7 }}>/ Vote</span>
      {voteCount > 0 && (
        <span style={{ fontFamily: 'var(--font-en)', fontSize: 9, opacity: 0.6 }}>
          ({voteCount})
        </span>
      )}
    </button>
  );
}
