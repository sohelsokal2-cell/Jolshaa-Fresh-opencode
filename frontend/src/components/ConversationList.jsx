import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchConversations, trackPresence } from '../lib/messagingApi';
import NewMessageModal from './NewMessageModal';
import { useNavigate } from 'react-router-dom';

// Avatar gradient classes (cycling through available colors)
const AVATAR_CLASSES = ['av-1', 'av-2', 'av-3', 'av-4', 'av-5', 'av-6', 'av-7'];

function getAvatarClass(index) {
  return AVATAR_CLASSES[index % AVATAR_CLASSES.length];
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'এখন';
  if (diffMins < 60) return `${diffMins} মি.`;
  if (diffHours < 24) return `${diffHours} ঘ.`;
  if (diffDays < 7) return `${diffDays} দিন`;
  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
}

export default function ConversationList({
  activeId,
  onSelectConversation,
  refreshTrigger,
  typingConversations = {},
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  // Track global online presence
  useEffect(() => {
    if (!user) return;
    const unsubscribe = trackPresence(user.id, (onlineSet) => {
      setOnlineUserIds(onlineSet);
    });
    return () => unsubscribe();
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchConversations(user.id);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, refreshTrigger]);

  // Filtering logic
  const filteredConversations = conversations.filter(conv => {
    const otherName = conv.otherParticipants?.[0]?.name || '';
    const lastMsgText = conv.lastMessage?.content || '';

    const matchesSearch =
      otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.groupName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsgText.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'unread') {
      return conv.unreadCount > 0;
    }
    if (activeTab === 'groups') {
      return conv.isGroup;
    }
    return true;
  });

   const handleNewConversationCreated = (convId) => {
     navigate(`/messages/${convId}`);
     setShowNewMessageModal(false);
     // Refresh list after a brief delay
     setTimeout(() => {
       loadConversations();
     }, 300);
   };

   const renderConvItem = (conv, idx) => {
     const isActive = conv.id === activeId;
     const isGroup = conv.isGroup;
     const other = conv.otherParticipants?.[0];
     
     // Name: group name or other user name
     const name = isGroup ? conv.groupName : (other?.name || 'অজানা ব্যবহারকারী');
     
     // Avatar: group stack or single avatar
     const avatarChar = name.charAt(0);
     const avatarClass = getAvatarClass(idx);
     
       // Last message preview with type prefix
       let lastMsgText = conv.lastMessage?.content || '';
       const lastMsg = conv.lastMessage;
       if (!lastMsgText && lastMsg) {
         if (lastMsg.image_url && !lastMsg.audio_url) lastMsgText = '📷 ছবি';
         else if (lastMsg.audio_url) lastMsgText = '🎤 ভয়েস নোট';
         else if (lastMsg.location_lat) lastMsgText = '📍 অবস্থান';
       }
     
      const lastMsgTime = formatTime(conv.lastMessage?.created_at);
      const hasUnread = conv.unreadCount > 0;
      const isMuted = conv.isMuted;
      const typingUser = typingConversations[conv.id];
      // Online status: check global presence tracking for the other participant (direct chats only)
      const isOnline = !isGroup && other?.id ? onlineUserIds.has(other.id) : false;

     return (
       <div
         key={conv.id}
         className={`conv-item ${isActive ? 'active' : ''}`}
         role="listitem"
         tabIndex="0"
         aria-label={`${name} conversation`}
         onClick={() => onSelectConversation(conv)}
       >
         {/* Avatar */}
         <div className="conv-av-wrap">
           {isGroup ? (
             // Group avatar stack (two overlapping circles)
             <div className="group-av-stack">
               <div className={`group-av-mini gam-1 ${avatarClass}`}>
                 {conv.otherParticipants?.[0]?.name?.charAt(0) || 'G'}
               </div>
               <div className={`group-av-mini gam-2 ${avatarClass}`}>
                 {conv.otherParticipants?.[1]?.name?.charAt(0) || '2'}
               </div>
             </div>
           ) : (
             <div className={`conv-av ${avatarClass}`}>{avatarChar}</div>
           )}
           
           {/* Online indicator (only for direct chats) */}
           {!isGroup && (
             <span className={`online-dot ${isOnline ? 'green' : 'grey'}`}></span>
           )}
           
           {/* Group badge */}
           {isGroup && (
             <span className="group-badge">গ্রুপ</span>
           )}
         </div>

         {/* Info */}
         <div className="conv-info">
           <div className="conv-name-row">
             <span className="conv-name">{name}</span>
             <span className="conv-time">{lastMsgTime}</span>
           </div>
            <div className="conv-preview-row">
              {isMuted && (
                <span className="conv-muted" title="মিউট করা">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0 -5.94 -.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </span>
              )}
              <span className={`conv-preview ${hasUnread ? 'unread' : ''}`}>
                {typingUser ? (
                  <span style={{ color: 'var(--teal)', fontStyle: 'italic' }}>টাইপ করছেন...</span>
                ) : (
                  lastMsgText || 'কোনো বার্তা নেই'
                )}
              </span>
              {hasUnread && !typingUser && (
                <span className="conv-badge">{conv.unreadCount}</span>
              )}
            </div>
         </div>
       </div>
     );
   };

   return (
     <>
       <aside className="conv-list" aria-label="Conversations">
         {/* Header */}
         <div className="conv-header">
           <div className="conv-title">
             <span className="conv-title-bn">মেসেজ</span>
             <span className="conv-title-en">Messages</span>
           </div>
           <button
             className="new-msg-btn"
             onClick={() => setShowNewMessageModal(true)}
             title="নতুন বার্তা / New message"
             aria-label="Compose new message"
           >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
               <path d="M12 5v14M5 12h14" strokeLinecap="round" />
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
            placeholder="খুঁজুন... / Search"
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
          >
            <span className="filter-tab-bn">সব</span>
            <span className="filter-tab-en">All</span>
          </button>
          <button
            className={`filter-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            <span className="filter-tab-bn">পড়িনি</span>
            <span className="filter-tab-en">Unread</span>
          </button>
          <button
            className={`filter-tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <span className="filter-tab-bn">গ্রুপ</span>
            <span className="filter-tab-en">Groups</span>
          </button>
        </div>
      </div>

      {/* Conversation Items */}
      <div className="conv-items" role="list" aria-label="Conversation list">
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px', fontFamily: 'var(--font-bn)', fontSize: '14px' }}>
            লোড হচ্ছে...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px', fontFamily: 'var(--font-bn)', fontSize: '14px' }}>
            {searchQuery ? 'কোনো মেসেজ পাওয়া যায়নি' : 'এখনো কোনো কথোপকথন নেই'}
          </div>
        ) : (
          filteredConversations.map((conv, idx) => renderConvItem(conv, idx))
         )}
       </div>
     </aside>

       <NewMessageModal
         isOpen={showNewMessageModal}
         onClose={() => setShowNewMessageModal(false)}
         onConversationCreated={handleNewConversationCreated}
       />
     </>
   );
}
