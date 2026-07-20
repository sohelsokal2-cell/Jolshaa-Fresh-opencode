import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SearchFilters from '../components/SearchFilters';
import PeopleResultsCard from '../components/PeopleResultsCard';
import PagesResultsCard from '../components/PagesResultsCard';
import SearchResultPostCard from '../components/SearchResultPostCard';
import GroupsResultsCard from '../components/GroupsResultsCard';
import EventsResultsCard from '../components/EventsResultsCard';
import RelatedSearchChips from '../components/RelatedSearchChips';
import { searchAll, searchCounts, fetchSearchResultDetails } from '../lib/searchApi';
import './SearchResults.css';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({
    recentOnly: true,
    seenOnly: false,
    date: 'any',
    from: 'all',
    location: 'any'
  });

  const [searchResults, setSearchResults] = useState([]);
  const [detailedResults, setDetailedResults] = useState({
    users: [], posts: [], groups: [], events: [], pages: []
  });
  const [counts, setCounts] = useState({ all: 0, people: 0, posts: 0, groups: 0, events: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < MIN_QUERY_LENGTH) {
      setSearchResults([]);
      setDetailedResults({ users: [], posts: [], groups: [], events: [], pages: [] });
      setCounts({ all: 0, people: 0, posts: 0, groups: 0, events: 0, pages: 0 });
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const [results, countData] = await Promise.all([
        searchAll(searchQuery, 10),
        searchCounts(searchQuery)
      ]);

      setSearchResults(results);
      setCounts(countData);

      const details = await fetchSearchResultDetails(results);
      setDetailedResults(details);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
      setDetailedResults({ users: [], posts: [], groups: [], events: [], pages: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const handleChipClick = (newQuery) => {
    setSearchParams({ q: newQuery });
  };

  const handleClearSearch = () => {
    setSearchParams({});
    setSearchResults([]);
    setDetailedResults({ users: [], posts: [], groups: [], events: [], pages: [] });
    setCounts({ all: 0, people: 0, posts: 0, groups: 0, events: 0, pages: 0 });
    setSearched(false);
  };

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <Navbar
        messageCount={5}
        notificationCount={7}
        initialSearchQuery={query}
        onSearchClear={handleClearSearch}
      />

      <div className="search-results-page-body">
        <SearchFilters
          query={query || '...'}
          queryEn={query?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''}
          counts={counts}
          onFilterChange={setFilters}
          onCategoryChange={setActiveCategory}
        />

        <main className="main-content">
          {/* Result meta bar */}
          <div className="result-meta">
            <div>
              <div className="result-count-bn">
                {loading ? (
                  'খুঁজছি...'
                ) : searched ? (
                  `"${query}" — ${counts.all}টি ফলাফল পাওয়া গেছে`
                ) : (
                  'অনুসন্ধান করতে উপরে লিখুন'
                )}
              </div>
              <div className="result-count-en">
                {loading ? (
                  'Searching...'
                ) : searched ? (
                  `${counts.all} results found for "${query}"`
                ) : (
                  'Type above to search'
                )}
              </div>
            </div>
            {counts.all > 0 && (
              <div className="result-sort">
                <span className="result-sort-lbl">Sort:</span>
                <select className="sort-select" aria-label="Sort results">
                  <option>প্রাসঙ্গিক · Relevant</option>
                  <option>সাম্প্রতিক · Recent</option>
                  <option>জনপ্রিয় · Popular</option>
                </select>
              </div>
            )}
          </div>

          {/* Related chips */}
          {searched && <RelatedSearchChips onChipClick={handleChipClick} />}

          {/* Loading skeleton */}
          {loading && (
            <div className="results-stack">
              {[1, 2, 3].map(i => (
                <div key={i} className="result-card skeleton-card">
                  <div className="skeleton-header">
                    <div className="skeleton-circle"></div>
                    <div className="skeleton-lines">
                      <div className="skeleton-line w60"></div>
                      <div className="skeleton-line w40"></div>
                    </div>
                  </div>
                  <div className="skeleton-rows">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="skeleton-row">
                        <div className="skeleton-circle sm"></div>
                        <div className="skeleton-lines sm">
                          <div className="skeleton-line w70"></div>
                          <div className="skeleton-line w50"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && searched && counts.all === 0 && (
            <div className="results-stack">
              <div className="empty-search-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title-bn">কোনো ফলাফল পাওয়া যায়নি</div>
                <div className="empty-title-en">No results found</div>
                <div className="empty-desc-bn">"{query}" এর জন্য কোনো মিল পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।</div>
                <div className="empty-desc-en">No matches found for "{query}". Try a different keyword.</div>
              </div>
            </div>
          )}

          {/* Results stack */}
          {!loading && counts.all > 0 && (
            <div className="results-stack">
              {(activeCategory === 'all' || activeCategory === 'people') && detailedResults.users.length > 0 && (
                <PeopleResultsCard
                  people={detailedResults.users.map(u => ({
                    id: u.id,
                    name: u.name,
                    avatarChar: u.name?.charAt(0) || '?',
                    avatarGrad: 'linear-gradient(135deg,#1B6B5A,#4ECDC4)',
                    location: u.bio || '',
                    mutualCount: 0,
                    mutuals: []
                  }))}
                  searchQuery={query}
                  totalCountText={`${counts.people} জন`}
                  onSeeAllClick={() => setActiveCategory('people')}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'groups') && detailedResults.groups.length > 0 && (
                <GroupsResultsCard
                  groups={detailedResults.groups.map(g => ({
                    id: g.id,
                    name: g.name,
                    description: g.description || '',
                    memberCountText: '',
                    privacy: g.privacy,
                    coverUrl: g.cover_image_url
                  }))}
                  searchQuery={query}
                  totalCountText={`${counts.groups}টি`}
                  onSeeAllClick={() => setActiveCategory('groups')}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'pages') && detailedResults.pages.length > 0 && (
                <PagesResultsCard
                  pages={detailedResults.pages.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category || '',
                    followerCountText: '',
                    emoji: '📄',
                    gradient: 'linear-gradient(135deg,#bae6fd,#7dd3fc)',
                    description: p.description || ''
                  }))}
                  searchQuery={query}
                  totalCountText={`${counts.pages}টি পেজ`}
                  onSeeAllPagesClick={() => setActiveCategory('pages')}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'events') && detailedResults.events.length > 0 && (
                <EventsResultsCard
                  events={detailedResults.events.map(e => ({
                    id: e.id,
                    title: e.title,
                    description: e.description || '',
                    dateText: e.event_date ? new Date(e.event_date).toLocaleDateString('bn-BD') : '',
                    locationText: e.location_text || '',
                    category: e.category || '',
                    coverUrl: e.cover_image_url,
                    hostName: e.hostName || ''
                  }))}
                  searchQuery={query}
                  totalCountText={`${counts.events}টি`}
                  onSeeAllClick={() => setActiveCategory('events')}
                />
              )}

              {(activeCategory === 'all' || activeCategory === 'posts') && detailedResults.posts.length > 0 && (
                <>
                  {detailedResults.posts.slice(0, 3).map(post => (
                    <SearchResultPostCard
                      key={post.id}
                      searchQuery={query}
                      authorName={post.authorName || 'Unknown'}
                      authorChar={post.authorName?.charAt(0) || '?'}
                      authorAvatarGrad="linear-gradient(135deg,#1B6B5A,#4ECDC4)"
                      timeString={post.created_at ? new Date(post.created_at).toLocaleDateString('bn-BD') : ''}
                      postText={post.content || ''}
                      imageEmoji="📝"
                      imageCaption=""
                      initialReactCount={0}
                      commentCountText="০টি মন্তব্য"
                      initiallyReacted={false}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
