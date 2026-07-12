import React, { useState, useMemo } from 'react';
import { useToast } from '../Toast';

const USERS = [
  { id: 1, name: 'Tanvir Hasan', handle: '@tanvir_h', initials: 'TH', color: '#1B6B5A', status: 'active', type: 'Creator', date: '2024-01-15' },
  { id: 2, name: 'Sabrina Rahman', handle: '@sabrina_r', initials: 'SR', color: '#7c3aed', status: 'active', type: 'User', date: '2024-02-03' },
  { id: 3, name: 'Arif Khan', handle: '@arif_k', initials: 'AK', color: '#D97706', status: 'suspended', type: 'User', date: '2024-02-10' },
  { id: 4, name: 'Nusrat Jahan', handle: '@nusrat_j', initials: 'NJ', color: '#16a34a', status: 'active', type: 'Creator', date: '2024-03-01' },
  { id: 5, name: 'Rafiq Uddin', handle: '@rafiq_u', initials: 'RU', color: '#DC2626', status: 'banned', type: 'User', date: '2024-03-05' },
  { id: 6, name: 'Sumaiya Khatun', handle: '@sumaiya_k', initials: 'SK', color: '#0ea5e9', status: 'active', type: 'User', date: '2024-03-12' },
  { id: 7, name: 'Zahid Hasan', handle: '@zahid_h', initials: 'ZH', color: '#7c3aed', status: 'active', type: 'Creator', date: '2024-03-20' },
  { id: 8, name: 'Farhana Begum', handle: '@farhana_b', initials: 'FB', color: '#D97706', status: 'active', type: 'User', date: '2024-04-01' },
];

export default function UserManagementTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return USERS.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.handle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || u.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType]);

  return (
    <div className="user-table-card">
      <div className="utc-top">
        <div>
          <div className="utc-title">User Management</div>
          <div className="utc-bn">ব্যবহারকারী ব্যবস্থাপনা</div>
        </div>
        <span className="utc-count">{USERS.length} users</span>
        <div className="utc-spacer" />
        <div className="table-search">
          <svg className="ts-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option>All</option>
          <option>Creator</option>
          <option>User</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Status</th>
            <th>Type</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  <div className="uc-av" style={{ background: user.color }}>{user.initials}</div>
                  <div>
                    <div className="uc-name">{user.name}</div>
                    <div className="uc-handle">{user.handle}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-badge sb-${user.status}`}>
                  <span className="sb-dot" />
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </td>
              <td>{user.type}</td>
              <td className="date-cell">{user.date}</td>
              <td>
                <div className="action-btns">
                  <button className="action-btn" title="View" onClick={() => showToast(`TODO: View user ${user.name}`)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button className="action-btn warn" title="Suspend" onClick={() => showToast(`TODO: Suspend user ${user.name}`)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  </button>
                  <button className="action-btn danger" title="Delete" onClick={() => showToast(`TODO: Delete user ${user.name}`)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="table-pagination">
        <span className="tp-info">Showing {filtered.length} of {USERS.length}</span>
        <div className="tp-pages">
          {[1, 2, 3].map((p) => (
            <button key={p} className={`tp-page${currentPage === p ? ' active' : ''}`} onClick={() => setCurrentPage(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
