import React from 'react';

export default function AdminStatCard({ variant, label, bn, value, unit, trend, trendLabel, sparklineData }) {
  const points = sparklineData
    ? sparklineData.map((v, i, arr) => `${(i / (arr.length - 1)) * 100},${100 - (v / Math.max(...arr)) * 80}`).join(' ')
    : '0,80 20,60 40,70 60,40 80,50 100,20';

  return (
    <div className={`stat-card sc-${variant}`}>
      <div className="sc-top">
        <div className={`sc-icon sci-${variant}`}>
          {variant === 'users' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          )}
          {variant === 'active' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          )}
          {variant === 'reports' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          )}
          {variant === 'rev' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          )}
        </div>
        {trend && (
          <span className={`sc-trend ${trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'warn'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '⚠'} {trendLabel}
          </span>
        )}
      </div>
      <div className="sc-label">{label}</div>
      <div className="sc-bn">{bn}</div>
      <div className="sc-value">
        {unit && <span className="sc-unit">{unit}</span>}
        {value}
      </div>
      {sparklineData && (
        <div className="sc-sparkline">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 28 }}>
            <polyline
              points={points}
              fill="none"
              stroke={variant === 'users' ? '#1B6B5A' : variant === 'active' ? '#16a34a' : variant === 'reports' ? '#D97706' : '#7c3aed'}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
