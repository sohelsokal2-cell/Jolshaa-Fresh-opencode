import React, { useState, useEffect, useCallback, useRef } from 'react';

const W = 540;
const H = 180;
const MAX_VAL = 12000;

const TABS = [
  { id: '7d', label: '৭ দিন' },
  { id: '30d', label: '৩০ দিন' },
  { id: '3m', label: '৩ মাস' },
];

const X_LABELS = {
  '7d': ['Jun 30', 'Jul 1', 'Jul 2', 'Jul 3', 'Jul 4', 'Jul 5', 'Jul 6'],
  '30d': ['Jun 12', 'Jun 17', 'Jun 22', 'Jun 27', 'Jul 2', 'Jul 7'],
  '3m': ['Apr 12', 'May 12', 'Jun 12', 'Jul 7'],
};

function generateData(n) {
  let data = [];
  let v = 3000 + Math.random() * 2000;
  for (let i = 0; i < n; i++) {
    v = Math.max(800, Math.min(MAX_VAL, v + (Math.random() - 0.44) * 1800));
    data.push(Math.round(v));
  }
  data[data.length - 1] = Math.round(data[data.length - 1] * 1.1);
  return data;
}

function valueToY(v) {
  return H - (v / MAX_VAL) * H;
}

function indexToX(i, n) {
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

function buildChartData(n) {
  const totalData = generateData(n);
  const subData = totalData.map((v) => Math.round(v * (0.30 + Math.random() * 0.12)));
  const pts = totalData.map((v, i) => ({ x: indexToX(i, n), y: valueToY(v) }));
  const subPts = subData.map((v, i) => ({ x: indexToX(i, n), y: valueToY(v) }));
  return { totalData, subData, pts, subPts };
}

const TAB_COUNTS = { '7d': 7, '30d': 30, '3m': 30 };

export default function EarningsChart() {
  const [activeTab, setActiveTab] = useState('30d');
  const [chartData, setChartData] = useState(() => buildChartData(TAB_COUNTS['30d']));
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
  const svgRef = useRef(null);

  useEffect(() => {
    setChartData(buildChartData(TAB_COUNTS[activeTab]));
    setTooltip({ visible: false, x: 0, y: 0, text: '' });
  }, [activeTab]);

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

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

  const { totalData, pts, subPts } = chartData;
  const smooth = smoothPath(pts);
  const smoothSub = smoothPath(subPts);
  const areaPath = smooth + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const areaGold = smoothSub + ` L ${subPts[subPts.length - 1].x} ${H} L ${subPts[0].x} ${H} Z`;

  const n = pts.length;

  return (
    <div className="chart-card">
      <div className="cc-header">
        <div>
          <div className="cc-title-bn">আয়ের প্রবণতা</div>
          <div className="cc-title-en">Earnings Trend · {activeTab === '7d' ? 'Last 7 Days' : activeTab === '30d' ? 'Last 30 Days' : 'Last 3 Months'}</div>
        </div>
        <div className="cc-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`cc-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-svg-wrap" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Y-axis labels */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '0 6px 32px 0', width: 36, textAlign: 'right',
          }}>
            {['12k', '9k', '6k', '3k', '0'].map((lbl) => (
              <span key={lbl} style={{ fontFamily: 'var(--font-en)', fontSize: '8.5px', color: 'var(--text-xlight)' }}>
                {lbl}
              </span>
            ))}
          </div>

          {/* SVG chart area */}
          <div style={{ flex: 1, position: 'relative' }}>
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
                <linearGradient id="chartGradGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A017" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
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

              {/* Area fills */}
              <path d={areaPath} fill="url(#chartGradTeal)" />
              <path d={areaGold} fill="url(#chartGradGold)" />

              {/* Main line (total) */}
              <path d={smooth} fill="none" stroke="url(#lineGradient)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

              {/* Sub line (subscriptions) */}
              <path d={smoothSub} fill="none" stroke="#D4A017" strokeWidth="1.8" strokeDasharray="5 3" strokeLinecap="round" />

              {/* Data dots (every 5th + last) */}
              {pts.map((p, i) => {
                if (i % 5 !== 0 && i !== n - 1) return null;
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

              {/* Hover strips (invisible rects for mouse events) */}
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
                    onMouseEnter={() => handleDotEnter(p, totalData[i])}
                    onMouseLeave={handleDotLeave}
                  />
                );
              })}
            </svg>

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
          {(X_LABELS[activeTab] || []).map((lbl) => (
            <span key={lbl} className="chart-x-lbl">{lbl}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingLeft: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 3, background: 'linear-gradient(to right,var(--teal),var(--gold))', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-light)' }}>মোট আয় / Total</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 0, borderTop: '1.5px dashed var(--gold)', background: 'none', borderRadius: 2, opacity: 0.7 }} />
          <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-light)' }}>সাবস্ক্রিপশন / Subscriptions</span>
        </div>
      </div>
    </div>
  );
}
