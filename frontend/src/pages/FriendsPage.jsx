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
} from '../lib/friendsApi';
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
    { id: 'suggestions', bn: 'পরিচিতি হতে পারেন', en: 'People You May Know', count: null },
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
                  onMessage={(f) => navigate('/messenger')}
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
              {activeTab === 'suggestions' && <SuggestionsView />}
              {activeTab === 'birthdays' && <BirthdaysView />}
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

function SuggestionsView() {
  const suggestions = [
    { id: 1, name: 'রিফাত হোসেন', mutual: 3 },
    { id: 2, name: 'নুসরাত জাহান', mutual: 7 },
    { id: 3, name: 'আরিফুল ইসলাম', mutual: 2 },
    { id: 4, name: 'মাহমুদা আক্তার', mutual: 5 },
    { id: 5, name: 'কামরুজ্জামান', mutual: 1 },
    { id: 6, name: 'ফারহানা পারভিন', mutual: 4 },
  ];

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <h3 className="fp-section-title">
          <span className="fp-st-bn">পরিচিতি হতে পারেন</span>
          <span className="fp-st-en">People You May Know</span>
        </h3>
      </div>
      <div className="fp-grid">
        {suggestions.map(s => (
          <div key={s.id} className="fp-card fp-card-suggestion">
            <button className="fp-card-dismiss" aria-label="Dismiss">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="fp-card-top">
              <div className="fp-card-avatar" style={{ background: getAvatarColor(s.name) }}>
                <span className="fp-avatar-char">{getInitial(s.name)}</span>
              </div>
            </div>
            <div className="fp-card-info">
              <span className="fp-card-name">{s.name}</span>
              <span className="fp-card-mutual">{toBnNumber(s.mutual)} জন পারস্পরিক বন্ধু · {s.mutual} mutual</span>
            </div>
            <button className="fp-card-add-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              বন্ধু যোগ করো / Add Friend
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BirthdaysView() {
  const birthdays = [
    { id: 1, name: 'তানভীর আহমেদ', date: 'আজ · Today' },
    { id: 2, name: 'সামিয়া আক্তার', date: 'আগামীকাল · Tomorrow' },
    { id: 3, name: 'রাহেলা বেগম', date: '৩ দিন পর · In 3 days' },
  ];

  return (
    <div className="fp-section">
      <div className="fp-section-head">
        <h3 className="fp-section-title">
          <span className="fp-st-bn">জন্মদিন</span>
          <span className="fp-st-en">Birthdays</span>
        </h3>
      </div>
      <div className="fp-bday-list">
        {birthdays.map(b => (
          <div key={b.id} className="fp-bday-row">
            <div className="fp-bday-avatar" style={{ background: getAvatarColor(b.name) }}>
              <span className="fp-avatar-char">{getInitial(b.name)}</span>
            </div>
            <div className="fp-bday-info">
              <span className="fp-bday-name">{b.name}</span>
              <span className="fp-bday-date">{b.date}</span>
            </div>
            <button className="fp-btn fp-btn-accept">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              শুভেচ্ছা পাঠান / Wish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
