import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PagesSidebar from '../components/PagesSidebar';
import PageCard from '../components/PageCard';
import DeactivatedPagesPanel from '../components/DeactivatedPagesPanel';
import PagesAnalyticsWidget from '../components/PagesAnalyticsWidget';
import './PagesManagement.css';

const DEFAULT_PAGES = [
  {
    id: 1,
    name: 'দৈনিক বাংলাদেশ টাইমস',
    type: 'সংবাদ ও মিডিয়া · News & Media Page',
    followersCountBn: '৪৫,৮৩২ অনুসারী',
    followersCountEn: '45.8K Followers',
    emoji: '📰',
    thumbGradient: 'linear-gradient(140deg,#1B6B5A,#4ECDC4)',
    accentColor: 'teal',
    notificationCount: 3,
    messageCount: 12,
    reachCount: '৮.৩K'
  },
  {
    id: 2,
    name: 'রান্নাঘর বাংলা',
    type: 'খাবার ও রেসিপি · Food & Recipe Page',
    followersCountBn: '১২,৪৯০ অনুসারী',
    followersCountEn: '12.5K Followers',
    emoji: '🍛',
    thumbGradient: 'linear-gradient(140deg,#f97316,#dc2626)',
    accentColor: 'coral',
    notificationCount: 7,
    messageCount: 4,
    reachCount: '৩.১K'
  },
  {
    id: 3,
    name: 'জলশা স্পোর্টস',
    type: 'ক্রীড়া · Sports & Athletics Page',
    followersCountBn: '৮,২৫৬ অনুসারী',
    followersCountEn: '8.3K Followers',
    emoji: '⚽',
    thumbGradient: 'linear-gradient(140deg,#7c3aed,#a78bfa)',
    accentColor: 'purple',
    notificationCount: 1,
    messageCount: 0,
    reachCount: '১.৮K'
  }
];

export default function PagesManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Manage outside click and Escape key globally for dropdowns
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

  const handleActivatePage = (pageId) => {
    alert(`Activating deactivated page with ID: ${pageId}`);
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Shared Navbar */}
      <Navbar messageCount={5} notificationCount={7} />

      {/* Mobile Menu Toggle Button (Floating overlay next to logo on mobile screens) */}
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

      {/* Page wrapper */}
      <div className="pages-page-body">
        {/* Sidebar */}
        <PagesSidebar
          isOpen={sidebarOpen}
          invitesCount={2}
          onCreatePageClick={() => alert('Create page clicked!')}
        />

        {/* Main Content */}
        <main className="main-content">
          <div className="section-header">
            <div className="section-title-bn">তুমি যেসব পেজ পরিচালনা করো</div>
            <div className="section-title-en">Pages You Manage</div>
          </div>

          <div className="pages-layout">
            {/* Pages Card list */}
            <div className="pages-list">
              {DEFAULT_PAGES.map(page => (
                <PageCard
                  key={page.id}
                  {...page}
                  isDropdownOpen={openDropdownId === page.id}
                  onDropdownToggle={() => handleDropdownToggle(page.id)}
                  onCreatePostClick={(id) => alert(`Creating post for Page ID: ${id}`)}
                  onPromoteClick={(id) => alert(`Promoting Page ID: ${id}`)}
                />
              ))}
            </div>

            {/* Right side panel */}
            <div className="pages-right">
              <DeactivatedPagesPanel
                onActivatePage={handleActivatePage}
                onSeeAllClick={() => alert('See all deactivated pages!')}
              />
              
              <PagesAnalyticsWidget
                onSeeAllClick={() => alert('See all analytics statistics!')}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
