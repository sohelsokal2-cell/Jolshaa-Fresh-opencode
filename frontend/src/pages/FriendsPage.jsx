import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  fetchFriends,
  fetchFriendRequests,
  fetchSentRequests,
  respondToFriendRequest,
  deleteFriendRequest,
  sendFriendRequest,
  searchUsers,
  fetchFriendsPageSuggestions,
  fetchUpcomingBirthdays,
} from '../lib/friendsApi';
import { findOrCreateDirectConversation } from '../lib/messagingApi';
import './FriendsPage.css';

const AVATAR_COLORS = [
  'linear-gradient(135deg,#1B6B5A,#2a9678)',
  'linear-gradient(135deg,#E85C4A,#f0816e)',
  'linear-gradient(135deg,#D4A04A,#e8c06a)',
  'linear-gradient(135deg,#4A7AE8,#6e9af0)',
  'linear-gradient(135deg,#8B5CF8,#a78bfa)',
  'linear-gradient(135deg,#EC4899,#f472b6)',
  'linear-gradient(135deg,#14B8A6,#5eead4)',
  'linear-gradient(135deg,#F97316,#fb923c)',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0);
}

function toBnNumber(n) {
  const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(n).replace(/\d/g, d => bnDigits[parseInt(d)]);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র · Just now';
  if (mins < 60) return `${toBnNumber(mins)} মিনিট আগে · ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${toBnNumber(hrs)} ঘণ্টা আগে · ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${toBnNumber(days)} দিন আগে · ${days}d ago`;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentReqs, setSentReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [f, r, s] = await Promise.all([
        fetchFriends(user.id),
        fetchFriendRequests(user.id),
        fetchSentRequests(user.id),
      ]);
      setFriends(f);
      setRequests(r);
      setSentReqs(s);
    } catch (err) {
      console.error('Friends load error:', err);
      showToast('বন্ধু তথ্য লোড হয়নি।');
    } finally {
      setLoading(false);
    }
  }

  const filteredFriends = useMemo(() => {
    let list = [...friends];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [friends, searchQuery, sortBy]);

  async function handleAccept(req) {
    setActionLoading(prev => ({ ...prev, [req.id]: 'accepting' }));
    try {
      await respondToFriendRequest(req.id, 'accepted', user.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setFriends(prev => [{ id: req.requester_id, name: req.requesterName, avatarUrl: req.requesterAvatar, since: req.created_at, friendshipId: req.id }, ...prev]);
      showToast('বন্ধুত্ব গ্রহণ করা হয়েছে!');
    } catch (err) {
      console.error(err);
      showToast('গ্রহণ করা যায়নি।');
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[req.id]; return n; });
    }
  }

  async function handleDelete(req) {
    setActionLoading(prev => ({ ...prev, [req.id]: 'deleting' }));
    try {
      await deleteFriendRequest(req.id, user.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      showToast('অনুরোধ মুছে ফেলা হয়েছে।');
    } catch (err) {
      console.error(err);
      showToast('মুছে ফেলা যায়নি।');
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[req.id]; return n; });
    }
  }

  async function handleUnfriend(friend) {
    if (!window.confirm(`${friend.name} কে আনফ্রেন্ড করতে চাও?`)) return;
    try {
      await deleteFriendRequest(friend.friendshipId, user.id);
      setFriends(prev => prev.filter(f => f.friendshipId !== friend.friendshipId));
      showToast('আনফ্রেন্ড করা হয়েছে।');
    } catch (err) {
      console.error(err);
      showToast('আনফ্রেন্ড করা যায়নি।');
    }
  }

  async function handleCancelSent(req) {
    try {
      await deleteFriendRequest(req.id, user.id);
      setSentReqs(prev => prev.filter(r => r.id !== req.id));
      showToast('অনুরোধ বাতিল করা হয়েছে।');
    } catch (err) {
      console.error(err);
      showToast('বাতিল করা যায়নি।');
    }
  }

  const tabs = [
    { id: 'all', bn: 'সব বন্ধু', en: 'All Friends', count: friends.length },
    { id: 'requests', bn: 'বন্ধুর অনুরোধ', en: 'Friend Requests', count: requests.length },
    { id: 'sent', bn: 'পাঠানো অনুরোধ', en: 'Sent Requests', count: sentReqs.length },
    { id: 'find', bn: 'বন্ধু খুঁজুন', en: 'Find Friends', count: null },
    { id: 'birthdays', bn: 'জন্মদিন', en: 'Birthdays', count: null },
  ];

  return (
    <div className="fp-root">
      <Navbar />
      <div className="fp-body">
        <aside className="fp-sidebar">
          <div className="fp-sidebar-head">
            <h2 className="fp-sidebar-title">
              <span className="fp-title-bn">বন্ধুরা</span>
              <span className="fp-title-en">Friends</span>
            </h2>
          </div>

          <div className="fp-search-wrap">
            <svg className="fp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="fp-search-input"
              placeholder="বন্ধু খুঁজুন... / Search friends..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="fp-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`fp-tab ${activeTab === tab.id ? 'fp-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="fp-tab-text">
                  <span className="fp-tab-bn">{tab.bn}</span>
                  <span className="fp-tab-en">{tab.en}</span>
                </div>
                {tab.count != null && tab.count > 0 && (
                  <span className="fp-tab-badge">{toBnNumber(tab.count)}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main className="fp-main">
          {loading ? (
            <div className="fp-loading">
              <div className="fp-spinner"></div>
              <span>লোড হচ্ছে...</span>
            </div>
          ) : (
            <>
              {activeTab === 'all' && (
                <AllFriendsView
                  friends={filteredFriends}
                  totalCount={friends.length}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onUnfriend={handleUnfriend}
                  onMessage={async (f) => {
                    try {
                      const conv = await findOrCreateDirectConversation(user.id, f.id);
                      navigate(`/messages/${conv.id}`);
                    } catch (err) {
                      console.error('Failed to open conversation:', err);
                      showToast('বার্তা খুলতে ব্যর্থ হয়েছে।');
                    }
                  }}
                />
              )}
              {activeTab === 'requests' && (
                <RequestsView
                  requests={requests}
                  onAccept={handleAccept}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                />
              )}
              {activeTab === 'sent' && (
                <SentView
                  sentReqs={sentReqs}
                  onCancel={handleCancelSent}
                />
              )}
              {activeTab === 'find' && <FindFriendsView userId={user.id} onSendRequest={sendFriendRequest} showToast={showToast} />}
              {activeTab === 'birthdays' && <BirthdaysView userId={user.id} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function AllFriendsView({ friends, totalCount, sortBy, onSortChange, onUnfriend, onMessage }) {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <div className="fp-section-title-group">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">তোমার বন্ধুরা</span>
            <span className="fp-st-en">Your Friends</span>
          </h3>
          <span className="fp-section-count">{toBnNumber(totalCount)} জন</span>
        </div>
        <div className="fp-sort-wrap">
          <select
            className="fp-sort-select"
            value={sortBy}
            onChange={e => onSortChange(e.target.value)}
          >
            <option value="recent">সম্প্রতি যোগ হয়েছে · Recently Added</option>
            <option value="name">নাম অনুযায়ী · Alphabetical</option>
          </select>
          <svg className="fp-sort-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      {friends.length === 0 ? (
        <div className="fp-empty">
          <div className="fp-empty-icon">👥</div>
          <p className="fp-empty-bn">কোনো বন্ধু পাওয়া যায়নি</p>
          <p className="fp-empty-en">No friends found</p>
        </div>
      ) : (
        <div className="fp-grid">
          {friends.map(friend => (
            <div key={friend.friendshipId} className="fp-card">
              <div className="fp-card-top">
                <div
                  className="fp-card-avatar"
                  style={{ background: friend.avatarUrl ? 'none' : getAvatarColor(friend.name) }}
                >
                  {friend.avatarUrl ? (
                    <img src={friend.avatarUrl} alt={friend.name} />
                  ) : (
                    <span className="fp-avatar-char">{getInitial(friend.name)}</span>
                  )}
                </div>
                <button
                  className="fp-card-more"
                  onClick={() => setOpenMenu(openMenu === friend.friendshipId ? null : friend.friendshipId)}
                  aria-label="More options"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="19" cy="12" r="2"/>
                  </svg>
                </button>
                {openMenu === friend.friendshipId && (
                  <div className="fp-card-menu" onMouseLeave={() => setOpenMenu(null)}>
                    <button className="fp-card-menu-item fp-menu-danger" onClick={() => { onUnfriend(friend); setOpenMenu(null); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                      আনফ্রেন্ড করো / Unfriend
                    </button>
                  </div>
                )}
              </div>
              <div className="fp-card-info">
                <span className="fp-card-name">{friend.name}</span>
                <span className="fp-card-since">{timeAgo(friend.since)}</span>
              </div>
              <button className="fp-card-msg-btn" onClick={() => onMessage(friend)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                বার্তা পাঠাও / Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RequestsView({ requests, onAccept, onDelete, actionLoading }) {
  if (requests.length === 0) {
    return (
      <div className="fp-section">
        <div className="fp-section-head">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">বন্ধুর অনুরোধ</span>
            <span className="fp-st-en">Friend Requests</span>
          </h3>
        </div>
        <div className="fp-empty">
          <div className="fp-empty-icon">📬</div>
          <p className="fp-empty-bn">কোনো নতুন অনুরোধ নেই</p>
          <p className="fp-empty-en">No new requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <div className="fp-section-title-group">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">বন্ধুর অনুরোধ</span>
            <span className="fp-st-en">Friend Requests</span>
          </h3>
          <span className="fp-section-count">{toBnNumber(requests.length)} জন</span>
        </div>
      </div>
      <div className="fp-req-list">
        {requests.map(req => {
          const isLoading = actionLoading[req.id];
          return (
            <div key={req.id} className="fp-req-row">
              <div
                className="fp-req-avatar"
                style={{ background: req.requesterAvatar ? 'none' : getAvatarColor(req.requesterName) }}
              >
                {req.requesterAvatar ? (
                  <img src={req.requesterAvatar} alt={req.requesterName} />
                ) : (
                  <span className="fp-avatar-char">{getInitial(req.requesterName)}</span>
                )}
              </div>
              <div className="fp-req-info">
                <span className="fp-req-name">{req.requesterName}</span>
                <span className="fp-req-time">{timeAgo(req.created_at)}</span>
              </div>
              <div className="fp-req-actions">
                <button
                  className="fp-btn fp-btn-accept"
                  disabled={isLoading}
                  onClick={() => onAccept(req)}
                >
                  {isLoading === 'accepting' ? '...' : 'গ্রহণ করুন / Accept'}
                </button>
                <button
                  className="fp-btn fp-btn-delete"
                  disabled={isLoading}
                  onClick={() => onDelete(req)}
                >
                  {isLoading === 'deleting' ? '...' : 'মুছুন / Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SentView({ sentReqs, onCancel }) {
  if (sentReqs.length === 0) {
    return (
      <div className="fp-section">
        <div className="fp-section-head">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">পাঠানো অনুরোধ</span>
            <span className="fp-st-en">Sent Requests</span>
          </h3>
        </div>
        <div className="fp-empty">
          <div className="fp-empty-icon">📤</div>
          <p className="fp-empty-bn">কোনো পাঠানো অনুরোধ নেই</p>
          <p className="fp-empty-en">No sent requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <div className="fp-section-title-group">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">পাঠানো অনুরোধ</span>
            <span className="fp-st-en">Sent Requests</span>
          </h3>
          <span className="fp-section-count">{toBnNumber(sentReqs.length)} জন</span>
        </div>
      </div>
      <div className="fp-req-list">
        {sentReqs.map(req => (
          <div key={req.id} className="fp-req-row">
            <div
              className="fp-req-avatar"
              style={{ background: req.addresseeAvatar ? 'none' : getAvatarColor(req.addresseeName) }}
            >
              {req.addresseeAvatar ? (
                <img src={req.addresseeAvatar} alt={req.addresseeName} />
              ) : (
                <span className="fp-avatar-char">{getInitial(req.addresseeName)}</span>
              )}
            </div>
            <div className="fp-req-info">
              <span className="fp-req-name">{req.addresseeName}</span>
              <span className="fp-req-time">{timeAgo(req.created_at)}</span>
            </div>
            <button className="fp-btn fp-btn-cancel" onClick={() => onCancel(req)}>
              বাতিল করুন / Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FindFriendsView({ userId, onSendRequest, showToast }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [sentIds, setSentIds] = useState(new Set());
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    setLoadingSuggestions(true);
    try {
      const users = await fetchFriendsPageSuggestions(userId);
      setSuggestions(users);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const users = await searchUsers(query, userId);
      setResults(users);
    } catch (err) {
      console.error('Search failed:', err);
      showToast('সার্চ ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(targetUser) {
    try {
      await onSendRequest(userId, targetUser.id);
      setSentIds(prev => new Set([...prev, targetUser.id]));
      showToast('বন্ধু অনুরোধ পাঠানো হয়েছে!');
    } catch (err) {
      console.error(err);
      if (err.message?.includes('duplicate')) {
        showToast('অনুরোধ ইতিমধ্যে পাঠানো হয়েছে।');
        setSentIds(prev => new Set([...prev, targetUser.id]));
      } else {
        showToast('অনুরোধ পাঠানো যায়নি।');
      }
    }
  }

  const displayList = searched ? results : suggestions;

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <h3 className="fp-section-title">
          <span className="fp-st-bn">বন্ধু খুঁজুন</span>
          <span className="fp-st-en">Find Friends</span>
        </h3>
      </div>

      <form className="fp-find-search" onSubmit={handleSearch}>
        <input
          className="fp-find-input"
          placeholder="নাম দিয়ে খুঁজুন... / Search by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="fp-find-btn" disabled={loading}>
          {loading ? '...' : 'খুঁজুন / Search'}
        </button>
      </form>

      {loading || loadingSuggestions ? (
        <div className="fp-loading">
          <div className="fp-spinner"></div>
          <span>খুঁজছে...</span>
        </div>
      ) : displayList.length === 0 ? (
        <div className="fp-empty">
          <div className="fp-empty-icon">{searched ? '🔍' : '👥'}</div>
          <p className="fp-empty-bn">
            {searched ? 'কেউ পাওয়া যায়নি' : 'কোনো সাজেশন নেই'}
          </p>
          <p className="fp-empty-en">
            {searched ? 'No users found' : 'No suggestions available'}
          </p>
        </div>
      ) : (
        <>
          {!searched && (
            <p className="fp-find-hint">
              <span className="fp-find-hint-bn">পরিচিতি হতে পারেন</span>
              <span className="fp-find-hint-en">People You May Know</span>
            </p>
          )}
          <div className="fp-grid">
            {displayList.map(u => (
              <div key={u.id} className="fp-card">
                <div className="fp-card-top">
                  <div
                    className="fp-card-avatar"
                    style={{ background: u.profile_photo_url ? 'none' : getAvatarColor(u.name) }}
                  >
                    {u.profile_photo_url ? (
                      <img src={u.profile_photo_url} alt={u.name} />
                    ) : (
                      <span className="fp-avatar-char">{getInitial(u.name)}</span>
                    )}
                  </div>
                </div>
                <div className="fp-card-info">
                  <span className="fp-card-name">{u.name}</span>
                </div>
                <button
                  className="fp-card-add-btn"
                  disabled={sentIds.has(u.id)}
                  onClick={() => handleSendRequest(u)}
                >
                  {sentIds.has(u.id) ? (
                    'অনুরোধ পাঠানো হয়েছে · Sent'
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      বন্ধু যোগ করো / Add Friend
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BirthdaysView({ userId }) {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBirthdays();
  }, [userId]);

  async function loadBirthdays() {
    setLoading(true);
    try {
      const data = await fetchUpcomingBirthdays(userId);
      setBirthdays(data);
    } catch (err) {
      console.error('Failed to load birthdays:', err);
    } finally {
      setLoading(false);
    }
  }

  function getBirthdayLabel(daysUntil) {
    if (daysUntil === 0) return 'আজ · Today';
    if (daysUntil === 1) return 'আগামীকাল · Tomorrow';
    return `${toBnNumber(daysUntil)} দিন পর · In ${daysUntil} days`;
  }

  if (loading) {
    return (
      <div className="fp-section">
        <div className="fp-section-head">
          <h3 className="fp-section-title">
            <span className="fp-st-bn">জন্মদিন</span>
            <span className="fp-st-en">Birthdays</span>
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
          <span className="fp-st-bn">জন্মদিন</span>
          <span className="fp-st-en">Birthdays</span>
        </h3>
      </div>
      {birthdays.length === 0 ? (
        <div className="fp-empty">
          <div className="fp-empty-icon">🎂</div>
          <p className="fp-empty-bn">আগামী ৩০ দিনে কোনো বন্ধুর জন্মদিন নেই</p>
          <p className="fp-empty-en">No friend birthdays in the next 30 days</p>
        </div>
      ) : (
        <div className="fp-bday-list">
          {birthdays.map(b => (
            <div key={b.id} className="fp-bday-row">
              <div
                className="fp-bday-avatar"
                style={{ background: b.avatarUrl ? 'none' : getAvatarColor(b.name) }}
              >
                {b.avatarUrl ? (
                  <img src={b.avatarUrl} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span className="fp-avatar-char">{getInitial(b.name)}</span>
                )}
              </div>
              <div className="fp-bday-info">
                <span className="fp-bday-name">{b.name}</span>
                <span className="fp-bday-date">{getBirthdayLabel(b.daysUntil)}</span>
              </div>
              <button className="fp-btn fp-btn-accept">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                শুভেচ্ছা পাঠান / Wish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
