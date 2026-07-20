import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PagesSidebar from '../components/PagesSidebar';
import PageCard from '../components/PageCard';
import { fetchPages, createPage } from '../lib/pagesApi';
import './PagesManagement.css';

const PAGE_CATEGORIES = [
  'সংবাদ ও মিডিয়া · News & Media',
  'খাবার ও রেসিপি · Food & Recipe',
  'ক্রীড়া · Sports',
  'প্রযুক্তি · Technology',
  'শিক্ষা · Education',
  'বিনোদন · Entertainment',
  'ব্যবসা · Business',
  'অন্যান্য · Other',
];

export default function PagesManagement() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [managedPages, setManagedPages] = useState([]);
  const [followedPages, setFollowedPages] = useState([]);
  const [discoverPages, setDiscoverPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageCategory, setNewPageCategory] = useState(PAGE_CATEGORIES[0]);
  const [newPageDesc, setNewPageDesc] = useState('');
  const [creatingPage, setCreatingPage] = useState(false);

  const loadPages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [managed, followed, discover] = await Promise.all([
        fetchPages('managed', user.id),
        fetchPages('followed', user.id),
        fetchPages('discover', user.id),
      ]);
      setManagedPages(managed);
      setFollowedPages(followed);
      setDiscoverPages(discover);
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.pc-more-wrap')) {
        setOpenDropdownId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleDropdownToggle = (id) => {
    setOpenDropdownId(prev => (prev === id ? null : id));
  };

  const handleCreatePage = async () => {
    if (!newPageName.trim() || !user) return;
    setCreatingPage(true);
    try {
      const newPage = await createPage(
        newPageName.trim(),
        newPageCategory,
        newPageDesc.trim() || null,
        null,
        user.id
      );
      setManagedPages(prev => [{ ...newPage, followersCount: 1 }, ...prev]);
      setNewPageName('');
      setNewPageDesc('');
      setNewPageCategory(PAGE_CATEGORIES[0]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create page:', err);
      alert('পেজ তৈরি হয়নি। আবার চেষ্টা করো।');
    } finally {
      setCreatingPage(false);
    }
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <Navbar />

      <button
        className="mobile-menu-btn"
        style={{
          position: 'fixed',
          top: '11px',
          left: '110px',
          zIndex: 400
        }}
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label="Toggle pages sidebar"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="pages-page-body">
        <PagesSidebar
          isOpen={sidebarOpen}
          invitesCount={0}
          onCreatePageClick={() => setShowCreateModal(true)}
        />

        <main className="main-content">
          <div className="section-header">
            <div className="section-title-bn">তুমি যেসব পেজ পরিচালনা করো</div>
            <div className="section-title-en">Pages You Manage</div>
          </div>

          <div className="pages-layout">
            <div className="pages-list">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                  লোড হচ্ছে...
                </div>
              ) : managedPages.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                  এখনো কোনো পেজ তৈরি করোনি। প্রথম পেজ তৈরি করো!
                </div>
              ) : (
                managedPages.map(page => (
                  <PageCard
                    key={page.id}
                    id={page.id}
                    name={page.name}
                    type={page.category}
                    followersCountBn={`${page.followerCount || 1} অনুসারী`}
                    followersCountEn={`${page.followerCount || 1} Followers`}
                    emoji={page.name?.charAt(0) || '📄'}
                    thumbGradient={`linear-gradient(140deg,#1B6B5A,#4ECDC4)`}
                    accentColor="teal"
                    notificationCount={0}
                    messageCount={0}
                    reachCount="০"
                    isDropdownOpen={openDropdownId === page.id}
                    onDropdownToggle={() => handleDropdownToggle(page.id)}
                    onCreatePostClick={(id) => alert(`Creating post for Page ID: ${id}`)}
                    onPromoteClick={(id) => alert(`Promoting Page ID: ${id}`)}
                  />
                ))
              )}
            </div>

            <div className="pages-right">
              {followedPages.length > 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>
                    ফলো করা পেজ · Followed Pages
                  </div>
                  {followedPages.map(page => (
                    <div key={page.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-light)'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'var(--teal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '14px'
                      }}>
                        {page.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-dark)' }}>{page.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{page.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-dark)' }}>
                  আবিষ্কার করো · Discover Pages
                </div>
                {discoverPages.length === 0 ? (
                  <div style={{ color: 'var(--text-light)', fontSize: '13px' }}>কোনো পেজ পাওয়া যায়নি</div>
                ) : (
                  discoverPages.slice(0, 5).map(page => (
                    <div key={page.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-light)'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'var(--teal)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '14px'
                      }}>
                        {page.name?.charAt(0) || 'P'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-dark)' }}>{page.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{page.category}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>নতুন পেজ তৈরি করো</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <label className="modal-label">পেজের নাম *</label>
              <input
                className="modal-input"
                type="text"
                placeholder="পেজের নাম লিখো..."
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                maxLength={80}
              />
              <label className="modal-label">ক্যাটাগরি</label>
              <select
                className="modal-input"
                value={newPageCategory}
                onChange={(e) => setNewPageCategory(e.target.value)}
              >
                {PAGE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <label className="modal-label">বিবরণ</label>
              <textarea
                className="modal-input"
                placeholder="পেজ সম্পর্কে লিখো..."
                value={newPageDesc}
                onChange={(e) => setNewPageDesc(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowCreateModal(false)}>বাতিল</button>
              <button
                className="modal-btn-primary"
                onClick={handleCreatePage}
                disabled={!newPageName.trim() || creatingPage}
              >
                {creatingPage ? 'তৈরি হচ্ছে...' : 'তৈরি করো'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
