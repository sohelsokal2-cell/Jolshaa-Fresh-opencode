import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, fetchNotificationCount, markAsRead, markAllAsRead, subscribeToNotifications } from '../lib/notificationsApi';
import './NotificationPanel.css';

const PAGE_SIZE = 20;

function TypeBadgeIcon({ type }) {
  switch (type) {
    case 'friend_request':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case 'friend_accept':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      );
    case 'comment':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    case 'reaction':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      );
    case 'friend_suggestion':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    case 'help_request':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
      );
    case 'rumor_flag':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
        </svg>
      );
    case 'message':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      );
    case 'group_invite':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case 'call_missed':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
        </svg>
      );
    default:
      return null;
  }
}

function ClockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'এইমাত্র';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} মিনিট আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} দিন আগে`;
  return date.toLocaleDateString('bn-BD');
}

function getNotificationText(type, actorName, notification) {
  const name = actorName || 'কেউ';
  const title = notification?.title || '';
  const body = notification?.body || '';
  switch (type) {
    case 'friend_request':
      return { action: 'আপনাকে বন্ধুত্বের অনুরোধ পাঠিয়েছে।', enSub: `${name} sent you a friend request.` };
    case 'friend_accept':
      return { action: 'আপনার বন্ধুত্বের অনুরোধ গ্রহণ করেছে।', enSub: `${name} accepted your friend request.` };
    case 'comment':
      return { action: 'আপনার পোস্টে মন্তব্য করেছে।', enSub: `${name} commented on your post.` };
    case 'reaction':
      return { action: 'আপনার পোস্টে প্রতিক্রিয়া জানিয়েছে।', enSub: `${name} reacted to your post.` };
    case 'friend_suggestion':
      return { action: 'নতুন বন্ধুর পরামর্শ: ', enSub: `New friend suggestion: ${name}` };
    case 'help_request':
      return { action: title || 'সাহায্যের অনুরোধ করেছে।', enSub: body || `${name} needs help.` };
    case 'rumor_flag':
      return { action: title || 'পোস্ট ফ্ল্যাগ করা হয়েছে।', enSub: body || 'A post has been flagged for fact-checking.' };
    case 'message':
      return { action: 'আপনাকে বার্তা পাঠিয়েছে।', enSub: `${name} sent you a message.` };
    case 'group_invite':
      return { action: title || 'গ্রুপে যোগ দিয়েছে।', enSub: body || `${name} joined a group.` };
    case 'call_missed':
      return { action: 'মিস্ড কল।', enSub: 'You missed a call.' };
    default:
      return { action: 'একটি আপডেট দিয়েছে।', enSub: `${name} sent you an update.` };
  }
}

function getAvatarGradient(type) {
  switch (type) {
    case 'friend_request': return 'linear-gradient(135deg,#7c3aed,#a78bfa)';
    case 'friend_accept': return 'linear-gradient(135deg,#10b981,#34d399)';
    case 'comment': return 'linear-gradient(135deg,var(--teal),#34d399)';
    case 'reaction': return 'linear-gradient(135deg,#ec4899,#f43f5e)';
    case 'friend_suggestion': return 'linear-gradient(135deg,#f97316,#ea580c)';
    case 'help_request': return 'linear-gradient(135deg,#ef4444,#f87171)';
    case 'rumor_flag': return 'linear-gradient(135deg,#f59e0b,#fbbf24)';
    case 'message': return 'linear-gradient(135deg,#3b82f6,#60a5fa)';
    case 'group_invite': return 'linear-gradient(135deg,#8b5cf6,#a78bfa)';
    case 'call_missed': return 'linear-gradient(135deg,#ef4444,#dc2626)';
    default: return 'linear-gradient(135deg,#6b7280,#9ca3af)';
  }
}

function getNotificationRoute(notification) {
  const { type, reference_id } = notification;
  if (!reference_id) return null;
  switch (type) {
    case 'friend_request':
    case 'friend_accept':
    case 'friend_suggestion':
      return '/friends';
    case 'comment':
    case 'reaction':
    case 'rumor_flag':
      return `/post/${reference_id}`;
    case 'message':
      return `/messages?conv=${reference_id}`;
    case 'group_invite':
      return `/groups/${reference_id}`;
    case 'help_request':
      return `/sahajjo-chai/${reference_id}`;
    case 'call_missed':
      return `/messages`;
    default:
      return null;
  }
}

function NotificationItem({ notification, onMarkRead, onNavigate }) {
  const { id, type, actorName, actorAvatar, is_read, created_at } = notification;
  const { action, enSub } = getNotificationText(type, actorName, notification);
  const avatarBg = getAvatarGradient(type);
  const avatarLetter = actorName?.charAt(0) || '?';

  const itemClasses = [
    'np-item',
    !is_read && 'is-unread',
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!is_read) onMarkRead?.(id);
    const route = getNotificationRoute(notification);
    if (route) onNavigate?.(route);
  };

  return (
    <div className={itemClasses} role="button" tabIndex="0" aria-label={`${type} notification`} onClick={handleClick}>
      <div className="np-avatar-wrap">
        {actorAvatar ? (
          <img
            src={actorAvatar}
            className="np-avatar"
            style={{ background: 'none', objectFit: 'cover' }}
            alt=""
          />
        ) : (
          <div className="np-avatar" style={{ background: avatarBg }}>
            {avatarLetter}
          </div>
        )}
        <div className={`np-type-badge ntb-${type.replace(/_/g, '-')}`}>
          <TypeBadgeIcon type={type} />
        </div>
      </div>

      <div className="np-body">
        <div className={!is_read ? 'np-text' : 'np-text read-text'}>
          <span className="np-name" style={!is_read ? {} : { color: 'var(--text-mid)' }}>
            {actorName || 'System'}
          </span>
          <span className="np-action">{action}</span>
          <span className="np-en-sub">{enSub}</span>
        </div>

        <div className="np-time" style={!is_read ? {} : { color: 'var(--text-xlight)' }}>
          <ClockIcon />
          {timeAgo(created_at)}
        </div>
      </div>

      {!is_read && <div className="np-unread-dot"></div>}
    </div>
  );
}

export default function NotificationPanel({ isOpen, onClose, onUnreadCountChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [notifData, setNotifData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const markReadTimerRef = useRef(null);
  const listRef = useRef(null);

  const unreadCount = notifData.filter((n) => !n.is_read).length;

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  useEffect(() => {
    if (!user || !isOpen) return;
    setLoading(true);
    setNotifData([]);
    setHasMore(true);
    Promise.all([
      fetchNotifications(user.id, PAGE_SIZE, 0),
      fetchNotificationCount(user.id)
    ])
      .then(([data, count]) => {
        setNotifData(data);
        setTotalCount(count);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(err => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => setLoading(false));
  }, [user, isOpen]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.id, (newNotif) => {
      setNotifData(prev => [{ ...newNotif, actorName: null, actorAvatar: null }, ...prev]);
      setTotalCount(prev => prev + 1);
    }, 'notifications-panel');
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleScroll = useCallback(() => {
    if (!listRef.current || loadingMore || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setLoadingMore(true);
      const offset = notifData.length;
      fetchNotifications(user.id, PAGE_SIZE, offset)
        .then(data => {
          setNotifData(prev => [...prev, ...data]);
          setHasMore(data.length === PAGE_SIZE);
        })
        .catch(err => console.error('Failed to load more:', err))
        .finally(() => setLoadingMore(false));
    }
  }, [notifData.length, loadingMore, hasMore, user]);

  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    if (!list) return;
    list.addEventListener('scroll', handleScroll);
    return () => list.removeEventListener('scroll', handleScroll);
  }, [isOpen, handleScroll]);

  const handleMarkRead = async (notifId) => {
    setNotifData(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    onUnreadCountChange?.(Math.max(0, unreadCount - 1));
    try {
      await markAsRead(notifId, user.id);
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifData(prev => prev.map(n => ({ ...n, is_read: true })));
    onUnreadCountChange?.(0);
    try {
      await markAllAsRead(user.id);
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  const handleNavigate = (route) => {
    onClose?.();
    navigate(route);
  };

  if (!isOpen) return null;

  const filteredNotifications = activeTab === 'unread'
    ? notifData.filter((n) => !n.is_read)
    : notifData;

  return (
    <>
      <div className="np-backdrop" onClick={onClose}></div>
      <div className="notif-anchor">
        <div className="notif-caret"></div>
        <div className="notif-panel" role="dialog" aria-label="নোটিফিকেশন / Notifications">
          <div className="np-header">
            <div className="np-title">
              <span className="np-title-bn">নোটিফিকেশন</span>
              <span className="np-title-en">Notifications</span>
            </div>
            <button className="np-options-btn" aria-label="Options" title="বিকল্প / Options">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>

          <div className="np-tabs" role="tablist">
            <button
              className={`np-tab ${activeTab === 'all' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              <div>
                <div className="np-tab-bn">সব</div>
                <div className="np-tab-en">All</div>
              </div>
              <div className="np-tab-count">{totalCount}</div>
            </button>
            <button
              className={`np-tab ${activeTab === 'unread' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'unread'}
              onClick={() => setActiveTab('unread')}
            >
              <div>
                <div className="np-tab-bn">না পড়া</div>
                <div className="np-tab-en">Unread</div>
              </div>
              <div className="np-tab-count">{unreadCount}</div>
            </button>
            <button className="np-mark-all" onClick={handleMarkAllRead} title="সব পড়া হিসেবে চিহ্নিত করো">
              সব পড়া ✓
            </button>
          </div>

          <div className="np-divider"></div>

          <div className="np-list" ref={listRef}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontSize: 13, fontFamily: 'var(--font-bn)' }}>
                লোড হচ্ছে...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontSize: 13, fontFamily: 'var(--font-bn)' }}>
                {activeTab === 'unread' ? 'সব পড়া হয়েছে। / All read.' : 'এখনো কোনো নোটিফিকেশন নেই। / No notifications yet.'}
              </div>
            ) : (
              <>
                {filteredNotifications.filter(n => !n.is_read).length > 0 && (
                  <>
                    <div className="np-section-label">
                      <span className="np-section-bn">নতুন</span>
                      <span className="np-section-en">/ New</span>
                      <div className="np-section-line"></div>
                    </div>
                    {filteredNotifications.filter(n => !n.is_read).map(n => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} onNavigate={handleNavigate} />
                    ))}
                  </>
                )}
                {filteredNotifications.filter(n => n.is_read).length > 0 && (
                  <>
                    <div className="np-section-label">
                      <span className="np-section-bn">আগের</span>
                      <span className="np-section-en">/ Earlier</span>
                      <div className="np-section-line"></div>
                    </div>
                    {filteredNotifications.filter(n => n.is_read).map(n => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} onNavigate={handleNavigate} />
                    ))}
                  </>
                )}
                {loadingMore && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)', fontSize: 12 }}>
                    আরো লোড হচ্ছে...
                  </div>
                )}
                {!hasMore && notifData.length > 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-xlight)', fontSize: 12, fontFamily: 'var(--font-bn)' }}>
                    সব নোটিফিকেশন দেখা হয়েছে।
                  </div>
                )}
              </>
            )}
          </div>

          <div className="np-footer">
            <button className="np-see-all-btn" onClick={() => handleNavigate('/notifications')}>
              <span className="np-see-all-bn">সব দেখো</span>
              See All Notifications
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
