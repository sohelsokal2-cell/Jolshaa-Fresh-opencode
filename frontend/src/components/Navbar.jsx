import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUnreadCount, subscribeToNotifications } from '../lib/notificationsApi';
import NotificationPanel from './NotificationPanel';

export default function Navbar({
  messageCount = 5,
  showReels = false,
  showProfile = false,
  initialSearchQuery = '',
  onSearchClear
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logoutUser, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState(initialSearchQuery);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const profileRef = useRef(null);

  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen((prev) => !prev);
  }, []);

  const closeNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSearchVal(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount(user.id).then(count => setNotificationCount(count)).catch(() => {});
    const unsubscribe = subscribeToNotifications(user.id, () => {
      setNotificationCount(prev => prev + 1);
    }, 'notifications-navbar');
    return unsubscribe;
  }, [user]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <nav
      className="navbar"
      style={{
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.1)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Logo */}
      <Link to="/feed" className="nav-logo" aria-label="জলশা হোম — Jolshaa Home">
        <div className="nav-logo-badge"><span>জ</span></div>
        <span className="nav-wordmark">Jolshaa</span>
      </Link>

      {/* Search */}
      <div className="nav-search">
        <span className="nav-search-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          id="navSearch"
          placeholder="খুঁজুন... / Search..."
          aria-label="Search"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {searchVal && (
          <button
            className="nav-search-clear"
            onClick={() => {
              setSearchVal('');
              onSearchClear?.();
            }}
            aria-label="Clear search"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Center nav icons */}
      <div className="nav-center">
        {/* Home */}
        <button
          className={`nav-icon-btn ${currentPath === '/feed' || currentPath === '/' ? 'active' : ''}`}
          title="হোম / Home"
          aria-label="Home"
          onClick={() => navigate('/feed')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
            <path d="M9 22V12h6v10" />
          </svg>
        </button>

        {/* Groups */}
        <button
          className={`nav-icon-btn ${currentPath === '/groups' ? 'active' : ''}`}
          title="গ্রুপ / Groups"
          aria-label="Groups"
          onClick={() => navigate('/groups')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="7" r="3.5" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M1 21c0-4 3.6-7 8-7s8 3 8 7" />
            <path d="M19 21c0-2.5-1.5-4.5-4-5.5" />
          </svg>
        </button>

        {/* Watch */}
        <button
          className={`nav-icon-btn ${currentPath === '/watch' ? 'active' : ''}`}
          title="ভিডিও / Watch"
          aria-label="Watch"
          onClick={() => navigate('/watch')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="5" width="20" height="15" rx="3" />
            <polygon points="10 9 16 12 10 15" fill="currentColor" opacity="0.7" stroke="none" />
          </svg>
        </button>

        {/* Events */}
        <button
          className={`nav-icon-btn ${currentPath === '/events' ? 'active' : ''}`}
          title="ইভেন্ট / Events"
          aria-label="Events"
          onClick={() => navigate('/events')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="8" cy="15" r="1.5" fill="currentColor" />
            <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            <circle cx="16" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </button>

        {/* Reels */}
        {showReels && (
          <button
            className={`nav-icon-btn ${currentPath === '/reels' ? 'active' : ''}`}
            title="রিলস / Reels"
            aria-label="Reels"
            onClick={() => navigate('/reels')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
              <rect x="19" y="3" width="2" height="18" rx="1" />
            </svg>
          </button>
        )}

        {/* Messages */}
        <button
          className={`nav-icon-btn ${currentPath === '/messenger' ? 'active' : ''}`}
          title="বার্তা / Messages"
          aria-label="Messages"
          onClick={() => navigate('/messenger')}
        >
          {messageCount > 0 && <div className="nav-badge">{messageCount}</div>}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <circle cx="9" cy="11" r="1" fill="currentColor" />
            <circle cx="12" cy="11" r="1" fill="currentColor" />
            <circle cx="15" cy="11" r="1" fill="currentColor" />
          </svg>
        </button>

        {/* Profile */}
        {showProfile && (
          <button
            className={`nav-icon-btn ${currentPath === '/profile' ? 'active' : ''}`}
            title="প্রোফাইল / Profile"
            aria-label="Profile"
            onClick={() => navigate('/profile')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}

        {/* Notifications */}
        <button
          className={`nav-icon-btn ${isNotificationPanelOpen ? 'active ring-active' : ''}`}
          title="বিজ্ঞপ্তি / Notifications"
          aria-label="Notifications"
          onClick={toggleNotificationPanel}
        >
          {notificationCount > 0 && <div className="nav-badge">{notificationCount}</div>}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
      </div>

      {/* Sahajjo Chai — DISTINCT urgent button */}
      <button
        className={`nav-sahajjo ${currentPath === '/sahajjo' ? 'active-page' : ''}`}
        id="navSahajjoBtn"
        aria-label="সাহায্য চাই — Emergency Help Request"
        onClick={() => navigate('/sahajjo')}
      >
        <span className="nav-sahajjo-dot"></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>সাহায্য চাই</span>
      </button>

      {/* Right: profile */}
      <div className="nav-right" ref={profileRef} style={{ position: 'relative' }}>
        <div
          className="nav-avatar"
          title="আমার প্রোফাইল / My Profile"
          tabIndex="0"
          role="button"
          aria-label="Profile menu"
          onClick={() => setIsProfileOpen((p) => !p)}
          style={{ cursor: 'pointer' }}
        >
          আ
        </div>

        {isProfileOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 200,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: '1px solid #e5e7eb',
            zIndex: 999,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-en)',
                color: '#1a1a1a', textAlign: 'left',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              প্রোফাইল / Profile
            </button>
            <button
              onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-en)',
                color: '#1a1a1a', textAlign: 'left', borderTop: '1px solid #f3f4f6',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              সেটিংস / Settings
            </button>
            <button
              onClick={() => { setIsProfileOpen(false); logoutUser(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-en)',
                color: '#DC2626', textAlign: 'left', borderTop: '1px solid #f3f4f6',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              লগআউট / Logout
            </button>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={closeNotificationPanel}
        onUnreadCountChange={setNotificationCount}
      />
    </nav>
  );
}
