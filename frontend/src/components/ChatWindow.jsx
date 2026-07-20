import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchMessages,
  sendMessage,
  uploadChatImage,
  uploadChatFile,
  uploadVoiceNote,
  markAsRead,
  subscribeToConversation,
  fetchMessageReactions,
  fetchPinnedMessages,
  subscribeToPinnedMessages,
  unpinMessage,
  subscribeToTyping,
  subscribeToReadStatus,
} from '../lib/messagingApi';
import { initiateCall, subscribeToCallStatus, subscribeToIncomingCalls, acceptCall, declineCall, endCall } from '../lib/callApi';
import { IncomingCallModal, ActiveCallScreen } from './calling';
import MessageBubble from './MessageBubble';
import ChatHeader from './ChatHeader';
import InputBar from './InputBar';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import '../styles/ChatWindowEnhancements.css';

const AVATAR_CLASSES = ['av-1', 'av-2', 'av-3', 'av-4', 'av-5', 'av-6', 'av-7'];

function getAvatarClass(index) {
  return AVATAR_CLASSES[index % AVATAR_CLASSES.length];
}

function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return 'গতকাল ' + date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }) +
    ' ' + date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) return { bn: 'আজকে', en: 'Today' };

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return { bn: 'গতকাল', en: 'Yesterday' };
  }

  return {
    bn: date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
    en: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
}

export default function ChatWindow({ activeConversation, onToggleInfo, onTypingChange, presenceText, presenceUsers = {} }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedBar, setShowPinnedBar] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const [otherLastReadAt, setOtherLastReadAt] = useState(null);
  const [locationSending, setLocationSending] = useState(false);

  const threadEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileDocInputRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const pinnedUnsubRef = useRef(null);
  const typingChannelRef = useRef(null);
  const readStatusUnsubRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const attachPopupRef = useRef(null);

  // Call state
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const callStatusUnsubRef = useRef(null);
  const incomingCallUnsubRef = useRef(null);

  // Voice recorder
  const recorder = useVoiceRecorder();

  const conversationId = activeConversation?.id;
  const isGroup = !!activeConversation?.isGroup;
  const other = activeConversation?.otherParticipants?.[0];
  const otherName = isGroup
    ? (activeConversation?.groupName || 'গ্রুপ')
    : (other?.name || 'অজানা ব্যবহারকারী');
  const avatarChar = otherName.charAt(0);
  const avatarClass = getAvatarClass(0);
  const memberCount = isGroup ? (activeConversation?.otherParticipants?.length || 0) + 1 : 2;
  const participantIds = useMemo(
    () => (activeConversation?.otherParticipants || []).map(p => p.id),
    [activeConversation]
  );

  // Presence handled in Messenger.jsx via useChatPresence — presenceText and presenceUsers received as props
  const activeCount = isGroup
    ? participantIds.filter(id => presenceUsers[id]?.isOnline).length + 1
    : 0;

  // Subscribe to incoming calls for this user
  useEffect(() => {
    if (!user) return;

    incomingCallUnsubRef.current = subscribeToIncomingCalls(user.id, (callSession) => {
      if (!activeCall) {
        setIncomingCall(callSession);
      }
    });

    return () => {
      if (incomingCallUnsubRef.current) {
        incomingCallUnsubRef.current();
        incomingCallUnsubRef.current = null;
      }
    };
  }, [user, activeCall]);

  // Cleanup call status subscription on unmount
  useEffect(() => {
    return () => {
      if (callStatusUnsubRef.current) {
        callStatusUnsubRef.current();
        callStatusUnsubRef.current = null;
      }
    };
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setLoading(true);
      try {
        const data = await fetchMessages(conversationId);
        if (!cancelled) {
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMessages();
    setReplyTo(null);

    return () => { cancelled = true; };
  }, [conversationId]);

  // Load pinned messages + subscribe to changes
  useEffect(() => {
    if (!conversationId) {
      setPinnedMessages([]);
      return;
    }

    let cancelled = false;

    async function loadPinned() {
      try {
        const data = await fetchPinnedMessages(conversationId);
        if (!cancelled) setPinnedMessages(data);
      } catch (err) {
        console.error('Failed to load pinned messages:', err);
      }
    }

    loadPinned();
    setShowPinnedBar(true);

    if (pinnedUnsubRef.current) pinnedUnsubRef.current();
    pinnedUnsubRef.current = subscribeToPinnedMessages(conversationId, () => {
      loadPinned();
    });

    return () => {
      cancelled = true;
      if (pinnedUnsubRef.current) {
        pinnedUnsubRef.current();
        pinnedUnsubRef.current = null;
      }
    };
  }, [conversationId]);

  // Subscribe to new messages + reaction changes via Realtime
  useEffect(() => {
    if (!conversationId || !user) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = subscribeToConversation(
      conversationId,
      (newMsg) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, { ...newMsg, reactions: newMsg.reactions || [] }];
        });
      },
      async (payload) => {
        const messageId = payload.new?.message_id || payload.old?.message_id;
        if (!messageId) return;
        try {
          const reactions = await fetchMessageReactions(messageId);
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
        } catch (err) {
          console.error('Failed to refresh reactions:', err);
        }
      }
    );

    markAsRead(conversationId, user.id).catch(console.error);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [conversationId, user]);

  // Subscribe to other participant's read status (for seen ticks)
  useEffect(() => {
    if (!conversationId || isGroup) {
      setOtherLastReadAt(null);
      return;
    }

    if (readStatusUnsubRef.current) readStatusUnsubRef.current();
    readStatusUnsubRef.current = subscribeToReadStatus(conversationId, (updated) => {
      if (updated.user_id !== user?.id) {
        setOtherLastReadAt(updated.last_read_at);
      }
    });

    return () => {
      if (readStatusUnsubRef.current) {
        readStatusUnsubRef.current();
        readStatusUnsubRef.current = null;
      }
    };
  }, [conversationId, isGroup, user]);

  // Typing indicator subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    if (typingChannelRef.current) typingChannelRef.current.unsubscribe();

    typingChannelRef.current = subscribeToTyping(conversationId, user.id, (payload) => {
      if (payload.isTyping) {
        setTypingUser(payload.userName || 'কেউ একজন');
        if (onTypingChange) onTypingChange(conversationId, payload.userName || 'কেউ একজন');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
          if (onTypingChange) onTypingChange(conversationId, null);
        }, 4000);
      } else {
        setTypingUser(null);
        if (onTypingChange) onTypingChange(conversationId, null);
      }
    });

    return () => {
      if (typingChannelRef.current) {
        typingChannelRef.current.unsubscribe();
        typingChannelRef.current = null;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close attach popup on outside click
  useEffect(() => {
    if (!attachOpen) return;

    function handleClickOutside(e) {
      if (attachPopupRef.current && !attachPopupRef.current.contains(e.target)) {
        setAttachOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [attachOpen]);

  // Mark as read when new messages arrive from other user
  useEffect(() => {
    if (!conversationId || !user || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender_id !== user.id) {
      markAsRead(conversationId, user.id).catch(console.error);
    }
  }, [messages, conversationId, user]);

  // Attach audioBlob -> send once recording finishes (unless cancelled)
  useEffect(() => {
    if (!recorder.audioBlob || !conversationId || !user) return;

    let cancelled = false;
    async function uploadAndSend() {
      setSending(true);
      try {
        const audioUrl = await uploadVoiceNote(recorder.audioBlob, user.id);
        if (cancelled) return;
        await sendMessage(conversationId, user.id, {
          messageType: 'voice',
          audioUrl,
          audioDurationSec: recorder.recordingTime,
          replyToId: replyTo?.id || null,
        });
        setReplyTo(null);
      } catch (err) {
        console.error('Failed to send voice note:', err);
      } finally {
        if (!cancelled) {
          setSending(false);
          recorder.clearAudioBlob();
        }
      }
    }

    uploadAndSend();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.audioBlob]);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    if (typingChannelRef.current && user) {
      typingChannelRef.current.broadcast(user.full_name || user.name || 'ব্যবহারকারী', true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        typingChannelRef.current?.broadcast(user.full_name || user.name || 'ব্যবহারকারী', false);
      }, 2000);
    }
  }, [user]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId || !user || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, user.id, {
        content: inputValue.trim(),
        replyToId: replyTo?.id || null,
      });
      setInputValue('');
      setReplyTo(null);
      typingChannelRef.current?.broadcast(user.full_name || user.name || 'ব্যবহারকারী', false);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId || !user) return;

    setSending(true);
    try {
      const imageUrl = await uploadChatImage(file, user.id);
      await sendMessage(conversationId, user.id, {
        imageUrl,
        replyToId: replyTo?.id || null,
      });
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setAttachOpen(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId || !user) return;

    setSending(true);
    try {
      const { publicUrl, fileName } = await uploadChatFile(file, user.id);
      await sendMessage(conversationId, user.id, {
        content: `📎 ${fileName}`,
        imageUrl: publicUrl,
        replyToId: replyTo?.id || null,
      });
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setSending(false);
      if (fileDocInputRef.current) fileDocInputRef.current.value = '';
      setAttachOpen(false);
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation || !conversationId || !user) return;
    setAttachOpen(false);
    setLocationSending(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await sendMessage(conversationId, user.id, {
            messageType: 'location',
            locationLat: position.coords.latitude,
            locationLng: position.coords.longitude,
            locationLabel: 'আমার বর্তমান অবস্থান',
            replyToId: replyTo?.id || null,
          });
          setReplyTo(null);
        } catch (err) {
          console.error('Failed to share location:', err);
        } finally {
          setLocationSending(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationSending(false);
      }
    );
  };

  const handleStartVoiceRecording = () => {
    setAttachOpen(false);
    recorder.startRecording();
  };

  const handleReactionAdded = useCallback(async (messageId) => {
    try {
      const reactions = await fetchMessageReactions(messageId);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    } catch (err) {
      console.error('Failed to refresh reactions:', err);
    }
  }, []);

  const handleUnpin = async (messageId) => {
    if (!conversationId) return;
    try {
      await unpinMessage(conversationId, messageId);
    } catch (err) {
      console.error('Failed to unpin message:', err);
    }
  };

  // ─── Call handlers ───

  const handleStartCall = useCallback(async (callType) => {
    if (!conversationId || !user || !other) return;

    try {
      const callSession = await initiateCall(
        conversationId,
        user.id,
        other.id,
        callType
      );
      setActiveCall(callSession);

      callStatusUnsubRef.current = subscribeToCallStatus(callSession.id, (updated) => {
        if (updated.status === 'accepted') {
          setActiveCall(prev => prev ? { ...prev, ...updated } : prev);
        } else if (updated.status === 'declined' || updated.status === 'ended') {
          setActiveCall(null);
        }
      });
    } catch (err) {
      console.error('Failed to initiate call:', err);
    }
  }, [conversationId, user, other]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      await acceptCall(incomingCall.id);
      setActiveCall(incomingCall);
      setIncomingCall(null);

      callStatusUnsubRef.current = subscribeToCallStatus(incomingCall.id, (updated) => {
        if (updated.status === 'ended') {
          setActiveCall(null);
        }
      });
    } catch (err) {
      console.error('Failed to accept call:', err);
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;

    try {
      await declineCall(incomingCall.id);
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to decline call:', err);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;

    try {
      await endCall(activeCall.id);
    } catch (err) {
      console.error('Failed to end call:', err);
    } finally {
      if (callStatusUnsubRef.current) {
        callStatusUnsubRef.current();
        callStatusUnsubRef.current = null;
      }
      setActiveCall(null);
    }
  };

  const handleStartVoiceCall = useCallback(() => handleStartCall('voice'), [handleStartCall]);
  const handleStartVideoCall = useCallback(() => handleStartCall('video'), [handleStartCall]);
  const handleAttachClick = useCallback(() => fileInputRef.current?.click(), []);

  const hasText = inputValue.trim().length > 0;
  const latestPinned = pinnedMessages[0];

  // Group messages by date for date dividers
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach(msg => {
    const msgDate = new Date(msg.created_at).toDateString();
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: 'date', date: msg.created_at, key: `date-${msgDate}` });
      lastDate = msgDate;
    }
    groupedMessages.push({ type: 'message', data: msg, key: msg.id });
  });

  if (!activeConversation) {
    return (
      <main className="chat-window" aria-label="Chat window">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', color: 'var(--text-light)', fontFamily: 'var(--font-bn)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>একটি কথোপকথন নির্বাচন করুন</div>
          <div style={{ fontSize: '13px', marginTop: '4px', fontFamily: 'var(--font-en)' }}>
            Select a conversation to start messaging
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-window" aria-label="Chat window">
      {/* Chat header */}
      <ChatHeader
        activeConversation={activeConversation}
        isGroup={isGroup}
        otherName={otherName}
        avatarChar={avatarChar}
        avatarClass={avatarClass}
        presenceText={presenceText}
        memberCount={memberCount}
        activeCount={activeCount}
        onVoiceCall={handleStartVoiceCall}
        onVideoCall={handleStartVideoCall}
        onToggleInfo={onToggleInfo}
      />

      {/* Pinned message bar */}
      {showPinnedBar && latestPinned && (
        <div className="pinned-bar" role="note" aria-label="Pinned message">
          <span className="pinned-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <div className="pinned-content">
            <div className="pinned-label">পিন করা বার্তা · Pinned</div>
            <div className="pinned-text">{latestPinned.message?.content || '📎 মিডিয়া'}</div>
          </div>
          <button
            className="pinned-close"
            aria-label="আনপিন করুন / Unpin"
            onClick={() => handleUnpin(latestPinned.message?.id)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat thread */}
      <div className="chat-thread" aria-label="Message thread">
        {loading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'var(--text-light)', fontFamily: 'var(--font-bn)'
          }}>
            বার্তা লোড হচ্ছে...
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'var(--text-light)', fontFamily: 'var(--font-bn)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👋</div>
            <div style={{ fontSize: '14px' }}>এখনো কোনো বার্তা নেই</div>
            <div style={{ fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-en)' }}>
              Start the conversation!
            </div>
          </div>
        ) : (
          groupedMessages.map((item) => {
            if (item.type === 'date') {
              const dateInfo = formatDateDivider(item.date);
              return (
                <div key={item.key} className="date-divider" role="separator">
                  <div className="date-divider-line"></div>
                  <div className="date-divider-text">
                    <span className="date-bn">{dateInfo.bn}</span>
                    <span className="date-en">· {dateInfo.en}</span>
                  </div>
                  <div className="date-divider-line"></div>
                </div>
              );
            }

            const msg = item.data;
            const isSent = msg.sender_id === user?.id;
            const senderName = msg.sender?.name || '';
            const senderAvatar = senderName.charAt(0);
            const isRead = isSent && !isGroup && otherLastReadAt
              ? new Date(msg.created_at) <= new Date(otherLastReadAt)
              : false;

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSent={isSent}
                senderName={senderName}
                senderAvatar={senderAvatar}
                avatarClass={avatarClass}
                formatMessageTime={formatMessageTime}
                userId={user?.id}
                onReactionAdded={handleReactionAdded}
                isGroup={isGroup}
                isRead={isRead}
                onReply={setReplyTo}
              />
            );
          })
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="msg-row received" role="status" style={{ marginTop: '6px' }}>
            <div className={`msg-av ${avatarClass}`}>{avatarChar}</div>
            <div>
              <div className="typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
              <div className="typing-label">টাইপ করছেন... · typing...</div>
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Reply preview bar */}
      {replyTo && (
        <div className="reply-preview-bar">
          <div className="reply-preview-content">
            <div className="reply-preview-sender">{replyTo.sender?.name || 'আপনি'}</div>
            <div className="reply-preview-text">
              {replyTo.content
                || (replyTo.image_url && !replyTo.audio_url ? '📷 ছবি'
                  : replyTo.audio_url ? '🎤 ভয়েস নোট'
                    : replyTo.location_lat ? '📍 অবস্থান'
                      : '📎 ফাইল')}
            </div>
          </div>
          <button className="reply-preview-close" onClick={() => setReplyTo(null)} aria-label="বাতিল করুন / Cancel reply">✕</button>
        </div>
      )}

      {/* Input bar */}
      <InputBar
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onInputKeyDown={handleKeyDown}
        sending={sending}
        hasText={hasText}
        attachOpen={attachOpen}
        onToggleAttach={() => setAttachOpen(prev => !prev)}
        onAttachClick={handleAttachClick}
        onFileDocClick={() => { setAttachOpen(false); fileDocInputRef.current?.click(); }}
        onEmojiClick={(emoji) => {
          setInputValue(prev => prev + (emoji || '😊'));
        }}
        recorder={recorder}
        onStartVoiceRecording={handleStartVoiceRecording}
        onStopRecording={recorder.stopRecording}
        onCancelRecording={recorder.cancelRecording}
        locationSending={locationSending}
        onShareLocation={handleShareLocation}
        onSend={handleSend}
        fileInputRef={fileInputRef}
        fileDocInputRef={fileDocInputRef}
        onImageUpload={handleImageUpload}
        onFileUpload={handleFileUpload}
        attachPopupRef={attachPopupRef}
      />

      {/* Incoming Call Modal */}
      <IncomingCallModal
        callSession={incomingCall}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />

      {/* Active Call Screen */}
      {activeCall && (
        <ActiveCallScreen
          callSession={activeCall}
          localUserId={user.id}
          onCallEnd={handleEndCall}
        />
      )}
    </main>
  );
}
