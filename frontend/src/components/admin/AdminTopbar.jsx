import React from 'react';

const NAV_LABELS = {
  overview: 'Overview',
  users: 'User Management',
  reports: 'Reports',
  revenue: 'Revenue',
  settlements: 'Settlements',
  payouts: 'Payouts',
  security: 'Security',
  logs: 'Audit Logs',
};

export default function AdminTopbar() {
  return (
    <header className="topbar">
      <div className="tb-breadcrumb">
        <span className="tbc-root">Admin</span>
        <span className="tbc-sep">/</span>
        <span className="tbc-page">Dashboard</span>
      </div>

      <div className="tb-spacer" />

      <div className="tb-search">
        <svg className="tb-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search users, reports..." />
      </div>

      <button className="tb-icon-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <div className="tb-notif-dot" />
      </button>

      <button className="tb-icon-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </button>

      <div className="tb-admin-chip">
        <div className="tac-dot" />
        <span className="tac-text">Admin Active</span>
      </div>
    </header>
  );
}
