import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileTabs({ activeTab, onChangeTab }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownItemClick = (route) => {
    setDropdownOpen(false);
    navigate(route);
  };

  const tabsList = [
    { id: 'all', bn: 'সব', en: 'All' },
    { id: 'about', bn: 'সম্পর্কে', en: 'About' },
    { id: 'reels', bn: 'রিলস', en: 'Reels' },
    { id: 'photos', bn: 'ছবি', en: 'Photos' },
    { id: 'friends', bn: 'বন্ধু', en: 'Friends' },
  ];

  return (
    <div className="tab-row-wrap" role="navigation" aria-label="Profile section tabs">
      <div className="tabs" role="tablist">
        {tabsList.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChangeTab(tab.id)}
          >
            <span className="tab-bn">{tab.bn}</span>
            <span className="tab-en">{tab.en}</span>
          </button>
        ))}

        {/* More dropdown */}
        <div className="tab-more" id="tabMoreWrap" ref={dropdownRef}>
          <button
            className={`tab-more-btn ${dropdownOpen ? 'open' : ''}`}
            id="tabMoreBtn"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            onClick={() => setDropdownOpen(prev => !prev)}
          >
            <div className="tab-more-chevron">
              <span className="tab-bn">আরও</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <span className="tab-en">More</span>
          </button>

          {/* DROPDOWN */}
          {dropdownOpen && (
            <div className="tab-dropdown" id="tabDropdown" role="menu" style={{ display: 'block' }}>
              <button
                className="dropdown-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                role="menuitem"
                onClick={() => handleDropdownItemClick('/groups')}
              >
                <div className="dropdown-icon di-teal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="9" cy="7" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M1 21c0-4 3.6-7 8-7s8 3 8 7"/><path d="M19 21c0-2.5-1.5-4.5-4-5.5"/>
                  </svg>
                </div>
                <div>
                  <div className="dropdown-text-bn">গ্রুপ</div>
                  <div className="dropdown-text-en">Groups</div>
                </div>
              </button>

              <button
                className="dropdown-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                role="menuitem"
                onClick={() => handleDropdownItemClick('/events')}
              >
                <div className="dropdown-icon di-gold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="dropdown-text-bn">ইভেন্ট</div>
                  <div className="dropdown-text-en">Events</div>
                </div>
              </button>

              <button
                className="dropdown-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                role="menuitem"
                onClick={() => handleDropdownItemClick('/checkins')}
              >
                <div className="dropdown-icon di-grey">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <div className="dropdown-text-bn">চেক-ইন</div>
                  <div className="dropdown-text-en">Check-ins</div>
                </div>
              </button>

              <button
                className="dropdown-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                role="menuitem"
                onClick={() => handleDropdownItemClick('/reviews')}
              >
                <div className="dropdown-icon di-gold">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </div>
                <div>
                  <div className="dropdown-text-bn">প্রদত্ত রিভিউ</div>
                  <div className="dropdown-text-en">Reviews Given</div>
                </div>
              </button>

              <button
                className="dropdown-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                role="menuitem"
                onClick={() => handleDropdownItemClick('/sections')}
              >
                <div className="dropdown-icon di-grey">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <div>
                  <div className="dropdown-text-bn">সেকশন পরিচালনা</div>
                  <div className="dropdown-text-en">Manage Sections</div>
                </div>
              </button>

              <button
                className="dropdown-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                role="menuitem"
                onClick={() => handleDropdownItemClick('/lock')}
              >
                <div className="dropdown-icon di-red">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <div>
                  <div className="dropdown-text-bn">প্রোফাইল লক করুন</div>
                  <div className="dropdown-text-en">Lock Profile</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Far right page options button */}
      <button className="tab-row-more" aria-label="পেইজ বিকল্প / Page options">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
        </svg>
      </button>
    </div>
  );
}
