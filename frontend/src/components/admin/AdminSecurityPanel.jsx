import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { fetchSecuritySummary } from '../../lib/adminApi';

export default function AdminSecurityPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const summary = await fetchSecuritySummary();
        setData(summary);
      } catch (err) {
        console.error('Security summary error:', err);
        showToast('সিকিউরিটি ডাটা লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="overview-hdr">
        <div>
          <div className="oh-title">Security Overview</div>
          <div className="oh-sub">নিরাপত্তা সারসংক্ষেপ — Last 30 days</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card sc-users">
          <div className="sc-label">Suspended Users</div>
          <div className="sc-bn">বন্ধ ব্যবহারকারী</div>
          <div className="sc-value">{data?.suspendedCount || 0}</div>
        </div>
        <div className="stat-card sc-reports">
          <div className="sc-label">Banned Users</div>
          <div className="sc-bn">নিষিদ্ধ ব্যবহারকারী</div>
          <div className="sc-value">{data?.bannedCount || 0}</div>
        </div>
        <div className="stat-card sc-active">
          <div className="sc-label">Admin Actions (30d)</div>
          <div className="sc-bn">অ্যাডমিন কার্যক্রম</div>
          <div className="sc-value">{data?.totalActions30d || 0}</div>
        </div>
      </div>

      {/* Action breakdown */}
      {data?.actionCounts && Object.keys(data.actionCounts).length > 0 && (
        <div style={{
          background: 'white', borderRadius: 12, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-en)' }}>
            Actions Breakdown (30 days)
          </div>
          {Object.entries(data.actionCounts).map(([action, count]) => (
            <div key={action} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--bg-main)', fontFamily: 'var(--font-en)', fontSize: 13,
            }}>
              <span style={{ color: 'var(--text-dark)' }}>{action.replace(/_/g, ' ')}</span>
              <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: 24, padding: 16, background: 'var(--bg-main)', borderRadius: 12,
        fontSize: 12, color: 'var(--text-light)', lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Security Notes</div>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>Admin actions (suspend, ban, report review) are logged in Audit Logs</li>
          <li>User account status changes are enforced at the database level via RLS</li>
          <li>Non-admin users cannot modify account_status even with direct API calls</li>
        </ul>
      </div>
    </div>
  );
}
