import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFriendRequests, respondToFriendRequest } from '../lib/friendsApi';
import { useToast } from './Toast';

export default function SidebarRight({
  birthdays = [
    { id: 1, name: 'তানভীর আহমেদ', textBn: 'তানভীর আহমেদের আজ জন্মদিন।', textEn: 'Send Tanvir Ahmed a birthday wish! · শুভেচ্ছা পাঠান' },
  ],
  suggestions = [
    { id: 1, name: 'সামিয়া আক্তার', mutual: '৪ জন পারস্পরিক বন্ধু · 4 mutual', avClass: 'pymk-avatar-1', avChar: 'স' },
    { id: 2, name: 'মুনতাহা তানভীর', mutual: '৭ জন পারস্পরিক বন্ধু · 7 mutual', avClass: 'pymk-avatar-2', avChar: 'মু' },
    { id: 3, name: 'রিফাত হোসেন', mutual: '৩ জন পারস্পরিক বন্ধু · 3 mutual', avClass: 'pymk-avatar-3', avChar: 'রি' },
  ],
  trendingTopics = [
    { rank: 1, topicBn: '#ঢাকার_বৃষ্টি', count: '২৩,৪০০ পোস্ট · 23.4K posts', tag: 'Weather', isHelp: false },
    { rank: 2, topicBn: '#রাস্তার_খাবার', count: '১৮,৭০০ পোস্ট · 18.7K posts', tag: 'Food', isHelp: false },
    { rank: 3, topicBn: '#বর্ষাকাল', count: '১১,২০০ পোস্ট · 11.2K posts', tag: 'Season', isHelp: false },
    { rank: 4, topicBn: '#সাহায্য_চাই', count: '৮,৯০০ পোস্ট · 8.9K posts', tag: 'Help', isHelp: true },
    { rank: 5, topicBn: '#কমিউনিটি_আপডেট', count: '৫,৪০০ পোস্ট · 5.4K posts', tag: 'Community', isHelp: false },
  ],
  onlineFriends = [
    { id: 1, name: 'রাহেলা বেগম', status: 'Active now · এখন সক্রিয়', avClass: 'av-a', away: false, avChar: 'র' },
    { id: 2, name: 'করিম উদ্দিন', status: 'Active now · এখন সক্রিয়', avClass: 'av-b', away: false, avChar: 'ক' },
    { id: 3, name: 'ফারহানা হক', status: '15 min ago · ১৫ মিনিট আগে', avClass: 'av-c', away: true, avChar: 'ফ' },
    { id: 4, name: 'তানভীর আহমেদ', status: 'Active now · এখন সক্রিয়', avClass: 'av-d', away: false, avChar: 'ত' },
    { id: 5, name: 'সামিয়া আক্তার', status: '32 min ago · ৩২ মিনিট আগে', avClass: 'av-e', away: true, avChar: 'স' },
  ],
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [friendReqs, setFriendReqs] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    if (!user) return;
    setLoadingReqs(true);
    fetchFriendRequests(user.id)
      .then(data => setFriendReqs(data.map(r => ({ ...r, state: 'visible' }))))
      .catch(err => {
        console.error('Failed to load friend requests:', err);
        showToast('বন্ধু অনুরোধ লোড হয়নি।');
      })
      .finally(() => setLoadingReqs(false));
  }, [user]);

  const handleAccept = async (req) => {
    setFriendReqs(prev => prev.map(r => r.id === req.id ? { ...r, state: 'accepting' } : r));
    try {
      await respondToFriendRequest(req.id, 'accepted', user.id);
      setTimeout(() => {
        setFriendReqs(prev => prev.filter(r => r.id !== req.id));
      }, 300);
      showToast('বন্ধু অনুরোধ গ্রহণ করা হয়েছে!');
    } catch (err) {
      console.error('Accept failed:', err);
      setFriendReqs(prev => prev.map(r => r.id === req.id ? { ...r, state: 'visible' } : r));
      showToast('গ্রহণ করা যায়নি। আবার চেষ্টা করো।');
    }
  };

  const handleDelete = async (req) => {
    setFriendReqs(prev => prev.map(r => r.id === req.id ? { ...r, state: 'deleting' } : r));
    try {
      await respondToFriendRequest(req.id, 'rejected', user.id);
      setTimeout(() => {
        setFriendReqs(prev => prev.filter(r => r.id !== req.id));
      }, 250);
    } catch (err) {
      console.error('Delete failed:', err);
      setFriendReqs(prev => prev.map(r => r.id === req.id ? { ...r, state: 'visible' } : r));
      showToast('মুছে ফেলা যায়নি। আবার চেষ্টা করো।');
    }
  };

  const handleAddFriend = (id) => {
    setSentRequests(prev => ({ ...prev, [id]: true }));
  };

  const visibleReqs = friendReqs.filter(req => req.state !== 'hidden');

  return (
    <aside className="sidebar-right" aria-label="Right sidebar widgets">
      {/* Friend Requests */}
      {visibleReqs.length > 0 && (
        <div className="widget">
          <div className="widget-header">
            <div>
              <div className="widget-title-bn">বন্ধু অনুরোধ</div>
              <div className="widget-title-en">Friend Requests</div>
            </div>
            <button className="widget-action" aria-label="See all friend requests">See all</button>
          </div>

          {loadingReqs ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)', fontSize: 13, fontFamily: 'var(--font-bn)' }}>
              লোড হচ্ছে...
            </div>
          ) : (
            visibleReqs.map(req => {
              if (req.state === 'hidden') return null;

              const transitionStyle = {
                opacity: req.state === 'accepting' || req.state === 'deleting' ? 0 : 1,
                transform: req.state === 'accepting' ? 'translateX(20px)' : 'none',
                transition: req.state === 'accepting' ? 'all 0.3s ease' : req.state === 'deleting' ? 'opacity 0.25s ease' : 'none',
              };

              const avatarChar = req.requesterName?.charAt(0) || '?';

              return (
                <div key={req.id} className="friend-req-item" style={transitionStyle}>
                  {req.requesterAvatar ? (
                    <img src={req.requesterAvatar} className="fr-avatar" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  ) : (
                    <div className="fr-avatar fr-avatar-1" aria-hidden="true">
                      {avatarChar}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="fr-name">{req.requesterName}</div>
                    <div className="fr-mutual">বন্ধু অনুরোধ · Friend request</div>
                    <div className="fr-actions">
                      <button className="fr-accept" onClick={() => handleAccept(req)}>
                        গ্রহণ করুন · Accept
                      </button>
                      <button className="fr-delete" onClick={() => handleDelete(req)}>
                        মুছুন · Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Birthday */}
      {birthdays.length > 0 && (
        <div className="widget">
          <div className="widget-header">
            <div>
              <div className="widget-title-bn">জন্মদিন</div>
              <div className="widget-title-en">Birthdays</div>
            </div>
          </div>
          {birthdays.map(b => (
            <div key={b.id} className="birthday-item">
              <div className="birthday-icon">🎂</div>
              <div>
                <div className="birthday-text-bn">{b.textBn}</div>
                <div className="birthday-text-en">{b.textEn}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* People You May Know */}
      <div className="widget">
        <div className="widget-header">
          <div>
            <div className="widget-title-bn">পরিচিত হতে পারেন</div>
            <div className="widget-title-en">People You May Know</div>
          </div>
          <button className="widget-action" aria-label="See all suggestions">See all</button>
        </div>

        {suggestions.map(p => {
          const isSent = sentRequests[p.id];
          return (
            <div key={p.id} className="pymk-item">
              <div className={`pymk-avatar ${p.avClass}`} aria-hidden="true">
                {p.avChar}
              </div>
              <div style={{ flex: 1 }}>
                <div className="pymk-name">{p.name}</div>
                <div className="pymk-mutual">{p.mutual}</div>
              </div>
              <button
                className="pymk-add-btn"
                aria-label={`${p.name}কে বন্ধু হিসেবে যোগ করুন`}
                onClick={() => handleAddFriend(p.id)}
                disabled={isSent}
                style={isSent ? { background: 'var(--teal-pale)', color: 'var(--teal)', border: 'none' } : {}}
              >
                {isSent ? '✓ পাঠানো হয়েছে · Sent' : '+ যোগ করুন'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trending */}
      <div className="widget">
        <div className="widget-header">
          <div>
            <div className="widget-title-bn">ট্রেন্ডিং জলশায়</div>
            <div className="widget-title-en">Trending on Jolshaa</div>
          </div>
        </div>

        {trendingTopics.map(t => (
          <div key={t.rank} className="trending-item">
            <span className="trending-rank">{t.rank}</span>
            <div>
              <div className="trending-topic-bn">{t.topicBn}</div>
              <div className="trending-count">{t.count}</div>
              <span
                className="trending-tag"
                style={t.isHelp ? { background: 'var(--coral-pale)', color: 'var(--coral)' } : {}}
              >
                {t.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Online Friends */}
      <div className="widget">
        <div className="widget-header">
          <div>
            <div className="widget-title-bn">অনলাইন বন্ধুরা</div>
            <div className="widget-title-en">Active Friends</div>
          </div>
        </div>

        {onlineFriends.map(f => (
          <div key={f.id} className={`online-friend ${f.away ? 'online-away' : ''}`}>
            <div className="online-av-wrap">
              <div className={`online-av ${f.avClass}`}>{f.avChar}</div>
              <span className="online-dot"></span>
            </div>
            <div>
              <div className="online-name">{f.name}</div>
              <div className="online-status">{f.status}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
