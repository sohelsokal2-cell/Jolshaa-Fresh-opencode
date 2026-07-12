import React, { useState } from 'react';
import { useToast } from '../Toast';

const REPORTS = [
  { id: 1, reporter: 'Tanvir H.', initials: 'TH', color: '#1B6B5A', time: '2 min ago', priority: 'high', preview: 'This user is posting spam links in multiple groups and comments sections repeatedly.', reason: 'Spam', reasonIcon: '🔗', count: 5 },
  { id: 2, reporter: 'Sabrina R.', initials: 'SR', color: '#7c3aed', time: '15 min ago', priority: 'med', preview: 'Spreading unverified health misinformation in cooking community posts.', reason: 'Rumor', reasonIcon: '📢', count: 3 },
  { id: 3, reporter: 'Arif K.', initials: 'AK', color: '#D97706', time: '1 hr ago', priority: 'low', preview: 'Harassment comments targeting other users in live comment section.', reason: 'Harassment', reasonIcon: '⚠', count: 2 },
  { id: 4, reporter: 'Nusrat J.', initials: 'NJ', color: '#16a34a', time: '3 hr ago', priority: 'high', preview: 'Hate speech targeting religious minorities in group discussion thread.', reason: 'Hate Speech', reasonIcon: '🚫', count: 8 },
  { id: 5, reporter: 'Rafiq U.', initials: 'RU', color: '#DC2626', time: '5 hr ago', priority: 'med', preview: 'Sharing copyrighted content without permission from original creators.', reason: 'Copyright', reasonIcon: '©', count: 4 },
];

export default function ReportsQueuePanel() {
  const [filter, setFilter] = useState('All');
  const { showToast } = useToast();

  const filtered = REPORTS.filter((r) => {
    if (filter === 'All') return true;
    if (filter === 'High') return r.priority === 'high';
    if (filter === 'Rumor') return r.reason === 'Rumor';
    if (filter === 'Spam') return r.reason === 'Spam';
    return true;
  });

  return (
    <div>
      <div className="rp-hdr">
        <div>
          <div className="rp-title">Reports Queue</div>
          <div className="rp-bn">রিপোর্ট কিউ</div>
        </div>
        <span className="rp-count">{REPORTS.length} pending</span>
      </div>

      <div className="rp-filters">
        {['All', 'High', 'Rumor', 'Spam'].map((f) => (
          <button
            key={f}
            className={`rpf-chip${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.map((report) => (
        <div key={report.id} className={`report-item ${report.priority}`}>
          <div className="ri-top">
            <div className="ri-av" style={{ background: report.color }}>{report.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ri-reporter">{report.reporter}</div>
              <div className="ri-time">{report.time}</div>
            </div>
            <span className={`ri-priority rip-${report.priority}`}>
              {report.priority === 'high' ? '● High' : report.priority === 'med' ? '● Med' : '● Low'}
            </span>
          </div>
          <div className="ri-preview">{report.preview}</div>
          <div className="ri-meta">
            <span className="ri-reason">{report.reasonIcon} {report.reason}</span>
            {report.count > 1 && (
              <span className="ri-count-chip">{report.count} reports</span>
            )}
          </div>
          <div className="ri-actions">
            <button className="btn-review" onClick={() => showToast(`TODO: Review report #${report.id}`)}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Review
            </button>
            <button className="btn-dismiss" onClick={() => showToast(`Report #${report.id} dismissed`)}>
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontFamily: 'var(--font-en)', fontSize: 12 }}>
          No reports match this filter.
        </div>
      )}
    </div>
  );
}
