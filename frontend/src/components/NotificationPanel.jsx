import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markAsRead, markAllAsRead, subscribeToNotifications } from '../lib/notificationsApi';
import './NotificationPanel.css';

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
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case 'comment':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
          <line x1="9" y1="13" x2="13" y2="13" />
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
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15H11v-2h2v2zm0-4H11V7h2v6z" />
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

function getNotificationText(type, actorName) {
  const name = actorName || 'কেউ';
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
    default: return 'linear-gradient(135deg,#6b7280,#9ca3af)';
  }
}

function NotificationItem({ notification, onMarkRead }) {
  const { id, type, actorName, actorAvatar, is_read, created_at } = notification;
  const { action, enSub } = getNotificationText(type, actorName);
  const avatarBg = getAvatarGradient(type);
  const avatarLetter = actorName?.charAt(0) || '?';
  const isFriendType = type === 'friend_request' || type === 'friend_accept';

  const itemClasses = [
    'np-item',
    !is_read && 'is-unread',
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!is_read) onMarkRead?.(id);
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
        <div className={`np-type-badge ntb-${type.replace('_', '-')}`}>
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

  const totalCount = notifData.length;
  const unreadCount = notifData.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user || !isOpen) return;
    setLoading(true);
    fetchNotifications(user.id, 30)
      .then(data => setNotifData(data))
      .catch(err => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => setLoading(false));
  }, [user, isOpen]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.id, (newNotif) => {
      setNotifData(prev => [{ ...newNotif, actorName: null, actorAvatar: null }, ...prev]);
      setUnreadCount(prev => {
        const next = prev + 1;
        onUnreadCountChange?.(next);
        return next;
      });
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

  const filteredNotifications = activeTab === 'unread'
    ? notifData.filter((n) => !n.is_read)
    : notifData;

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

  const handleSeeAll = () => {
    onClose?.();
  };

  if (!isOpen) return null;

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

          <div className="np-list">
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
                      <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
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
                      <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          <div className="np-footer">
            <button className="np-see-all-btn" onClick={handleSeeAll}>
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
