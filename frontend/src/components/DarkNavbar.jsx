import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';

export default function DarkNavbar({
  messageCount = 5,
  notificationCount = 7,
  initialSearchQuery = '',
  onSearchClear
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchVal, setSearchVal] = useState(initialSearchQuery);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen((prev) => !prev);
  }, []);

  const closeNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen(false);
  }, []);

  useEffect(() => {
    setSearchVal(initialSearchQuery);
  }, [initialSearchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <nav className="dark-navbar">
      {/* Logo */}
      <Link to="/feed" className="nav-logo" aria-label="Jolshaa Home">
        <div className="nav-logo-badge"><span>জ</span></div>
        <span className="nav-wordmark">Jolshaa</span>
      </Link>

      {/* Search */}
      <div className="nav-search">
        <span className="nav-search-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="রিলস খুঁজুন... / Search Reels..."
          aria-label="Search reels"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="8" cy="15" r="1.5" fill="currentColor" />
            <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            <circle cx="16" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </button>

        {/* Reels — active on this page */}
        <button
          className={`nav-icon-btn ${currentPath === '/reels' ? 'active' : ''}`}
          title="রিলস / Reels"
          aria-label="Reels"
          onClick={() => navigate('/reels')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
            <rect x="19" y="3" width="2" height="18" rx="1" />
          </svg>
        </button>

        {/* Messages */}
        <button
          className={`nav-icon-btn ${currentPath === '/messenger' ? 'active' : ''}`}
          title="বার্তা / Messages"
          aria-label="Messages"
          onClick={() => navigate('/messenger')}
        >
          {messageCount > 0 && <div className="nav-badge">{messageCount}</div>}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <circle cx="9" cy="11" r="1" fill="currentColor" />
            <circle cx="12" cy="11" r="1" fill="currentColor" />
            <circle cx="15" cy="11" r="1" fill="currentColor" />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className={`nav-icon-btn ${isNotificationPanelOpen ? 'active ring-active' : ''}`}
          title="বিজ্ঞপ্তি / Notifications"
          aria-label="Notifications"
          onClick={toggleNotificationPanel}
        >
          {notificationCount > 0 && <div className="nav-badge">{notificationCount}</div>}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
      </div>

      {/* Sahajjo Chai */}
      <button
        className="nav-sahajjo"
        aria-label="সাহায্য চাই"
        onClick={() => navigate('/sahajjo')}
      >
        <span className="nav-sahajjo-dot"></span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>সাহায্য চাই</span>
      </button>

      {/* Profile avatar */}
      <div style={{ flexShrink: 0 }}>
        <div
          className="nav-avatar"
          title="প্রোফাইল / Profile"
          tabIndex="0"
          role="button"
          aria-label="Profile"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          আ
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={closeNotificationPanel}
      />
    </nav>
  );
}
