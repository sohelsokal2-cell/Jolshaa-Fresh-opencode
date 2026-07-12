import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationPanel.css';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    type: 'friend',
    name: 'রাফি আহমেদ',
    nameEn: 'Rafi Ahmed',
    action: 'আপনাকে বন্ধুত্বের অনুরোধ পাঠিয়েছে।',
    enSub: 'Rafi Ahmed sent you a friend request.',
    time: '২৩ মিনিট আগে',
    timeEn: '23 mins ago',
    unread: true,
    avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    avatarLetter: 'র',
    section: 'new',
  },
  {
    id: 2,
    type: 'suggest',
    name: 'নাফিসা ইসলাম',
    nameEn: 'Nafisa Islam',
    action: 'নতুন বন্ধুর পরামর্শ: ',
    enSub: 'New friend suggestion: Nafisa Islam',
    time: '১ ঘন্টা আগে',
    timeEn: '1 hour ago',
    unread: true,
    avatarBg: 'linear-gradient(135deg,#f97316,#ea580c)',
    avatarLetter: 'ন',
    section: 'new',
  },
  {
    id: 3,
    type: 'comment',
    name: 'সামিরা রহমান',
    nameEn: 'Samira Rahman',
    action: 'আপনার পোস্টে মন্তব্য করেছে।',
    enSub: 'Samira Rahman commented on your post.',
    time: '৩ ঘন্টা আগে',
    timeEn: '3 hrs ago',
    unread: true,
    avatarBg: 'linear-gradient(135deg,var(--teal),#34d399)',
    avatarLetter: 'স',
    avatarSm: true,
    metaChip: '৫টি মন্তব্য · 5 comments',
    section: 'earlier',
  },
  {
    id: 4,
    type: 'react',
    name: 'করিম, মিনারা',
    nameEn: 'Karim, Minara',
    action: ' এবং আরও ৮ জন আপনার পোস্টে প্রতিক্রিয়া জানিয়েছে।',
    enSub: 'Karim, Minara & 8 others reacted to your post.',
    time: '৬ ঘন্টা আগে',
    timeEn: '6 hrs ago',
    unread: false,
    reactors: [
      { letter: 'ক', bg: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
      { letter: 'ম', bg: 'linear-gradient(135deg,#f97316,#ea580c)' },
      { letter: 'র', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
    ],
    metaChip: '১০টি প্রতিক্রিয়া · 10 reactions',
    metaChipStyle: { background: 'var(--coral-pale)', borderColor: 'rgba(232,92,74,0.12)' },
    metaChipTextStyle: { color: 'var(--coral-dark)' },
    section: 'earlier',
  },
  {
    id: 5,
    type: 'photo',
    name: 'তানিয়া সুলতানা',
    nameEn: 'Tania Sultana',
    action: ' নতুন ছবি যোগ করেছে — তুমি ট্যাগড।',
    enSub: "Tania Sultana added new photos — you're tagged.",
    time: 'গতকাল',
    timeEn: 'Yesterday',
    unread: false,
    avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    avatarLetter: 'ত',
    avatarSm: true,
    thumbnail: '🌿',
    section: 'earlier',
  },
  {
    id: 6,
    type: 'page',
    name: 'দৈনিক বাংলাদেশ টাইমস',
    nameEn: 'Daily Bangladesh Times',
    action: 'তোমার পেজ -এর পূর্ণ নিয়ন্ত্রণ সরানো হয়েছে।',
    enSub: "Your full admin control of 'Daily Bangladesh Times' page was removed.",
    time: 'গতকাল',
    timeEn: 'Yesterday',
    unread: true,
    isAdmin: true,
    avatarBg: 'linear-gradient(135deg,#d97706,#fbbf24)',
    avatarLetter: '📋',
    avatarSm: true,
    adminTag: 'পেজ অ্যাডমিন · Page Admin Action',
    section: 'earlier',
  },
  {
    id: 7,
    type: 'comment',
    name: 'আরিফ হোসেন',
    nameEn: 'Arif Hossain',
    action: 'আপনার ছবিতে মন্তব্য করেছে।',
    enSub: 'Arif Hossain commented on your photo.',
    time: '২ দিন আগে',
    timeEn: '2 days ago',
    unread: false,
    avatarBg: 'linear-gradient(135deg,#10b981,#34d399)',
    avatarLetter: 'আ',
    avatarSm: true,
    section: 'earlier',
  },
];

function TypeBadgeIcon({ type }) {
  switch (type) {
    case 'friend':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case 'suggest':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15H11v-2h2v2zm0-4H11V7h2v6z" />
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
    case 'react':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    case 'photo':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <rect x="2" y="7" width="20" height="14" rx="3" />
          <path d="M16 3H8l-1 4h10z" />
          <circle cx="12" cy="14" r="3" />
        </svg>
      );
    case 'page':
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
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

function NotificationItem({ notification, onConfirmFriend, onDeleteFriend }) {
  const {
    id, type, name, nameEn, action, enSub, time, timeEn,
    unread, isAdmin, avatarBg, avatarLetter, avatarSm,
    reactors, metaChip, metaChipStyle, metaChipTextStyle,
    thumbnail, adminTag, section,
  } = notification;

  const itemClasses = [
    'np-item',
    unread && 'is-unread',
    isAdmin && 'is-admin',
  ].filter(Boolean).join(' ');

  const handleConfirm = (e) => {
    e.stopPropagation();
    onConfirmFriend?.(id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteFriend?.(id);
  };

  const renderAvatar = () => {
    if (reactors) {
      return (
        <div className="np-avatar-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="np-reactors" style={{ marginTop: '2px' }}>
            {reactors.map((r, i) => (
              <div
                key={i}
                className="np-reactor-av"
                style={{ background: r.bg }}
              >
                {r.letter}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="np-avatar-wrap">
        <div
          className={`np-avatar ${avatarSm ? 'sm' : ''}`}
          style={{ background: avatarBg }}
        >
          {avatarLetter}
        </div>
        <div className={`np-type-badge ntb-${type}`}>
          <TypeBadgeIcon type={type} />
        </div>
      </div>
    );
  };

  const renderBody = () => {
    const textClass = unread ? 'np-text' : 'np-text read-text';
    const nameStyle = unread ? {} : { color: 'var(--text-mid)' };
    const timeStyle = unread ? {} : { color: 'var(--text-xlight)' };

    return (
      <div className="np-body">
        <div className={textClass}>
          {type === 'suggest' ? (
            <>
              <span className="np-action">{action}</span>
              <span className="np-name" style={nameStyle}>{name}</span>
            </>
          ) : type === 'page' ? (
            <>
              <span className="np-action">তোমার পেজ </span>
              <span className="np-name" style={nameStyle}>{name}</span>
              <span className="np-action">-এর পূর্ণ নিয়ন্ত্রণ সরানো হয়েছে।</span>
            </>
          ) : (
            <>
              <span className="np-name" style={nameStyle}>{name}</span>
              <span className="np-action">{action}</span>
            </>
          )}
          <span className="np-en-sub">{enSub}</span>
        </div>

        <div className="np-time" style={timeStyle}>
          <ClockIcon />
          {time}
          {timeEn && (
            <>
              <div className="np-time-dot"></div>
              <span>{timeEn}</span>
            </>
          )}
        </div>

        {metaChip && (
          <div className="np-meta-chip" style={metaChipStyle}>
            <span style={metaChipTextStyle}>{metaChip}</span>
          </div>
        )}

        {type === 'suggest' && (
          <div className="np-suggest-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <div>
              <div className="btn-follow-bn">বন্ধু যোগ করো</div>
              <div className="btn-follow-en">Add Friend</div>
            </div>
          </div>
        )}

        {type === 'friend' && (
          <div className="np-inline-actions">
            <button className="btn-confirm" onClick={handleConfirm}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <div className="btn-confirm-bn">নিশ্চিত করো</div>
                <div className="btn-confirm-en">Confirm</div>
              </div>
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <div>
                <div className="btn-delete-bn">মুছো</div>
                <div className="btn-delete-en">Delete</div>
              </div>
            </button>
          </div>
        )}

        {adminTag && (
          <div className="np-admin-tag">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{adminTag}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={itemClasses} role="button" tabIndex="0" aria-label={`${type} notification`}>
      {renderAvatar()}
      {renderBody()}
      {type === 'photo' && thumbnail && (
        <div className="np-thumb">{thumbnail}</div>
      )}
      {unread && !isAdmin && <div className="np-unread-dot"></div>}
      {unread && isAdmin && <div className="np-admin-unread-dot"></div>}
    </div>
  );
}

export default function NotificationPanel({ isOpen, onClose, notifications = DEFAULT_NOTIFICATIONS }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [notifData, setNotifData] = useState(notifications);

  const totalCount = notifData.length;
  const unreadCount = notifData.filter((n) => n.unread).length;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const filteredNotifications = activeTab === 'unread'
    ? notifData.filter((n) => n.unread)
    : notifData;

  const newSection = filteredNotifications.filter((n) => n.section === 'new');
  const earlierSection = filteredNotifications.filter((n) => n.section === 'earlier');

  const markAllRead = () => {
    setNotifData((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleConfirmFriend = (id) => {
    setNotifData((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteFriend = (id) => {
    setNotifData((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSeeAll = () => {
    onClose?.();
    navigate('/notifications');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="np-backdrop" onClick={onClose}></div>

      {/* Panel anchor */}
      <div className="notif-anchor">
        <div className="notif-caret"></div>
        <div className="notif-panel" role="dialog" aria-label="নোটিফিকেশন / Notifications">

          {/* Header */}
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

          {/* Tabs */}
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
            <button
              className="np-mark-all"
              onClick={markAllRead}
              title="সব পড়া হিসেবে চিহ্নিত করো"
            >
              সব পড়া ✓
            </button>
          </div>

          <div className="np-divider"></div>

          {/* Scrollable list */}
          <div className="np-list">
            {/* New section */}
            {newSection.length > 0 && (
              <>
                <div className="np-section-label">
                  <span className="np-section-bn">নতুন</span>
                  <span className="np-section-en">/ New</span>
                  <div className="np-section-line"></div>
                </div>
                {newSection.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onConfirmFriend={handleConfirmFriend}
                    onDeleteFriend={handleDeleteFriend}
                  />
                ))}
              </>
            )}

            {/* Earlier section */}
            {earlierSection.length > 0 && (
              <>
                <div className="np-section-label">
                  <span className="np-section-bn">আগের</span>
                  <span className="np-section-en">/ Earlier</span>
                  <div className="np-section-line"></div>
                </div>
                {earlierSection.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onConfirmFriend={handleConfirmFriend}
                    onDeleteFriend={handleDeleteFriend}
                  />
                ))}
              </>
            )}
          </div>

          {/* Footer */}
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
