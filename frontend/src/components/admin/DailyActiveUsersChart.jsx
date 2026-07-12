import React, { useState } from 'react';
import { useToast } from '../Toast';

const DATA = {
  '7d': [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 98 },
    { label: 'Wed', value: 145 },
    { label: 'Thu', value: 110 },
    { label: 'Fri', value: 160 },
    { label: 'Sat', value: 85 },
    { label: 'Sun', value: 130 },
  ],
  '30d': [
    { label: 'W1', value: 820 },
    { label: 'W2', value: 950 },
    { label: 'W3', value: 780 },
    { label: 'W4', value: 1100 },
  ],
  '90d': [
    { label: 'Jan', value: 2400 },
    { label: 'Feb', value: 2800 },
    { label: 'Mar', value: 3200 },
  ],
};

export default function DailyActiveUsersChart() {
  const [activeTab, setActiveTab] = useState('7d');
  const { showToast } = useToast();
  const bars = DATA[activeTab];
  const max = Math.max(...bars.map((b) => b.value));

  const handleClick = (bar) => {
    showToast(`DAU for ${bar.label}: ${bar.value.toLocaleString()} users`);
  };

  return (
    <div className="activity-card">
      <div className="ac-hdr">
        <div>
          <div className="ac-title">Daily Active Users</div>
          <div className="ac-bn">দৈনিক সক্রিয় ব্যবহারকারী</div>
        </div>
        <div className="ac-tabs">
          {['7d', '30d', '90d'].map((tab) => (
            <button
              key={tab}
              className={`act-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="bar-chart">
        {bars.map((bar) => (
          <div className="bar-wrap" key={bar.label}>
            <div
              className="bar"
              style={{
                height: `${(bar.value / max) * 100}%`,
                background: 'linear-gradient(to top, #1B6B5A, #2a9678)',
              }}
              title={`${bar.label}: ${bar.value}`}
              onClick={() => handleClick(bar)}
            />
            <div className="bar-lbl">{bar.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
