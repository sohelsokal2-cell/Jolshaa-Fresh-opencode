import React, { useState } from 'react';

export default function SearchFilters({
  query = 'মন্টু',
  queryEn = 'montoo',
  counts = { all: 48, people: 12, reels: 9, groups: 7, pages: 6, events: 5 },
  onFilterChange,
  onCategoryChange
}) {
  // Category nav
  const [activeCat, setActiveCat] = useState('all');

  // Toggle states
  const [recentOnly, setRecentOnly] = useState(true);
  const [seenOnly, setSeenOnly] = useState(false);

  // Accordion open/close states (Date Posted starts open as per demo visual state)
  const [dateOpen, setDateOpen] = useState(true);
  const [fromOpen, setFromOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);

  // Radio selection states
  const [dateSelect, setDateSelect] = useState('any');
  const [fromSelect, setFromSelect] = useState('all');
  const [locSelect, setLocSelect] = useState('any');

  const handleReset = () => {
    setRecentOnly(true);
    setSeenOnly(false);
    setDateSelect('any');
    setFromSelect('all');
    setLocSelect('any');
    onFilterChange?.({
      recentOnly: true,
      seenOnly: false,
      date: 'any',
      from: 'all',
      location: 'any'
    });
  };

  const notifyChange = (updates) => {
    onFilterChange?.({
      recentOnly,
      seenOnly,
      date: dateSelect,
      from: fromSelect,
      location: locSelect,
      ...updates
    });
  };

  const handleCategoryClick = (catId) => {
    setActiveCat(catId);
    onCategoryChange?.(catId);
  };

  return (
    <aside className="sidebar-left" aria-label="Search filters">
      <div className="sb-brand-header">
        <div className="sb-title-bn">সার্চ ফলাফল</div>
        <div className="sb-title-en">Search Results</div>
      </div>

      {/* Query pill */}
      <div className="sb-query-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <span className="sb-query-text">"{query}"</span>
        <span className="sb-query-en">{queryEn}</span>
      </div>

      {/* Filter Card */}
      <div className="filter-card">
        <div className="filter-card-hdr">
          <div>
            <div className="filter-card-title-bn">ফিল্টার</div>
            <div className="filter-card-title-en">Filters</div>
          </div>
          <button className="filter-reset" onClick={handleReset}>রিসেট · Reset</button>
        </div>

        {/* Toggle: Recent Posts */}
        <div className="filter-toggle-row">
          <div className="ftgl-text">
            <div className="ftgl-bn">সাম্প্রতিক পোস্ট</div>
            <div className="ftgl-en">Recent Posts Only</div>
          </div>
          <label className="toggle-switch" aria-label="Toggle recent posts">
            <input
              type="checkbox"
              checked={recentOnly}
              onChange={(e) => {
                setRecentOnly(e.target.checked);
                notifyChange({ recentOnly: e.target.checked });
              }}
            />
            <div className="toggle-track"></div>
          </label>
        </div>

        {/* Toggle: Posts You've Seen */}
        <div className="filter-toggle-row">
          <div className="ftgl-text">
            <div className="ftgl-bn">তুমি দেখেছো এমন</div>
            <div className="ftgl-en">Posts You've Seen</div>
          </div>
          <label className="toggle-switch" aria-label="Toggle posts you've seen">
            <input
              type="checkbox"
              checked={seenOnly}
              onChange={(e) => {
                setSeenOnly(e.target.checked);
                notifyChange({ seenOnly: e.target.checked });
              }}
            />
            <div className="toggle-track"></div>
          </label>
        </div>

        {/* Dropdown: Date Posted */}
        <div className="filter-dropdown">
          <button
            className={`fdd-btn ${dateOpen ? 'open' : ''}`}
            onClick={() => setDateOpen(!dateOpen)}
            aria-expanded={dateOpen}
          >
            <div className="fdd-btn-left">
              <div className="fdd-dot"></div>
              <div>
                <div className="fdd-bn">পোস্টের তারিখ</div>
                <div className="fdd-en">Date Posted</div>
              </div>
            </div>
            <svg className="fdd-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div className={`fdd-body ${dateOpen ? 'open' : ''}`}>
            <div className="fdd-inner">
              {[
                { val: 'any', bn: 'যেকোনো সময়' },
                { val: 'today', bn: 'আজকের' },
                { val: 'week', bn: 'এই সপ্তাহের' },
                { val: 'month', bn: 'এই মাসের' }
              ].map(opt => (
                <label className="fdd-option" key={opt.val}>
                  <input
                    type="radio"
                    name="date"
                    value={opt.val}
                    checked={dateSelect === opt.val}
                    onChange={() => {
                      setDateSelect(opt.val);
                      notifyChange({ date: opt.val });
                    }}
                  />
                  <div
                    className="fdd-check"
                    style={
                      dateSelect === opt.val
                        ? { background: 'var(--teal)', borderColor: 'var(--teal)', color: 'white', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                        : {}
                    }
                  >
                    {dateSelect === opt.val && '✓'}
                  </div>
                  <span className="fdd-option-bn">{opt.bn}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Dropdown: Posts From */}
        <div className="filter-dropdown">
          <button
            className={`fdd-btn ${fromOpen ? 'open' : ''}`}
            onClick={() => setFromOpen(!fromOpen)}
            aria-expanded={fromOpen}
          >
            <div className="fdd-btn-left">
              <div className="fdd-dot"></div>
              <div>
                <div className="fdd-bn">যেখান থেকে পোস্ট</div>
                <div className="fdd-en">Posts From</div>
              </div>
            </div>
            <svg className="fdd-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div className={`fdd-body ${fromOpen ? 'open' : ''}`}>
            <div className="fdd-inner">
              {[
                { val: 'all', bn: 'সবাই' },
                { val: 'friends', bn: 'শুধু বন্ধু' },
                { val: 'groups', bn: 'গ্রুপ' },
                { val: 'pages', bn: 'পেজ' }
              ].map(opt => (
                <label className="fdd-option" key={opt.val}>
                  <input
                    type="radio"
                    name="from"
                    value={opt.val}
                    checked={fromSelect === opt.val}
                    onChange={() => {
                      setFromSelect(opt.val);
                      notifyChange({ from: opt.val });
                    }}
                  />
                  <div
                    className="fdd-check"
                    style={
                      fromSelect === opt.val
                        ? { background: 'var(--teal)', borderColor: 'var(--teal)', color: 'white', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                        : {}
                    }
                  >
                    {fromSelect === opt.val && '✓'}
                  </div>
                  <span className="fdd-option-bn">{opt.bn}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Dropdown: Tagged Location */}
        <div className="filter-dropdown">
          <button
            className={`fdd-btn ${locOpen ? 'open' : ''}`}
            onClick={() => setLocOpen(!locOpen)}
            aria-expanded={locOpen}
          >
            <div className="fdd-btn-left">
              <div className="fdd-dot"></div>
              <div>
                <div className="fdd-bn">ট্যাগ করা অবস্থান</div>
                <div className="fdd-en">Tagged Location</div>
              </div>
            </div>
            <svg className="fdd-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div className={`fdd-body ${locOpen ? 'open' : ''}`}>
            <div className="fdd-inner">
              {[
                { val: 'any', bn: 'যেকোনো স্থান' },
                { val: 'dhaka', bn: 'ঢাকা' },
                { val: 'ctg', bn: 'চট্টগ্রাম' },
                { val: 'sylhet', bn: 'সিলেট' }
              ].map(opt => (
                <label className="fdd-option" key={opt.val}>
                  <input
                    type="radio"
                    name="loc"
                    value={opt.val}
                    checked={locSelect === opt.val}
                    onChange={() => {
                      setLocSelect(opt.val);
                      notifyChange({ location: opt.val });
                    }}
                  />
                  <div
                    className="fdd-check"
                    style={
                      locSelect === opt.val
                        ? { background: 'var(--teal)', borderColor: 'var(--teal)', color: 'white', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                        : {}
                    }
                  >
                    {locSelect === opt.val && '✓'}
                  </div>
                  <span className="fdd-option-bn">{opt.bn}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Nav */}
      <div className="cat-nav">
        <div className="cat-nav-hdr">
          <div className="cat-nav-lbn">ক্যাটাগরি</div>
          <div className="cat-nav-len">Category</div>
        </div>
        <div className="cat-nav-list">
          <a
            href="#"
            className={`cat-item ${activeCat === 'all' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleCategoryClick('all'); }}
          >
            <div className="cat-icon ci-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round">
                <rect x="2" y="2" width="9" height="9" rx="2.5"/><rect x="13" y="2" width="9" height="9" rx="2.5"/>
                <rect x="2" y="13" width="9" height="9" rx="2.5"/><rect x="13" y="13" width="9" height="9" rx="2.5"/>
              </svg>
            </div>
            <div>
              <div className="cat-text-bn">সব</div>
              <div className="cat-text-en">All Results</div>
            </div>
            <div className="cat-count">{counts.all}</div>
          </a>

          <a
            href="#"
            className={`cat-item ${activeCat === 'people' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleCategoryClick('people'); }}
          >
            <div className="cat-icon ci-people">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="9" cy="7" r="4"/><path d="M1 21c0-4 3.6-7 8-7s8 3 8 7"/>
                <path d="M20 7.5a3 3 0 010 5M23 21c0-2.5-2-4.5-4-5.5"/>
              </svg>
            </div>
            <div>
              <div className="cat-text-bn">মানুষ</div>
              <div className="cat-text-en">People</div>
            </div>
            <div className="cat-count">{counts.people}</div>
          </a>

          <a
            href="#"
            className={`cat-item ${activeCat === 'reels' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleCategoryClick('reels'); }}
          >
            <div className="cat-icon ci-reels">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.2" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="3"/>
                <circle cx="12" cy="12" r="7" strokeDasharray="3 3"/>
              </svg>
            </div>
            <div>
              <div className="cat-text-bn">রিলস</div>
              <div className="cat-text-en">Reels</div>
            </div>
            <div className="cat-count">{counts.reels}</div>
          </a>

          <a
            href="#"
            className={`cat-item ${activeCat === 'groups' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleCategoryClick('groups'); }}
          >
            <div className="cat-icon ci-groups">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div>
              <div className="cat-text-bn">গ্রুপ</div>
              <div className="cat-text-en">Groups</div>
            </div>
            <div className="cat-count">{counts.groups}</div>
          </a>

          <a
            href="#"
            className={`cat-item ${activeCat === 'pages' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleCategoryClick('pages'); }}
          >
            <div className="cat-icon ci-pages">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 4h10l4 4v14H4z"/><path d="M14 4v4h4"/>
                <line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
              </svg>
            </div>
            <div>
              <div className="cat-text-bn">পেজ</div>
              <div className="cat-text-en">Pages</div>
            </div>
            <div className="cat-count">{counts.pages}</div>
          </a>

          <a
            href="#"
            className={`cat-item ${activeCat === 'events' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleCategoryClick('events'); }}
          >
            <div className="cat-icon ci-events">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <circle cx="12" cy="16" r="2" fill="#ec4899" opacity="0.3"/>
              </svg>
            </div>
            <div>
              <div className="cat-text-bn">ইভেন্ট</div>
              <div className="cat-text-en">Events</div>
            </div>
            <div className="cat-count">{counts.events}</div>
          </a>
        </div>
      </div>
    </aside>
  );
}
