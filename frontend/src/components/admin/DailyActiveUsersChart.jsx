import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { fetchDailyActiveUsers } from '../../lib/adminApi';

export default function DailyActiveUsersChart() {
  const [activeTab, setActiveTab] = useState('30d');
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const days = activeTab === '7d' ? 7 : activeTab === '30d' ? 30 : 90;
        const data = await fetchDailyActiveUsers(days);

        // Aggregate into groups for display
        let grouped;
        if (activeTab === '7d') {
          grouped = data.map((d) => ({
            label: new Date(d.day).toLocaleDateString('en-US', { weekday: 'short' }),
            value: d.count,
          }));
        } else if (activeTab === '30d') {
          // Group by week
          grouped = [];
          for (let i = 0; i < data.length; i += 7) {
            const week = data.slice(i, i + 7);
            const sum = week.reduce((s, d) => s + d.count, 0);
            grouped.push({
              label: `W${Math.floor(i / 7) + 1}`,
              value: sum,
            });
          }
        } else {
          // Group by month
          const monthMap = {};
          data.forEach((d) => {
            const month = d.day.slice(0, 7);
            monthMap[month] = (monthMap[month] || 0) + d.count;
          });
          grouped = Object.entries(monthMap).map(([month, count]) => ({
            label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
            value: count,
          }));
        }

        setBars(grouped);
      } catch (err) {
        console.error('DAU chart error:', err);
        showToast('চার্ট লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab, showToast]);

  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="activity-card">
      <div className="ac-hdr">
        <div>
          <div className="ac-title">User Signups</div>
          <div className="ac-bn">নতুন ব্যবহারকারী (চেক বৃদ্ধি)</div>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>Loading...</div>
      ) : (
        <div className="bar-chart">
          {bars.map((bar) => (
            <div className="bar-wrap" key={bar.label}>
              <div
                className="bar"
                style={{
                  height: `${(bar.value / max) * 100}%`,
                  background: 'linear-gradient(to top, #1B6B5A, #2a9678)',
                }}
                title={`${bar.label}: ${bar.value} signups`}
              />
              <div className="bar-lbl">{bar.label}</div>
            </div>
          ))}
          {bars.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontFamily: 'var(--font-en)', fontSize: 12, width: '100%' }}>
              No data yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
