import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Toast';
import { fetchAuditLogs } from '../../lib/adminApi';

const ACTION_COLORS = {
  suspend: '#D97706',
  ban: '#DC2626',
  reactivate: '#16a34a',
  delete: '#DC2626',
  report_review: '#1B6B5A',
  report_dismiss: '#6b7280',
};

const ACTION_LABELS = {
  suspend: 'Suspended',
  ban: 'Banned',
  reactivate: 'Reactivated',
  delete: 'Deleted',
  report_review: 'Report Reviewed',
  report_dismiss: 'Report Dismissed',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminAuditLogsPanel() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadLogs = useCallback(async (filter = 'all', p = 0) => {
    try {
      setLoading(true);
      const result = await fetchAuditLogs({ actionFilter: filter, page: p });
      setLogs(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Audit logs error:', err);
      showToast('অডিট লগ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadLogs(actionFilter, page);
  }, [loadLogs, actionFilter, page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="overview-hdr">
        <div>
          <div className="oh-title">Audit Logs</div>
          <div className="oh-sub">অডিট লগ — Admin action history</div>
        </div>
        <span style={{ fontFamily: 'var(--font-en)', fontSize: 12, color: 'var(--text-light)' }}>
          {total} total entries
        </span>
      </div>

      {/* Action filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'suspend', 'ban', 'reactivate', 'report_review', 'report_dismiss'].map((a) => (
          <button
            key={a}
            onClick={() => { setActionFilter(a); setPage(0); }}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-en)',
              background: actionFilter === a ? (ACTION_COLORS[a] || 'var(--teal)') : 'white',
              color: actionFilter === a ? 'white' : 'var(--text-light)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            {a === 'all' ? 'All' : ACTION_LABELS[a] || a}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>Loading...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {logs.map((log, i) => {
            const adminName = log.admin?.name || 'Unknown';
            const actionColor = ACTION_COLORS[log.action] || '#6b7280';
            const actionLabel = ACTION_LABELS[log.action] || log.action;

            return (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < logs.length - 1 ? '1px solid var(--bg-main)' : 'none',
                fontFamily: 'var(--font-en)', fontSize: 13,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: actionColor, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600 }}>{adminName}</span>
                  <span style={{ color: 'var(--text-light)' }}> {actionLabel.toLowerCase()} </span>
                  {log.target_type && (
                    <span style={{ color: actionColor, fontWeight: 500 }}>{log.target_type}</span>
                  )}
                  {log.details?.userName && (
                    <span style={{ color: 'var(--text-light)' }}> — {log.details.userName}</span>
                  )}
                  {log.details?.reason && (
                    <span style={{ color: 'var(--text-xlight)', fontSize: 11 }}> ({log.details.reason})</span>
                  )}
                </div>
                <div style={{ color: 'var(--text-xlight)', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {timeAgo(log.created_at)}
                </div>
              </div>
            );
          })}

          {logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontFamily: 'var(--font-en)', fontSize: 13 }}>
              No audit logs yet.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontFamily: 'var(--font-en)', fontSize: 12, color: 'var(--text-light)' }}>
          <span>Page {page + 1} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.5 : 1, fontSize: 12 }}
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: page >= totalPages - 1 ? 'default' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1, fontSize: 12 }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
