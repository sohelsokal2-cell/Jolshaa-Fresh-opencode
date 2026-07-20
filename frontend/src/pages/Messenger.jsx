import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import InfoPanel from '../components/InfoPanel';
import { fetchConversations, subscribeToConversationsList } from '../lib/messagingApi';
import { useChatPresence } from '../hooks/useOnlinePresence';
import './Messenger.css';

export default function Messenger() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalUnread, setTotalUnread] = useState(0);
  const [typingConversations, setTypingConversations] = useState({});

  // Presence — single channel per conversation: listens AND broadcasts current user's presence
  const isGroup = !!activeConversation?.isGroup;
  const otherUser = activeConversation?.otherParticipants?.[0];
  const participantIds = useMemo(
    () => (activeConversation?.otherParticipants || []).map(p => p.id),
    [activeConversation]
  );
  const { presenceUsers, getPresenceText } = useChatPresence(
    activeConversation?.id,
    user?.id,
    participantIds
  );
  const presenceText = !isGroup && otherUser ? getPresenceText(otherUser.id) : null;

  // Load conversations to find active one from URL
  useEffect(() => {
    if (!user || !conversationId) {
      setActiveConversation(null);
      return;
    }

    let cancelled = false;

    async function findConversation() {
      try {
        const convs = await fetchConversations(user.id);
        const found = convs.find(c => c.id === conversationId);
        if (!cancelled && found) {
          setActiveConversation(found);
        }
      } catch (err) {
        console.error('Failed to find conversation:', err);
      }
    }

    findConversation();
    return () => { cancelled = true; };
  }, [user, conversationId]);

  // Subscribe to conversations list for real-time updates
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const cleanup = subscribeToConversationsList(user.id, () => {
      if (!cancelled) {
        setRefreshTrigger(prev => prev + 1);
      }
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [user]);

  // Calculate total unread from conversation list
  const handleConversationsLoaded = useCallback((convs) => {
    const total = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    setTotalUnread(total);
  }, []);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    navigate(`/messages/${conv.id}`);
    // Auto-show info panel for group conversations, hide for direct
    setShowInfo(!!conv.isGroup);
    // Trigger refresh to update unread counts
    setRefreshTrigger(prev => prev + 1);
  };

  // Lock scroll on this page
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div style={{ position: 'relative', background: 'var(--off-white)', height: '100vh', overflow: 'hidden' }}>
      <Navbar messageCount={totalUnread} notificationCount={0} />

      <div className="messenger-body">
        <ConversationList
          activeId={activeConversation?.id}
          onSelectConversation={handleSelectConversation}
          refreshTrigger={refreshTrigger}
          typingConversations={typingConversations}
        />

        <ChatWindow
          activeConversation={activeConversation}
          presenceText={presenceText}
          presenceUsers={presenceUsers}
          onToggleInfo={() => setShowInfo(prev => !prev)}
          onTypingChange={(convId, typingUser) => {
            setTypingConversations(prev => {
              if (typingUser) {
                return { ...prev, [convId]: typingUser };
              } else {
                const next = { ...prev };
                delete next[convId];
                return next;
              }
            });
          }}
        />

        {showInfo && (
          <InfoPanel
            activeConversation={activeConversation}
            presenceText={presenceText}
            onConversationDeleted={() => {
              setActiveConversation(null);
              setShowInfo(false);
              navigate('/messages');
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
      </div>
    </div>
  );
}
