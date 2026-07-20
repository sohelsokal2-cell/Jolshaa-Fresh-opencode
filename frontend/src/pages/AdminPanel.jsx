import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import AdminStatCard from '../components/admin/AdminStatCard';
import DailyActiveUsersChart from '../components/admin/DailyActiveUsersChart';
import UserManagementTable from '../components/admin/UserManagementTable';
import ReportsQueuePanel from '../components/admin/ReportsQueuePanel';
import AdminSecurityPanel from '../components/admin/AdminSecurityPanel';
import AdminAuditLogsPanel from '../components/admin/AdminAuditLogsPanel';
import AdminFactCheckQueue from '../components/factcheck/AdminFactCheckQueue';
import AdminAdReviewPanel from '../components/admin/AdminAdReviewPanel';
import AdminPayoutPanel from '../components/admin/AdminPayoutPanel';
import './AdminPanel.css';

const STAT_VARIANTS = ['users', 'active', 'reports', 'rev'];

export default function AdminPanel() {
  const [activeNav, setActiveNav] = useState('overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <AdminTopbar />

      <div className="admin-main-area">
        <div className="main-inner">
          {activeNav === 'factcheck' ? (
            <div className="center-col" style={{ width: '100%' }}>
              <AdminFactCheckQueue />
            </div>
          ) : activeNav === 'security' ? (
            <div className="center-col" style={{ width: '100%' }}>
              <AdminSecurityPanel />
            </div>
          ) : activeNav === 'logs' ? (
            <div className="center-col" style={{ width: '100%' }}>
              <AdminAuditLogsPanel />
            </div>
          ) : activeNav === 'adreview' ? (
            <div className="center-col" style={{ width: '100%' }}>
              <AdminAdReviewPanel />
            </div>
          ) : activeNav === 'payouts' ? (
            <div className="center-col" style={{ width: '100%' }}>
              <AdminPayoutPanel />
            </div>
          ) : activeNav === 'revenue' ? (
            <div className="center-col" style={{ width: '100%' }}>
              <div className="admin-panel-section">
                <div className="aps-header">
                  <div>
                    <div className="aps-title">আয়</div>
                    <div className="aps-sub">Revenue</div>
                  </div>
                </div>
                <div className="aps-empty">
                  <div className="aps-empty-icon">📊</div>
                  <div className="aps-empty-bn">শীঘ্রই আসছে</div>
                  <div className="aps-empty-en">Coming soon — revenue analytics will be available here</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="center-col">
                <div className="overview-hdr">
                  <div>
                    <div className="oh-title">Dashboard Overview</div>
                    <div className="oh-sub"><span>সকল মেট্রিক্স এক নজরে</span> — Last updated: just now</div>
                  </div>
                </div>

                <div className="stats-grid">
                  {STAT_VARIANTS.map((variant) => (
                    <AdminStatCard key={variant} variant={variant} />
                  ))}
                </div>

                <DailyActiveUsersChart />
                <UserManagementTable />
              </div>

              <div className="right-col">
                <ReportsQueuePanel />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
