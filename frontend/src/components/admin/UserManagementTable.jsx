import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../Toast';
import { useAuth } from '../../context/AuthContext';
import { fetchAllUsers, suspendUser, banUser, reactivateUser, deleteUser, logAdminAction } from '../../lib/adminApi';

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  active: '#16a34a',
  suspended: '#D97706',
  banned: '#DC2626',
};

export default function UserManagementTable() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reasonInput, setReasonInput] = useState('');
  const { showToast } = useToast();
  const { user } = useAuth();
  const debounceRef = useRef(null);

  const loadUsers = useCallback(async (search = '', status = 'all', p = 0) => {
    try {
      setLoading(true);
      const result = await fetchAllUsers({ search, statusFilter: status, page: p, pageSize: PAGE_SIZE });
      setUsers(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('ব্যবহারকারী লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      loadUsers(value, filterStatus, 0);
    }, 400);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPage(0);
    loadUsers(searchQuery, status, 0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadUsers(searchQuery, filterStatus, newPage);
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    const { type, userId, userName } = confirmAction;

    try {
      if (type === 'suspend') await suspendUser(userId, reasonInput);
      else if (type === 'ban') await banUser(userId, reasonInput);
      else if (type === 'reactivate') await reactivateUser(userId);
      else if (type === 'delete') await deleteUser(userId);

      // Log the action
      await logAdminAction({
        adminId: user.id,
        action: type,
        targetType: 'user',
        targetId: userId,
        details: { userName, reason: reasonInput || undefined },
      });

      showToast(`${userName} ${type === 'reactivate' ? 'reactivated' : type === 'delete' ? 'deleted' : type + 'd'} successfully`);
      setConfirmAction(null);
      setReasonInput('');
      loadUsers(searchQuery, filterStatus, page);
    } catch (err) {
      console.error(`Action ${type} failed:`, err);
      showToast(`Action failed: ${err.message}`);
    }
  };

  const openConfirm = (type, userId, userName) => {
    setConfirmAction({ type, userId, userName });
    setReasonInput('');
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="user-table-card">
      <div className="utc-top">
        <div>
          <div className="utc-title">User Management</div>
          <div className="utc-bn">ব্যবহারকারী ব্যবস্থাপনা</div>
        </div>
        <span className="utc-count">{total} users</span>
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
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-light)' }}>Loading...</div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const initial = (user.name || '?').charAt(0).toUpperCase();
                const initialsColor = user.profile_photo_url ? 'transparent' : STATUS_COLORS[user.account_status] || '#1B6B5A';
                const status = user.account_status || 'active';

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="uc-av" style={{ background: initialsColor }}>
                          {user.profile_photo_url ? (
                            <img src={user.profile_photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : initial}
                        </div>
                        <div>
                          <div className="uc-name">{user.name || 'Unknown'}</div>
                          <div className="uc-handle">{user.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge sb-${status}`}>
                        <span className="sb-dot" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="date-cell" style={{ fontFamily: 'var(--font-en)', fontSize: 11 }}>{user.email || '-'}</td>
                    <td className="date-cell">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <div className="action-btns">
                        {status === 'active' ? (
                          <>
                            <button className="action-btn warn" title="Suspend" onClick={() => openConfirm('suspend', user.id, user.name)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            </button>
                            <button className="action-btn danger" title="Ban" onClick={() => openConfirm('ban', user.id, user.name)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            </button>
                          </>
                        ) : (
                          <button className="action-btn" title="Reactivate" onClick={() => openConfirm('reactivate', user.id, user.name)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="table-pagination">
              <span className="tp-info">Page {page + 1} of {totalPages} ({total} total)</span>
              <div className="tp-pages">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = startPage + i;
                  if (p >= totalPages) return null;
                  return (
                    <button key={p} className={`tp-page${page === p ? ' active' : ''}`} onClick={() => handlePageChange(p)}>
                      {p + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-en)' }}>
              {confirmAction.type === 'suspend' && 'Suspend User'}
              {confirmAction.type === 'ban' && 'Ban User'}
              {confirmAction.type === 'reactivate' && 'Reactivate User'}
              {confirmAction.type === 'delete' && 'Delete User'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16, fontFamily: 'var(--font-en)' }}>
              {confirmAction.type === 'reactivate'
                ? `Reactivate ${confirmAction.userName}?`
                : `${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)} ${confirmAction.userName}? This action can be reversed by reactivating.`}
            </div>
            {(confirmAction.type === 'suspend' || confirmAction.type === 'ban') && (
              <input
                type="text"
                placeholder="Reason (optional)"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  fontSize: 13, marginBottom: 16, boxSizing: 'border-box',
                }}
              />
            )}
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
                  background: confirmAction.type === 'reactivate' ? 'var(--teal)' : confirmAction.type === 'ban' ? '#DC2626' : '#D97706',
                  color: 'white', cursor: 'pointer',
                }}
              >
                {confirmAction.type === 'reactivate' ? 'Reactivate' : confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
