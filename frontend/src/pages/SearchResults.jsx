import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchFilters from '../components/SearchFilters';
import PeopleResultsCard from '../components/PeopleResultsCard';
import PagesResultsCard from '../components/PagesResultsCard';
import SearchResultPostCard from '../components/SearchResultPostCard';
import RelatedSearchChips from '../components/RelatedSearchChips';
import './SearchResults.css';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || 'মন্টু';
  const queryEn = query === 'মন্টু' ? 'montoo' : query.toLowerCase().replace(/[^a-z0-9]/g, '');

  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({
    recentOnly: true,
    seenOnly: false,
    date: 'any',
    from: 'all',
    location: 'any'
  });

  const handleChipClick = (newQuery) => {
    setSearchParams({ q: newQuery });
  };

  const handleClearSearch = () => {
    setSearchParams({});
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Shared Navbar with Search Overrides */}
      <Navbar
        messageCount={5}
        notificationCount={7}
        initialSearchQuery={query}
        onSearchClear={handleClearSearch}
      />

      <div className="search-results-page-body">
        {/* Left Sidebar filters */}
        <SearchFilters
          query={query}
          queryEn={queryEn}
          counts={{ all: 48, people: 12, reels: 9, groups: 7, pages: 6, events: 5 }}
          onFilterChange={setFilters}
          onCategoryChange={setActiveCategory}
        />

        {/* Center Main Panel */}
        <main className="main-content">
          {/* Result meta bar */}
          <div className="result-meta">
            <div>
              <div className="result-count-bn">"{query}" — ৪৮টি ফলাফল পাওয়া গেছে</div>
              <div className="result-count-en">48 results found for "{queryEn}"</div>
            </div>
            <div className="result-sort">
              <span className="result-sort-lbl">Sort:</span>
              <select className="sort-select" aria-label="Sort results">
                <option>প্রাসঙ্গিক · Relevant</option>
                <option>সাম্প্রতিক · Recent</option>
                <option>জনপ্রিয় · Popular</option>
              </select>
            </div>
          </div>

          {/* Related chips */}
          <RelatedSearchChips onChipClick={handleChipClick} />

          {/* Results stack depending on active category */}
          <div className="results-stack">
            {(activeCategory === 'all' || activeCategory === 'people') && (
              <PeopleResultsCard searchQuery={query} onSeeAllClick={() => setActiveCategory('people')} />
            )}

            {(activeCategory === 'all' || activeCategory === 'pages') && (
              <PagesResultsCard searchQuery={query} onSeeAllPagesClick={() => setActiveCategory('pages')} />
            )}

            {activeCategory === 'all' && (
              <SearchResultPostCard searchQuery={query} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
