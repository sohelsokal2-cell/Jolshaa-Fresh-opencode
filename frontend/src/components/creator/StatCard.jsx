import React from 'react';
import { useToast } from '../Toast';

/**
 * StatCard — reusable stat card for the Creator Dashboard.
 *
 * Props:
 *  - variant: 'total' | 'available' | 'pending' | 'month'
 *  - label: { bn: string, en: string }
 *  - amount: string (formatted BDT amount)
 *  - subtitle: string (optional bottom note)
 *  - change: { direction: 'up'|'down', text: string } (optional)
 *  - showPayoutBtn: boolean (only true for 'available' variant)
 */
export default function StatCard({ variant, label, amount, subtitle, change, showPayoutBtn }) {
  const { showToast } = useToast();

  const variantClass = {
    total: 'sc-total',
    available: 'sc-avail',
    pending: 'sc-pending',
    month: 'sc-month',
  }[variant];

  const iconClass = {
    total: 'sci-total',
    available: 'sci-avail',
    pending: 'sci-pending',
    month: 'sci-month',
  }[variant];

  const icons = {
    total: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>
        <path d="M8 12s1-2 4-2 4 2 4 2-1 2-4 2-4-2-4-2"/>
      </svg>
    ),
    available: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-deep)" strokeWidth="2.2" strokeLinecap="round">
        <rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 10h20"/><circle cx="12" cy="15" r="1.5" fill="var(--gold-deep)"/>
      </svg>
    ),
    pending: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    month: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  };

  return (
    <div className={`stat-card ${variantClass}`}>
      <div className={`sc-icon ${iconClass}`}>
        {icons[variant]}
      </div>
      <div className="sc-label-bn">{label.bn}</div>
      <div className="sc-label-en">{label.en}</div>
      <div className="sc-amount">
        <span className="sc-currency">৳</span>
        {amount}
      </div>

      {subtitle && (
        <div style={{
          fontFamily: 'var(--font-en)',
          fontSize: 10,
          color: variant === 'total' ? 'rgba(255,255,255,0.40)' : variant === 'pending' ? 'rgba(124,58,237,0.50)' : 'var(--text-light)',
          marginTop: 4,
        }}>
          {subtitle}
        </div>
      )}

      {change && (
        <div className={`sc-change ${change.direction}`}>
          {change.direction === 'up' ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          )}
          {change.text}
        </div>
      )}

      {showPayoutBtn && (
        <button
          className="btn-card-payout"
          onClick={() => showToast('পেআউট অনুরোধ পাঠানো হচ্ছে...')}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="2.8" strokeLinecap="round"><path d="M12 2v14m0 0l-4-4m4 4l4-4M3 18h18"/></svg>
          উত্তোলনের অনুরোধ করো
        </button>
      )}
    </div>
  );
}
