import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Toast';
import { useAuth } from '../../context/AuthContext';
import { fetchReports, reviewReport, dismissReport, logAdminAction } from '../../lib/adminApi';

const PRIORITY_COLORS = { high: '#DC2626', medium: '#D97706', low: '#16a34a' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function ReportsQueuePanel() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  const loadReports = useCallback(async (status = 'pending', priority = 'all') => {
    try {
      setLoading(true);
      const data = await fetchReports({ statusFilter: status, priorityFilter: priority });
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      showToast('রিপোর্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReports(filter, priorityFilter);
  }, [loadReports, filter, priorityFilter]);

  const handleAction = async () => {
    if (!confirmAction) return;
    const { type, reportId } = confirmAction;

    try {
      if (type === 'review') await reviewReport(reportId);
      else if (type === 'dismiss') await dismissReport(reportId);

      await logAdminAction({
        adminId: user.id,
        action: `report_${type}`,
        targetType: 'report',
        targetId: reportId,
      });

      showToast(type === 'review' ? 'Report reviewed' : 'Report dismissed');
      setConfirmAction(null);
      loadReports(filter, priorityFilter);
    } catch (err) {
      console.error(`Report ${type} failed:`, err);
      showToast(`Action failed: ${err.message}`);
    }
  };

  const filtered = priorityFilter === 'all'
    ? reports
    : reports.filter((r) => r.priority === priorityFilter);

  return (
    <div>
      <div className="rp-hdr">
        <div>
          <div className="rp-title">Reports Queue</div>
          <div className="rp-bn">রিপোর্ট কিউ</div>
        </div>
        <span className="rp-count">{reports.length} {filter}</span>
      </div>

      {/* Status filter tabs */}
      <div className="rp-filters">
        {['pending', 'reviewed', 'dismissed'].map((s) => (
          <button
            key={s}
            className={`rpf-chip${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 0', flexWrap: 'wrap' }}>
        {['all', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            style={{
              padding: '4px 10px', borderRadius: 12, border: 'none', fontSize: 11, cursor: 'pointer',
              fontFamily: 'var(--font-en)',
              background: priorityFilter === p ? PRIORITY_COLORS[p] || 'var(--teal)' : 'var(--bg-main)',
              color: priorityFilter === p ? 'white' : 'var(--text-light)',
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>Loading...</div>
      ) : (
        filtered.map((report) => {
          const reporterName = report.reporter?.name || 'Unknown';
          const reporterInitial = reporterName.charAt(0).toUpperCase();
          const reporterColor = report.reporter?.profile_photo_url ? 'transparent' : '#7c3aed';

          return (
            <div key={report.id} className={`report-item ${report.priority}`}>
              <div className="ri-top">
                <div className="ri-av" style={{ background: reporterColor }}>
                  {report.reporter?.profile_photo_url ? (
                    <img src={report.reporter.profile_photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : reporterInitial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ri-reporter">{reporterName}</div>
                  <div className="ri-time">{timeAgo(report.created_at)}</div>
                </div>
                <span className={`ri-priority rip-${report.priority}`}>
                  ● {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                </span>
              </div>
              <div className="ri-preview">{report.reason}</div>
              <div className="ri-meta">
                <span className="ri-reason">📋 {report.reported_content_type}</span>
                {report.admin_note && (
                  <span style={{ fontSize: 10, color: 'var(--text-xlight)', fontFamily: 'var(--font-en)' }}>
                    Note: {report.admin_note}
                  </span>
                )}
              </div>
              {report.status === 'pending' && (
                <div className="ri-actions">
                  <button className="btn-review" onClick={() => setConfirmAction({ type: 'review', reportId: report.id })}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Review
                  </button>
                  <button className="btn-dismiss" onClick={() => setConfirmAction({ type: 'dismiss', reportId: report.id })}>
                    Dismiss
                  </button>
                </div>
              )}
              {report.status !== 'pending' && (
                <div style={{ padding: '4px 0', fontSize: 10, color: 'var(--text-xlight)', fontFamily: 'var(--font-en)' }}>
                  Status: {report.status}
                </div>
              )}
            </div>
          );
        })
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontFamily: 'var(--font-en)', fontSize: 12 }}>
          No reports match this filter.
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-en)' }}>
              {confirmAction.type === 'review' ? 'Review Report' : 'Dismiss Report'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16, fontFamily: 'var(--font-en)' }}>
              {confirmAction.type === 'review'
                ? 'Mark this report as reviewed?'
                : 'Dismiss this report? It will be removed from the queue.'}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmAction(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                  background: confirmAction.type === 'review' ? 'var(--teal)' : '#D97706',
                  color: 'white', cursor: 'pointer',
                }}
              >
                {confirmAction.type === 'review' ? 'Review' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
