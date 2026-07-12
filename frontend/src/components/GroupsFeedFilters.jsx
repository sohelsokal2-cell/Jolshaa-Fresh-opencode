import React, { useState } from 'react';

const FILTER_ITEMS = [
  { id: 'all', bn: 'সব পোস্ট', en: 'All Posts' },
  { id: 'mygroups', bn: 'তোমার গ্রুপ', en: 'Your Groups' },
  { id: 'popular', bn: 'জনপ্রিয়', en: 'Popular' },
  { id: 'new', bn: 'নতুন পোস্ট', en: 'New Posts' }
];

export default function GroupsFeedFilters({ onChangeFilter, initialFilter = 'all' }) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    onChangeFilter?.(filterId);
  };

  return (
    <div className="feed-filters" role="tablist" aria-label="Feed filter tabs">
      {FILTER_ITEMS.map(item => (
        <button
          key={item.id}
          className={`filter-pill ${activeFilter === item.id ? 'active' : ''}`}
          role="tab"
          aria-selected={activeFilter === item.id}
          onClick={() => handleFilterClick(item.id)}
        >
          <span className="filter-pill-bn">{item.bn}</span>
          <span className="filter-pill-en">{item.en}</span>
        </button>
      ))}
    </div>
  );
}
