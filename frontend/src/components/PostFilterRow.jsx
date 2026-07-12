import React, { useState } from 'react';

export default function PostFilterRow({ onViewChange, onFiltersClick, onManagePostsClick }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const handleToggle = (mode) => {
    setViewMode(mode);
    onViewChange?.(mode);
  };

  return (
    <div className="filter-row" role="toolbar" aria-label="Post filter controls">
      <div className="filter-left">
        <button className="filter-btn" aria-label="ফিল্টার / Filters" onClick={onFiltersClick}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="3"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-bn)' }}>ফিল্টার</span>
          <span style={{ fontFamily: 'var(--font-en)', fontSize: '9px', color: 'var(--text-xlight)', marginLeft: '4px' }}>Filters</span>
        </button>

        <div className="view-toggle" aria-label="View toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            id="gridViewBtn"
            aria-label="গ্রিড ভিউ / Grid view"
            aria-pressed={viewMode === 'grid'}
            onClick={() => handleToggle('grid')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            id="listViewBtn"
            aria-label="লিস্ট ভিউ / List view"
            aria-pressed={viewMode === 'list'}
            onClick={() => handleToggle('list')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <button className="manage-posts-btn" aria-label="পোস্ট পরিচালনা / Manage posts" onClick={onManagePostsClick}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <rect x="3" y="5" width="6" height="6" rx="1"/>
          <rect x="3" y="13" width="6" height="6" rx="1"/>
          <line x1="13" y1="8" x2="21" y2="8"/>
          <line x1="13" y1="16" x2="21" y2="16"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-bn)' }}>পোস্ট পরিচালনা</span>
        <span style={{ fontFamily: 'var(--font-en)', fontSize: '9px', opacity: 0.7, marginLeft: '4px' }}>Manage Posts</span>
      </button>
    </div>
  );
}
