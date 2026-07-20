import React, { useState, useEffect } from 'react';
import { getAvatarColor, getInitial, toBnNumber } from './friendsHelpers';
import { fetchFriendsPageSuggestions, searchUsers, sendFriendRequest } from '../../lib/friendsApi';

export default function SuggestionsView({ currentUserId, onAddFriend }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState({});
  const [added, setAdded] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [currentUserId]);

  async function loadSuggestions() {
    setLoading(true);
    try {
      const data = await fetchFriendsPageSuggestions(currentUserId);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsers(q, currentUserId);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleClearSearch() {
    setSearchQuery('');
    setSearchResults(null);
  }

  async function handleAdd(s) {
    console.log('SuggestionsView handleAdd:', { id: s.id, name: s.name, currentUserId, hasOnAddFriend: !!onAddFriend });
    setAdded(prev => ({ ...prev, [s.id]: true }));
    try {
      if (onAddFriend) {
        await onAddFriend(s.id);
      } else {
        await sendFriendRequest(currentUserId, s.id);
      }
    } catch {
      setAdded(prev => { const n = { ...prev }; delete n[s.id]; return n; });
    }
  }

  const displayList = searchResults !== null
    ? searchResults.filter(s => !dismissed[s.id])
    : users.filter(s => !dismissed[s.id]);

  const isSearchMode = searchResults !== null;

  if (loading && !isSearchMode) {
    return (
      <div className="fp-section">
        <div className="fp-section-head">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">পরিচিতি হতে পারেন</span>
            <span className="fp-st-en">People You May Know</span>
          </h3>
        </div>
        <div className="fp-loading">
          <div className="fp-spinner"></div>
          <span>লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <h3 className="fp-section-title">
          <span className="fp-st-bn">পরিচিতি হতে পারেন</span>
          <span className="fp-st-en">People You May Know</span>
        </h3>
      </div>

      <form className="fp-find-search" onSubmit={handleSearch}>
        <input
          className="fp-find-input"
          placeholder="নাম দিয়ে খুঁজুন... / Search by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {isSearchMode ? (
          <button type="button" className="fp-find-btn fp-find-btn-clear" onClick={handleClearSearch}>
            বাতিল / Clear
          </button>
        ) : (
          <button type="submit" className="fp-find-btn" disabled={searching}>
            {searching ? '...' : 'খুঁজুন / Search'}
          </button>
        )}
      </form>

      {searching ? (
        <div className="fp-loading">
          <div className="fp-spinner"></div>
          <span>খুঁজছে...</span>
        </div>
      ) : displayList.length === 0 ? (
        <div className="fp-empty">
          <div className="fp-empty-icon">{isSearchMode ? '🔍' : '👥'}</div>
          <p className="fp-empty-bn">
            {isSearchMode ? 'কেউ পাওয়া যায়নি' : 'কেউ নেই'}
          </p>
          <p className="fp-empty-en">
            {isSearchMode ? 'No users found' : 'No suggestions available'}
          </p>
        </div>
      ) : (
        <div className="fp-grid">
          {displayList.map(s => (
            <div key={s.id} className="fp-card fp-card-suggestion">
              <button
                className="fp-card-dismiss"
                aria-label="Dismiss"
                onClick={() => setDismissed(prev => ({ ...prev, [s.id]: true }))}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className="fp-card-top">
                <div
                  className="fp-card-avatar"
                  style={{ background: s.profile_photo_url ? 'none' : getAvatarColor(s.name) }}
                >
                  {s.profile_photo_url ? (
                    <img src={s.profile_photo_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span className="fp-avatar-char">{getInitial(s.name)}</span>
                  )}
                </div>
              </div>
              <div className="fp-card-info">
                <span className="fp-card-name">{s.name}</span>
              </div>
              {added[s.id] ? (
                <button className="fp-card-added-btn" disabled>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  অনুরোধ পাঠানো হয়েছে / Request Sent
                </button>
              ) : (
                <button
                  className="fp-card-add-btn"
                  onClick={() => handleAdd(s)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  বন্ধু যোগ করো / Add Friend
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
