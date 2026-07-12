import React from 'react';

/**
 * RevenueBreakdown — donut chart + legend + segmented bar + BDT breakdown.
 *
 * Props:
 *  - segments: [{ id, labelBn, labelEn, color, percent, amount }]
 *    e.g. [{ id:'ads', labelBn:'বিজ্ঞাপন', labelEn:'Ad Revenue', color:'var(--teal)', percent:52, amount:'৳4,857' }, ...]
 *  - total: string — center label amount (e.g. '৳9.3k')
 */
export default function RevenueBreakdown({ segments, total }) {
  const R = 38;
  const C = 2 * Math.PI * R; // ~238.76

  let cumulativeOffset = 0;

  return (
    <div className="breakdown-card">
      <div className="bc-title-bn">রাজস্ব বিভাজন</div>
      <div className="bc-title-en">Revenue Breakdown · This Month</div>

      <div className="donut-wrap">
        <svg className="donut-svg" width="100" height="100" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="#F0EBE3" strokeWidth="14" />

          {/* Segment arcs */}
          {segments.map((seg) => {
            const segLen = (seg.percent / 100) * C;
            const gap = 1.5; // small gap between segments
            const offset = -cumulativeOffset;
            cumulativeOffset += segLen;

            return (
              <circle
                key={seg.id}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${segLen - gap} ${C - segLen + gap}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            );
          })}

          {/* Center label */}
          <text x="50" y="47" textAnchor="middle" fill="var(--text-dark)" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="800">
            {total}
          </text>
          <text x="50" y="59" textAnchor="middle" fill="#888" fontFamily="Inter,sans-serif" fontSize="7">
            Total
          </text>
        </svg>

        <div className="donut-legend">
          {segments.map((seg) => (
            <div className="dl-item" key={seg.id}>
              <div className="dl-dot" style={{ background: seg.color }} />
              <div>
                <div className="dl-bn">{seg.labelBn}</div>
                <div className="dl-en">{seg.labelEn}</div>
              </div>
              <div className="dl-pct" style={{ color: seg.color }}>{seg.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Segmented bar */}
      <div className="seg-bar">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className="seg-bar-piece"
            style={{ flex: seg.percent, background: seg.color }}
          />
        ))}
      </div>

      {/* BDT amount rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((seg) => (
          <div
            key={seg.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              borderRadius: 8,
              background: seg.id === 'ads' ? 'var(--teal-xpale)' : seg.id === 'subs' ? 'var(--gold-pale)' : 'var(--coral-pale)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-bn)', fontSize: 12, color: seg.color }}>
              {seg.labelBn}
            </span>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: 13, fontWeight: 800, color: seg.color }}>
              {seg.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
