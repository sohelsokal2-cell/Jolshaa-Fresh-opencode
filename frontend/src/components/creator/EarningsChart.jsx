import React, { useState, useEffect, useCallback, useRef } from 'react';

const W = 540;
const H = 180;

const TABS = [
  { id: '7d', label: '৭ দিন', days: 7 },
  { id: '30d', label: '৩০ দিন', days: 30 },
  { id: '3m', label: '৩ মাস', days: 90 },
];

function valueToY(v, maxVal) {
  if (maxVal === 0) return H;
  return H - (v / maxVal) * H;
}

function indexToX(i, n) {
  if (n <= 1) return W / 2;
  return (i / (n - 1)) * W;
}

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function EarningsChart({ chartData: rawData = [] }) {
  const [activeTab, setActiveTab] = useState('30d');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
  const svgRef = useRef(null);

  const days = TABS.find((t) => t.id === activeTab)?.days || 30;

  // Filter data by selected period
  const filteredData = rawData.filter((d) => {
    const date = new Date(d.day);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return date >= cutoff;
  });

  // Use actual amounts from RPC
  const amounts = filteredData.map((d) => Number(d.amount) || 0);
  const maxVal = Math.max(...amounts, 1000);

  // Build points
  const pts = amounts.map((v, i) => ({
    x: indexToX(i, amounts.length || 1),
    y: valueToY(v, maxVal),
  }));
  const smooth = smoothPath(pts);
  const areaPath = pts.length > 0
    ? smooth + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`
    : '';

  // X-axis labels — show up to 6 evenly spaced
  const xLabels = [];
  const step = Math.max(1, Math.floor(filteredData.length / 6));
  for (let i = 0; i < filteredData.length; i += step) {
    xLabels.push(formatDate(filteredData[i].day));
  }
  if (filteredData.length > 0) {
    const last = formatDate(filteredData[filteredData.length - 1].day);
    if (xLabels[xLabels.length - 1] !== last) xLabels.push(last);
  }

  // Y-axis labels
  const yLabels = [];
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * (4 - i));
    yLabels.push(val >= 1000 ? `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k` : String(val));
  }

  const handleDotEnter = useCallback((pt, value) => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const pxX = (pt.x / W) * svgRect.width;
    const pxY = (pt.y / H) * svgRect.height;
    setTooltip({
      visible: true,
      x: Math.min(pxX + 8, svgRect.width - 120),
      y: Math.max(pxY - 32, 4),
      text: `৳${value.toLocaleString()}`,
    });
  }, []);

  const handleDotLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const n = pts.length;

  return (
    <div className="chart-card">
      <div className="cc-header">
        <div>
          <div className="cc-title-bn">আয়ের প্রবণতা</div>
          <div className="cc-title-en">
            Earnings Trend ·{' '}
            {activeTab === '7d' ? 'Last 7 Days' : activeTab === '30d' ? 'Last 30 Days' : 'Last 3 Months'}
          </div>
        </div>
        <div className="cc-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`cc-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-svg-wrap" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Y-axis labels */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '0 6px 32px 0',
              width: 36,
              textAlign: 'right',
            }}
          >
            {yLabels.map((lbl) => (
              <span
                key={lbl}
                style={{ fontFamily: 'var(--font-en)', fontSize: '8.5px', color: 'var(--text-xlight)' }}
              >
                {lbl}
              </span>
            ))}
          </div>

          {/* SVG chart area */}
          <div style={{ flex: 1, position: 'relative' }}>
            {n > 0 ? (
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                width="100%"
                style={{ display: 'block' }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B6B5A" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1B6B5A" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1B6B5A" />
                    <stop offset="60%" stopColor="#2a9678" />
                    <stop offset="100%" stopColor="#D4A017" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Grid lines */}
                {[0, 45, 90, 135, 180].map((y) => (
                  <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#F0EBE3" strokeWidth="1" />
                ))}

                {/* Area fill */}
                <path d={areaPath} fill="url(#chartGradTeal)" />

                {/* Main line */}
                <path
                  d={smooth}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />

                {/* Data dots */}
                {pts.map((p, i) => {
                  if (n > 10 && i % Math.ceil(n / 10) !== 0 && i !== n - 1) return null;
                  return (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill={i === n - 1 ? 'var(--gold)' : 'var(--teal)'}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Hover strips */}
                {pts.map((p, i) => {
                  const step = W / n;
                  return (
                    <rect
                      key={`strip-${i}`}
                      x={p.x - step / 2}
                      y={0}
                      width={step}
                      height={H}
                      fill="transparent"
                      style={{ cursor: 'crosshair' }}
                      onMouseEnter={() => handleDotEnter(p, amounts[i])}
                      onMouseLeave={handleDotLeave}
                    />
                  );
                })}
              </svg>
            ) : (
              <div
                style={{
                  height: H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-xlight)',
                  fontSize: 12,
                }}
              >
                এখনো কোনো তথ্য নেই
              </div>
            )}

            {/* Tooltip */}
            <div
              className="chart-tooltip"
              style={{
                opacity: tooltip.visible ? 1 : 0,
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              {tooltip.text}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="chart-x-labels">
          {xLabels.map((lbl) => (
            <span key={lbl} className="chart-x-lbl">
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingLeft: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 18,
              height: 3,
              background: 'linear-gradient(to right,var(--teal),var(--gold))',
              borderRadius: 2,
            }}
          />
          <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-light)' }}>
            মোট আয় / Total
          </span>
        </div>
      </div>
    </div>
  );
}
