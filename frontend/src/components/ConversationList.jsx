import React, { useState } from 'react';

const DEFAULT_CONVERSATIONS = [
  {
    id: 1,
    name: 'রাহেলা বেগম',
    avatarChar: 'র',
    avatarClass: 'av-1',
    onlineStatus: 'green', // 'green' | 'grey' | null
    isGroup: false,
    isPinned: true,
    lastMsgBn: 'আপা, কালকে কি রান্না করবেন?',
    lastMsgEn: '',
    time: '১০:৪২ মি.',
    unreadCount: 0,
    isUnread: true, // bold preview style
    muted: false,
  },
  {
    id: 2,
    name: 'করিম উদ্দিন',
    avatarChar: 'ক',
    avatarClass: 'av-2',
    onlineStatus: 'green',
    isGroup: false,
    isPinned: true,
    lastMsgBn: 'জি ভাই, কাজটা হয়ে গেছে।',
    lastMsgEn: '',
    time: 'গতকাল',
    unreadCount: 0,
    isUnread: false,
    muted: false,
  },
  {
    id: 3,
    name: 'জলশা রান্নাঘর 🍳',
    avatarChar: 'জ',
    avatarClass: 'av-3',
    onlineStatus: null,
    isGroup: true,
    isPinned: false,
    lastMsgBn: 'নাবিলা: রেসিপিটা শেয়ার করবেন?',
    lastMsgEn: '',
    time: 'গতকাল',
    unreadCount: 3,
    isUnread: true,
    muted: false,
  },
  {
    id: 4,
    name: 'ফারহানা হক',
    avatarChar: 'ফ',
    avatarClass: 'av-4',
    onlineStatus: 'grey',
    isGroup: false,
    isPinned: false,
    lastMsgBn: 'ছবিগুলো পাঠালাম।',
    lastMsgEn: '',
    time: '২ দিন আগে',
    unreadCount: 0,
    isUnread: false,
    muted: false,
  },
  {
    id: 5,
    name: 'তানভীর আহমেদ',
    avatarChar: 'ত',
    avatarClass: 'av-5',
    onlineStatus: 'green',
    isGroup: false,
    isPinned: false,
    lastMsgBn: 'ভয়েস বার্তা (0:45)',
    lastMsgEn: '',
    time: '৩ দিন আগে',
    unreadCount: 0,
    isUnread: false,
    muted: true,
  },
  {
    id: 6,
    name: 'সামিয়া আক্তার',
    avatarChar: 'স',
    avatarClass: 'av-6',
    onlineStatus: 'grey',
    isGroup: false,
    isPinned: false,
    lastMsgBn: 'ঠিক আছে, পরে কথা হবে।',
    lastMsgEn: '',
    time: '৫ দিন আগে',
    unreadCount: 0,
    isUnread: false,
    muted: false,
  },
  {
    id: 7,
    name: 'সাহাজ্জো গ্রুপ 🆘',
    avatarChar: 'স',
    avatarClass: 'av-7',
    onlineStatus: null,
    isGroup: true,
    isPinned: false,
    lastMsgBn: 'জাফর: জরুরী সাহায্য দরকার!',
    lastMsgEn: '',
    time: '১ সপ্তাহ আগে',
    unreadCount: 0,
    isUnread: false,
    muted: false,
  },
];

export default function ConversationList({
  conversations = DEFAULT_CONVERSATIONS,
  activeId,
  onSelectConversation,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'groups'
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredConversations = conversations.filter(conv => {
    // Search filter
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.lastMsgBn.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'unread') {
      return conv.isUnread || conv.unreadCount > 0;
    }
    if (activeTab === 'groups') {
      return conv.isGroup;
    }
    return true;
  });

  // Separate pinned vs normal messages
  const pinnedConversations = filteredConversations.filter(c => c.isPinned);
  const otherConversations = filteredConversations.filter(c => !c.isPinned);

  const renderConvItem = (conv) => {
    const isActive = conv.id === activeId;
    return (
      <div
        key={conv.id}
        className={`conv-item ${isActive ? 'active' : ''}`}
        role="listitem"
        tabIndex="0"
        aria-label={`${conv.name} conversation`}
        onClick={() => onSelectConversation(conv)}
      >
        <div className="conv-av-wrap">
          <div className={`conv-av ${conv.avatarClass}`}>{conv.avatarChar}</div>
          {conv.onlineStatus && (
            <span className={`online-dot ${conv.onlineStatus === 'green' ? 'green' : 'grey'}`}></span>
          )}
          {conv.isGroup && (
            <span className="group-badge">👥</span>
          )}
        </div>
        <div className="conv-info">
          <div className="conv-name-row">
            <span className="conv-name">{conv.name}</span>
            <span className="conv-time">{conv.time}</span>
          </div>
          <div className="conv-preview-row">
            <span className={`conv-preview ${conv.isUnread ? 'unread' : ''}`}>
              {conv.lastMsgBn}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {conv.muted && (
                <span className="conv-muted" title="Muted">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18.85 18.85a10 10 0 01-14-14m1.41-1.41a10 10 0 0114.14 14.14M12 7V5a2 2 0 00-2-2H8M8 12a4 4 0 004 4h2M19 12a7 7 0 01-7 7" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2.5" />
                  </svg>
                </span>
              )}
              {conv.unreadCount > 0 && (
                <span className="conv-badge">{conv.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="conv-list" aria-label="Conversations">
      {/* Header */}
      <div className="conv-header">
        <div className="conv-title">
          <span className="conv-title-bn">মেসেজ</span>
          <span className="conv-title-en">Messages</span>
        </div>
        <button className="new-msg-btn" aria-label="নতুন বার্তা / New Message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="conv-search">
        <div className="conv-search-inner">
          <span className="conv-search-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="খুঁজুন... / Search conversations"
            aria-label="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <div className="filter-tabs-inner">
          <button
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            aria-pressed={activeTab === 'all'}
          >
            <span className="filter-tab-bn">সব</span>
            <span className="filter-tab-en">All</span>
          </button>
          <button
            className={`filter-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
            aria-pressed={activeTab === 'unread'}
          >
            <span className="filter-tab-bn">পড়িনি</span>
            <span className="filter-tab-en">Unread</span>
          </button>
          <button
            className={`filter-tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
            aria-pressed={activeTab === 'groups'}
          >
            <span className="filter-tab-bn">গ্রুপ</span>
            <span className="filter-tab-en">Groups</span>
          </button>
        </div>
      </div>

      {/* Conversation Items list */}
      <div className="conv-items" role="list" aria-label="Conversation list">
        {/* Pinned label */}
        {pinnedConversations.length > 0 && (
          <>
            <div className="conv-section-label">পিন করা বার্তা · Pinned</div>
            {pinnedConversations.map(renderConvItem)}
          </>
        )}

        {/* All messages label */}
        {otherConversations.length > 0 && (
          <>
            <div className="conv-section-label" style={{ marginTop: '8px' }}>সব বার্তা · All Messages</div>
            {otherConversations.map(renderConvItem)}
          </>
        )}

        {filteredConversations.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px', fontFamily: 'var(--font-bn)', fontSize: '14px' }}>
            কোনো মেসেজ পাওয়া যায়নি
          </div>
        )}
      </div>
    </aside>
  );
}
