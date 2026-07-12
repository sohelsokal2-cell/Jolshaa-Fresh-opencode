import React, { useState } from 'react';
import './FactCheckFalseOverlay.css';

/**
 * FactCheckFalseOverlay — wraps a PostCard children with blur overlay
 * for posts flagged as false/misinformation.
 *
 * Props:
 *   children: the PostCard content to wrap
 *   percentage: percentage of users who flagged as false (for display)
 *   onReveal: optional callback when "তবুও দেখুন" is clicked
 */
export default function FactCheckFalseOverlay({ children, percentage = 78, onReveal }) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    if (onReveal) onReveal();
  };

  return (
    <div className="fcf-overlay-wrap">
      <div className={isRevealed ? '' : 'fcf-blurred'}>
        {children}
      </div>
      {!isRevealed && (
        <div className="fcf-warning-banner" role="alert">
          <div className="fcf-wb-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div>
            <div className="fcf-wb-title-bn">⚠ এই পোস্টটি গুজব হতে পারে</div>
            <div className="fcf-wb-title-en">This post may be misinformation · {percentage}% flagged false</div>
          </div>
          <button className="fcf-btn-view-anyway" onClick={handleReveal}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            তবুও দেখুন <span style={{ fontFamily: 'var(--font-en)', fontSize: 9 }}>/ View Anyway</span>
          </button>
        </div>
      )}
    </div>
  );
}
