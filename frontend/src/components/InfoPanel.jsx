import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchSharedMedia,
  fetchPinnedMessages,
  fetchConversationDetails,
  muteConversation,
  blockUser,
  unblockUser,
  checkBlocked,
  leaveConversation,
} from '../lib/messagingApi';
import { fetchFriends } from '../lib/friendsApi';

const AVATAR_CLASSES = ['av-1', 'av-2', 'av-3', 'av-4', 'av-5', 'av-6', 'av-7'];

function getAvatarClass(index) {
  return AVATAR_CLASSES[index % AVATAR_CLASSES.length];
}

export default function InfoPanel({ activeConversation, onConversationDeleted, presenceText }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('media');
  const [sharedMedia, setSharedMedia] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const isGroup = !!activeConversation?.isGroup;
  const otherUser = activeConversation?.otherParticipants?.[0];

  // Load shared media and pinned messages when conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [media, pinned] = await Promise.all([
          fetchSharedMedia(activeConversation.id, 9),
          fetchPinnedMessages(activeConversation.id),
        ]);
        if (!cancelled) {
          setSharedMedia(media);
          setPinnedMessages(pinned);
        }
      } catch (err) {
        console.error('Failed to load info panel data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [activeConversation]);

  // Load initial mute state + group members / mutual friends
  useEffect(() => {
    if (!activeConversation) return;
    setIsMuted(!!activeConversation.isMuted);

    let cancelled = false;

    async function loadExtras() {
      try {
        if (isGroup) {
          const details = await fetchConversationDetails(activeConversation.id);
          if (!cancelled) setMembers(details.participants || []);
        } else if (user) {
          const friends = await fetchFriends(user.id);
          const otherId = otherUser?.id;
          if (otherId) {
            // Mutual friends = friends of current user who are also friends of the other user
            const otherFriends = await fetchFriends(otherId);
            const otherFriendIds = new Set(otherFriends.map(f => f.id));
            const mutual = friends.filter(f => otherFriendIds.has(f.id) && f.id !== user.id);
            if (!cancelled) setMutualFriends(mutual);
          }
        }
      } catch (err) {
        console.error('Failed to load info panel extras:', err);
      }
    }

    loadExtras();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation, isGroup, user]);

  // Check if current user has blocked the other participant
  useEffect(() => {
    if (!activeConversation || !user || isGroup) return;

    const otherUserId = otherUser?.id;
    if (!otherUserId) return;

    checkBlocked(user.id, otherUserId)
      .then(blocked => setIsBlocked(blocked))
      .catch(err => console.error('Failed to check block status:', err));
  }, [activeConversation, user, isGroup, otherUser]);

  if (!activeConversation) {
    return (
      <aside className="info-panel" aria-label="Chat information panel">
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)' }}>
          একটি কথোপকথন বেছে নিন
        </div>
      </aside>
    );
  }

  const name = isGroup ? activeConversation.groupName : otherUser?.name;
  const avatarChar = name?.charAt(0) || 'খ';
  const avatarClass = activeConversation.avatarClass || 'av-1';
  const memberCount = isGroup ? (members.length || (activeConversation.otherParticipants?.length || 0) + 1) : 1;

  const handleToggleMute = async () => {
    try {
      await muteConversation(activeConversation.id, user.id, !isMuted);
      setIsMuted(prev => !prev);
    } catch (err) {
      console.error('Failed to toggle mute:', err);
    }
  };

  const handleToggleBlock = async () => {
    if (!otherUser) return;
    try {
      if (isBlocked) {
        await unblockUser(user.id, otherUser.id);
        setIsBlocked(false);
      } else {
        await blockUser(user.id, otherUser.id);
        setIsBlocked(true);
      }
    } catch (err) {
      console.error('Failed to toggle block:', err);
    }
  };

  const handleViewProfile = () => {
    if (otherUser?.id) {
      navigate(`/profile/${otherUser.id}`);
    }
  };

  const handleDeleteConversation = async () => {
    const confirmed = window.confirm(
      isGroup
        ? 'এই গ্রুপ কথোপকথন মুছে ফেলবেন?'
        : 'এই কথোপকথন মুছে ফেলবেন?'
    );
    if (!confirmed) return;

    try {
      await leaveConversation(activeConversation.id, user.id);
      if (onConversationDeleted) {
        onConversationDeleted();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <aside className="info-panel" id="infoPanel" aria-label="Chat information panel">
      {/* Group chat state label */}
      {isGroup && (
        <div className="info-label-bar">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5">
            <circle cx="9" cy="7" r="3" />
            <path d="M3 21c0-3 2.7-5 6-5" />
            <circle cx="17" cy="7" r="2" />
            <path d="M14 21c0-2.5 1.8-4 4-4" />
          </svg>
          <span className="info-label-text">গ্রুপ চ্যাট ভ্যারিয়েন্ট · Group Chat State</span>
        </div>
      )}

      {/* Profile */}
      <div className="info-profile">
        <div style={{ position: 'relative' }}>
          <div className={`info-av ${avatarClass}`}>{avatarChar}</div>
          {!isGroup && presenceText?.text === 'অনলাইন' && (
            <span className="online-dot green" style={{ bottom: '6px', right: '2px' }}></span>
          )}
        </div>
        <div className="info-name">{name}</div>
        <div className="info-mutual">
          {isGroup
            ? `${memberCount} জন সদস্য · ${memberCount} members`
            : presenceText
              ? presenceText.bn
              : 'প্রত্যক্ষ বার্তা · Direct message'}
        </div>
      </div>

      {/* Group member list */}
      {isGroup && members.length > 0 && (
        <div className="info-section">
          <div className="info-section-label">সদস্যরা · Members</div>
          {members.map((m, idx) => (
            <div key={m.user_id} className="gdp-member">
              <div className={`gdp-member-av ${getAvatarClass(idx)}`}>
                {m.user?.name?.charAt(0) || '?'}
              </div>
              <div className="gdp-member-name">{m.user?.name || 'অজানা'}</div>
              {m.is_admin && <span className="gdp-admin-badge">অ্যাডমিন</span>}
            </div>
          ))}
        </div>
      )}

      {/* Mutual friends (direct conversations only) */}
      {!isGroup && mutualFriends.length > 0 && (
        <div className="info-section">
          <div className="info-section-label">
            {mutualFriends.length} জন কমন বন্ধু · {mutualFriends.length} mutual friends
          </div>
          {mutualFriends.slice(0, 5).map((f, idx) => (
            <div key={f.id} className="gdp-member">
              <div className={`gdp-member-av ${getAvatarClass(idx)}`}>
                {f.name?.charAt(0) || '?'}
              </div>
              <div className="gdp-member-name">{f.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="info-tabs">
        <button
          className={`info-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
          aria-pressed={activeTab === 'media'}
        >
          <span className="info-tab-bn">মিডিয়া</span>
          <span className="info-tab-en">Media</span>
        </button>
        <button
          className={`info-tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
          aria-pressed={activeTab === 'files'}
        >
          <span className="info-tab-bn">ফাইল</span>
          <span className="info-tab-en">Files</span>
        </button>
        <button
          className={`info-tab ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
          aria-pressed={activeTab === 'links'}
        >
          <span className="info-tab-bn">লিংক</span>
          <span className="info-tab-en">Links</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'media' && (
        <div className="info-section">
          <div className="info-section-label">শেয়ার করা মিডিয়া · Shared Media</div>
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
              লোড হচ্ছে...
            </div>
          ) : sharedMedia.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
              কোনো মিডিয়া শেয়ার করা হয়নি
            </div>
          ) : (
            <div className="media-grid">
              {sharedMedia.map((msg, idx) => (
                <div key={msg.id} className="media-thumb" title={msg.content || 'Image'}>
                  <img
                    src={msg.image_url}
                    alt={`Shared media ${idx + 1}`}
                    className="media-thumb-inner"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="info-section" style={{ padding: '16px 14px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          কোনো ফাইল শেয়ার করা হয়নি
        </div>
      )}

      {activeTab === 'links' && (
        <div className="info-section" style={{ padding: '16px 14px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          কোনো লিংক শেয়ার করা হয়নি
        </div>
      )}

      {/* Pinned messages */}
      <div className="info-section">
        <div className="info-section-label">📌 পিন করা বার্তা · Pinned Messages</div>
        {pinnedMessages.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
            কোনো পিন করা বার্তা নেই
          </div>
        ) : (
          pinnedMessages.map(pm => (
            <div key={pm.id} className="pinned-msg-item">
              <span className="pinned-msg-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div>
                <div className="pinned-msg-text">{pm.message?.content || '📎 মিডিয়া'}</div>
                <div className="pinned-msg-time">
                  {pm.message?.created_at && (
                    <>
                      {new Date(pm.message.created_at).toLocaleDateString('bn-BD', {
                        month: 'short',
                        day: 'numeric'
                      })} · {new Date(pm.message.created_at).toLocaleTimeString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div
        className="info-action"
        role="button"
        tabIndex="0"
        aria-label="নোটিফিকেশন নিঃশব্দ — Mute notifications"
        onClick={handleToggleMute}
      >
        <div className="info-action-left">
          <div className="info-action-icon ia-teal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
              <path d="M17 16.95A7 7 0 015 12v-2m14 0v2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <div>
            <div className="info-action-bn">নোটিফিকেশন নিঃশব্দ</div>
            <div className="info-action-en">Mute Notifications</div>
          </div>
        </div>
        <button
          className={`toggle-switch ${isMuted ? 'on' : ''}`}
          id="muteToggle"
          aria-label="Mute toggle"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleMute();
          }}
        />
      </div>

      {!isGroup && (
        <div className="info-action" role="button" tabIndex="0" aria-label="প্রোফাইল দেখুন — View Profile" onClick={handleViewProfile}>
          <div className="info-action-left">
            <div className="info-action-icon ia-grey">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="info-action-bn">প্রোফাইল দেখুন</div>
              <div className="info-action-en">View Profile</div>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-xlight)" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}

      {!isGroup && (
        <div
          className="info-action danger"
          role="button"
          tabIndex="0"
          aria-label={isBlocked ? "আনব্লক করুন — Unblock" : "ব্লক করুন — Block"}
          onClick={handleToggleBlock}
        >
          <div className="info-action-left">
            <div className="info-action-icon ia-red">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <div>
              <div className="info-action-bn" style={{ color: 'var(--coral-dark)' }}>
                {isBlocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
              </div>
              <div className="info-action-en">{isBlocked ? 'Unblock' : 'Block'}</div>
            </div>
          </div>
        </div>
      )}

      <div
        className="info-action danger"
        role="button"
        tabIndex="0"
        aria-label="কথোপকথন মুছুন — Delete conversation"
        onClick={handleDeleteConversation}
      >
        <div className="info-action-left">
          <div className="info-action-icon ia-red">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>
          <div>
            <div className="info-action-bn" style={{ color: 'var(--coral-dark)' }}>কথোপকথন মুছুন</div>
            <div className="info-action-en">Delete Conversation</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
