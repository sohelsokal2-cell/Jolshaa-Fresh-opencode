import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function SidebarLeft({ userName = 'আমিনুল হক' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="sidebar-left" aria-label="Left navigation sidebar">
      {/* Profile Card */}
      <Link to="/profile" className="sb-profile-card" aria-label="View my profile">
        <div className="sb-profile-avatar">{userName.charAt(0)}</div>
        <div>
          <div className="sb-profile-name">{userName}</div>
          <div className="sb-profile-sub">View Profile / প্রোফাইল দেখুন</div>
        </div>
      </Link>

      {/* Core Navigation */}
      <div className="sb-section-label">মূল মেনু · Menu</div>
      <div className="sb-nav-group">
        <Link to="/feed" className={`sb-nav-item ${currentPath === '/feed' ? 'active' : ''}`}>
          <div className="sb-nav-icon teal-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">নিউজ ফিড</div>
            <div className="sb-nav-text-en">News Feed</div>
          </div>
        </Link>
        
        <Link to="/friends" className={`sb-nav-item ${currentPath === '/friends' ? 'active' : ''}`}>
          <div className="sb-nav-icon blue-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="9" cy="7" r="3.5" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M1 21c0-4 3.6-7 8-7s8 3 8 7" />
              <path d="M19 21c0-2.5-1.5-4.5-4-5.5" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">বন্ধুরা</div>
            <div className="sb-nav-text-en">Friends</div>
          </div>
        </Link>

        <Link to="/groups" className={`sb-nav-item ${currentPath === '/groups' ? 'active' : ''}`}>
          <div className="sb-nav-icon teal-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">গ্রুপসমূহ</div>
            <div className="sb-nav-text-en">Groups</div>
          </div>
        </Link>

        <Link to="/pages" className={`sb-nav-item ${currentPath === '/pages' ? 'active' : ''}`}>
          <div className="sb-nav-icon blue-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4h10l4 4v14H4z" />
              <path d="M14 4v4h4" />
              <path d="M8 11h6M8 15h4" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">পেইজ</div>
            <div className="sb-nav-text-en">Pages</div>
          </div>
        </Link>

        <Link to="/reels" className={`sb-nav-item ${currentPath === '/reels' ? 'active' : ''}`}>
          <div className="sb-nav-icon purple-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">রিলস ও শর্টস</div>
            <div className="sb-nav-text-en">Reels &amp; Shorts</div>
          </div>
        </Link>
      </div>

      {/* Sahajjo Chai — HIGHLIGHTED */}
      <div
        className="sb-sahajjo-card"
        role="button"
        tabIndex="0"
        aria-label="সাহায্য চাই — Help requests near you"
        onClick={() => navigate('/sahajjo')}
      >
        <div className="sb-sahajjo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <div className="sb-sahajjo-title">সাহায্য চাই</div>
          <div className="sb-sahajjo-sub">Help requests near you</div>
        </div>
      </div>

      {/* Secondary items */}
      <div className="sb-section-label">আরও · More</div>
      <div className="sb-secondary-group">
        <Link to="/saved" className={`sb-nav-item ${currentPath === '/saved' ? 'active' : ''}`}>
          <div className="sb-nav-icon gold-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">সেভ করা পোস্ট</div>
            <div className="sb-nav-text-en">Saved Posts</div>
          </div>
        </Link>
        <Link to="/memories" className={`sb-nav-item ${currentPath === '/memories' ? 'active' : ''}`}>
          <div className="sb-nav-icon teal-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M2 20c0-4 4.5-7 10-7s10 3 10 7" />
              <path d="M8 8 Q12 5 16 8" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">স্মৃতি / এই দিনে</div>
            <div className="sb-nav-text-en">Memories / On this day</div>
          </div>
        </Link>
        <Link to="/creator-hub" className={`sb-nav-item ${currentPath === '/creator-hub' ? 'active' : ''}`}>
          <div className="sb-nav-icon gold-bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <div className="sb-nav-text-bn">ক্রিয়েটর হাব</div>
            <div className="sb-nav-text-en">Creator Hub</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
