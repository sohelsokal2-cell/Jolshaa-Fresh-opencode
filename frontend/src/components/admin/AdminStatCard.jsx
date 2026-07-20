import React, { useState, useEffect } from 'react';
import { fetchAdminStats } from '../../lib/adminApi';

export default function AdminStatCard({ variant }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stats = await fetchAdminStats();
        setData(stats);
      } catch (err) {
        console.error('Stats load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getConfig = () => {
    if (!data) return { label: '', bn: '', value: '0', trend: null, trendLabel: '' };

    switch (variant) {
      case 'users':
        return {
          label: 'Total Users',
          bn: 'মোট ব্যবহারকারী',
          value: data.totalUsers.toLocaleString(),
          trend: 'up',
          trendLabel: 'all registered',
        };
      case 'active':
        return {
          label: 'Active Today',
          bn: 'আজ সক্রিয়',
          value: data.activeToday.toLocaleString(),
          trend: 'up',
          trendLabel: 'new today',
        };
      case 'reports':
        return {
          label: 'Open Reports',
          bn: 'খোলা রিপোর্ট',
          value: data.pendingReports.toLocaleString(),
          trend: data.pendingReports > 0 ? 'down' : null,
          trendLabel: 'pending',
        };
      case 'rev':
        return {
          label: 'Monthly Revenue',
          bn: 'মাসিক আয়',
          value: '৳0',
          trend: null,
          trendLabel: 'payment system pending',
        };
      default:
        return { label: '', bn: '', value: '0', trend: null, trendLabel: '' };
    }
  };

  const config = getConfig();

  const iconColor = {
    users: '#1B6B5A',
    active: '#16a34a',
    reports: '#D97706',
    rev: '#7c3aed',
  }[variant];

  return (
    <div className={`stat-card sc-${variant}`}>
      <div className="sc-top">
        <div className={`sc-icon sci-${variant}`}>
          {variant === 'users' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          )}
          {variant === 'active' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          )}
          {variant === 'reports' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          )}
          {variant === 'rev' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          )}
        </div>
        {config.trend && (
          <span className={`sc-trend ${config.trend}`}>
            {config.trend === 'up' ? '↑' : config.trend === 'down' ? '↓' : '⚠'} {config.trendLabel}
          </span>
        )}
      </div>
      <div className="sc-label">{config.label}</div>
      <div className="sc-bn">{config.bn}</div>
      <div className="sc-value">
        {loading ? '...' : config.value}
      </div>
    </div>
  );
}
