import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { id: 'overview', icon: 'th-large', label: 'Overview', bn: 'সারসংক্ষেপ' },
      { id: 'users', icon: 'users', label: 'User Management', bn: 'ব্যবহারকারী ব্যবস্থাপনা', badge: 12, badgeClass: '' },
      { id: 'reports', icon: 'flag', label: 'Reports', bn: 'রিপোর্ট', badge: 7, badgeClass: 'amber' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'revenue', icon: 'rupee-sign', label: 'Revenue', bn: 'আয়' },
      { id: 'settlements', icon: 'calendar-check', label: 'Settlements', bn: 'সেটেলমেন্ট' },
      { id: 'payouts', icon: 'wallet', label: 'Payouts', bn: 'পেআউট' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'security', icon: 'shield-alt', label: 'Security', bn: 'নিরাপত্তা' },
      { id: 'logs', icon: 'clipboard-list', label: 'Audit Logs', bn: 'অডিট লগ' },
    ],
  },
];

const ICONS = {
  'th-large': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  'users': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  'flag': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  'rupee-sign': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="18" y2="3"/><line x1="6" y1="8" x2="16" y2="8"/><path d="M6 8c0 3.5 3 6 6 6s6-2.5 6-6"/><line x1="12" y1="14" x2="12" y2="21"/></svg>,
  'calendar-check': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 10.5 17.5 15 13"/></svg>,
  'wallet': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 10H2"/><circle cx="17" cy="14" r="1"/></svg>,
  'shield-alt': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  'clipboard-list': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>,
};

export default function AdminSidebar({ activeNav, setActiveNav }) {
  const { logoutUser } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logoutUser();
    showToast('Logged out successfully');
  };

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-brand-badge">J</div>
        <div>
          <div className="sb-brand-title">Jolshaa</div>
          <div className="sb-brand-sub">Admin Console</div>
        </div>
      </div>

      {NAV_SECTIONS.map((section) => (
        <React.Fragment key={section.label}>
          <div className="sb-section">{section.label}</div>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={`sb-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <div className="si-icon">{ICONS[item.icon]}</div>
              <div>
                <div className="si-label">{item.label}</div>
                <div className="si-bn">{item.bn}</div>
              </div>
              {item.badge != null && (
                <span className={`si-badge ${item.badgeClass}`}>{item.badge}</span>
              )}
            </button>
          ))}
          {section !== NAV_SECTIONS[NAV_SECTIONS.length - 1] && <div className="sb-divider" />}
        </React.Fragment>
      ))}

      <div className="sb-footer">
        <div className="sf-admin-row">
          <div className="sf-av">A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sf-name">Admin</div>
            <div className="sf-role">Super Admin</div>
          </div>
          <button
            className="action-btn"
            title="Logout"
            onClick={handleLogout}
            style={{ width: 26, height: 26 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
