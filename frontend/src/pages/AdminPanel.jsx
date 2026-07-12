import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import AdminStatCard from '../components/admin/AdminStatCard';
import DailyActiveUsersChart from '../components/admin/DailyActiveUsersChart';
import UserManagementTable from '../components/admin/UserManagementTable';
import ReportsQueuePanel from '../components/admin/ReportsQueuePanel';
import './AdminPanel.css';

const STAT_CARDS = [
  { variant: 'users', label: 'Total Users', bn: 'মোট ব্যবহারকারী', value: '1,24,863', trend: 'up', trendLabel: '+12.5%', sparklineData: [20, 35, 28, 45, 38, 55, 48, 62] },
  { variant: 'active', label: 'Daily Active', bn: 'দৈনিক সক্রিয়', value: '34,521', trend: 'up', trendLabel: '+8.2%', sparklineData: [15, 22, 18, 30, 25, 38, 32, 42] },
  { variant: 'reports', label: 'Open Reports', bn: 'খোলা রিপোর্ট', value: '23', trend: 'down', trendLabel: '-15.3%', sparklineData: [40, 35, 42, 28, 32, 25, 20, 23] },
  { variant: 'rev', label: 'Monthly Revenue', bn: 'মাসিক আয়', value: '৳8.4L', trend: 'up', trendLabel: '+22.1%', sparklineData: [10, 18, 15, 25, 22, 35, 30, 42] },
];

export default function AdminPanel() {
  const [activeNav, setActiveNav] = useState('overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <AdminTopbar />

      <div className="admin-main-area">
        <div className="main-inner">
          <div className="center-col">
            <div className="overview-hdr">
              <div>
                <div className="oh-title">Dashboard Overview</div>
                <div className="oh-sub"><span>সকল মেট্রিক্স এক নজরে</span> — Last updated: just now</div>
              </div>
              <div className="oh-right">
                <button className="btn-export">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
                <button className="btn-primary-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Refresh
                </button>
              </div>
            </div>

            <div className="stats-grid">
              {STAT_CARDS.map((card) => (
                <AdminStatCard key={card.variant} {...card} />
              ))}
            </div>

            <DailyActiveUsersChart />
            <UserManagementTable />
          </div>

          <div className="right-col">
            <ReportsQueuePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
