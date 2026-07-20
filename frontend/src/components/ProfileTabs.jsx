import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MenuItem({ icon, tone, bn, en, onClick }) {
  return (
    <button className="dropdown-item" onClick={onClick}>
      <span className={`dropdown-icon ${tone}`}>{icon}</span>
      <span className="dropdown-text">
        <span className="dropdown-text-bn">{bn}</span>
        <span className="dropdown-text-en">{en}</span>
      </span>
    </button>
  );
}

export default function ProfileTabs({ activeTab, onChangeTab, visibleSections = {}, onManageSections }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const tabs = [
    { id: 'all', bn: 'সব', en: 'All' },
    ...(visibleSections.about !== false ? [{ id: 'about', bn: 'সম্পর্কে', en: 'About' }] : []),
    ...(visibleSections.reels !== false ? [{ id: 'reels', bn: 'রিলস', en: 'Reels' }] : []),
    ...(visibleSections.photos !== false ? [{ id: 'photos', bn: 'ছবি', en: 'Photos' }] : []),
    ...(visibleSections.friends !== false ? [{ id: 'friends', bn: 'বন্ধু', en: 'Friends' }] : [])
  ];

  return (
    <div className="tab-row-wrap" role="navigation">
      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => onChangeTab(tab.id)}>
            <span className="tab-bn">{tab.bn}</span>
            <span className="tab-en">{tab.en}</span>
          </button>
        ))}
        <div className="tab-more" ref={ref}>
          <button className="tab-more-btn" onClick={() => setOpen(!open)}>
            <span className="tab-bn">আরও</span>
            <span className="tab-en">More</span>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10 14a1 1 0 01-.7-.3l-5-5a1 1 0 011.4-1.4L10 11.6l4.3-4.3a1 1 0 111.4 1.4l-5 5a1 1 0 01-.7.3z"/></svg>
          </button>
          {open && (
            <div className="tab-dropdown">
              <MenuItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} tone="di-teal" bn="গ্রুপ" en="Groups" onClick={() => { setOpen(false); navigate('/groups'); }} />
              <MenuItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} tone="di-gold" bn="ইভেন্ট" en="Events" onClick={() => { setOpen(false); navigate('/events'); }} />
              <MenuItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} tone="di-grey" bn="চেক-ইন" en="Check-ins" onClick={() => { setOpen(false); onChangeTab('checkins'); }} />
              <MenuItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} tone="di-gold" bn="দেওয়া রিভিউ" en="Reviews Given" onClick={() => { setOpen(false); window.alert('শীঘ্রই আসছে / Coming soon'); }} />
              <MenuItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>} tone="di-grey" bn="সেকশন পরিচালনা" en="Manage Sections" onClick={() => { setOpen(false); onManageSections?.(); }} />
              <MenuItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} tone="di-red" bn="প্রোফাইল লক করো" en="Lock Profile" onClick={() => { setOpen(false); navigate('/settings'); }} />
            </div>
          )}
        </div>
      </div>
      <button className="tab-row-more" aria-label="পেজের অপশন / Page options">•••</button>
    </div>
  );
}
