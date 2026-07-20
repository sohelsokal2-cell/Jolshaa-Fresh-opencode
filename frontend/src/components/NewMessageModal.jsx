import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFriends } from '../lib/friendsApi';
import { findOrCreateDirectConversation, createGroupConversation } from '../lib/messagingApi';
import '../styles/NewMessageModal.css';

export default function NewMessageModal({ isOpen, onClose, onConversationCreated }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('direct'); // 'direct' or 'group'
  const [selectedFriends, setSelectedFriends] = useState([]); // for group mode
  const [groupName, setGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load friends on mount or when modal opens
  useEffect(() => {
    if (!isOpen || !user) return;

    const loadFriends = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchFriends(user.id);
        setFriends(data);
      } catch (err) {
        setError(err.message || 'Failed to load friends');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [isOpen, user]);

  // Handle direct message selection
  const handleSelectFriend = async (friendId) => {
    if (mode === 'direct') {
      setSubmitting(true);
      try {
        const convId = await findOrCreateDirectConversation(user.id, friendId);
        onConversationCreated(convId);
        handleClose();
      } catch (err) {
        setError(err.message || 'Failed to create conversation');
        setSubmitting(false);
      }
    }
  };

  // Handle group member selection
  const handleToggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('গ্রুপের নাম দিন');
      return;
    }
    if (selectedFriends.length < 2) {
      setError('অন্তত ২ জন বন্ধু নির্বাচন করুন');
      return;
    }

    setSubmitting(true);
    try {
      const convId = await createGroupConversation(
        user.id,
        [user.id, ...selectedFriends],
        groupName
      );
      onConversationCreated(convId);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setMode('direct');
    setSelectedFriends([]);
    setGroupName('');
    setSearchQuery('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // Filter friends by search query
  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="nmm-overlay" onClick={handleClose}>
      <div className="nmm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="nmm-header">
          <h2>নতুন বার্তা</h2>
          <button className="nmm-close" onClick={handleClose}>✕</button>
        </div>

        {/* Mode Toggle */}
        <div className="nmm-mode-toggle">
          <button
            className={`nmm-mode-btn ${mode === 'direct' ? 'active' : ''}`}
            onClick={() => {
              setMode('direct');
              setSelectedFriends([]);
              setGroupName('');
              setError('');
            }}
          >
            সরাসরি বার্তা
          </button>
          <button
            className={`nmm-mode-btn ${mode === 'group' ? 'active' : ''}`}
            onClick={() => {
              setMode('group');
              setSearchQuery('');
              setError('');
            }}
          >
            গ্রুপ তৈরি করুন
          </button>
        </div>

        {/* Search Box */}
        <div className="nmm-search">
          <input
            type="text"
            placeholder="বন্ধু খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Error Message */}
        {error && <div className="nmm-error">{error}</div>}

        {/* Friends List */}
        <div className="nmm-friends-list">
          {loading ? (
            <p className="nmm-loading">লোড হচ্ছে...</p>
          ) : filteredFriends.length === 0 ? (
            <p className="nmm-empty">কোন বন্ধু পাওয়া যায়নি</p>
          ) : (
            filteredFriends.map(friend => (
              <div
                key={friend.id}
                className={`nmm-friend-item ${
                  mode === 'group' && selectedFriends.includes(friend.id) ? 'selected' : ''
                }`}
                onClick={() => {
                  if (mode === 'direct') {
                    handleSelectFriend(friend.id);
                  } else {
                    handleToggleFriend(friend.id);
                  }
                }}
              >
                <div className="nmm-friend-av">
                  {friend.avatarUrl ? (
                    <img src={friend.avatarUrl} alt={friend.name} />
                  ) : (
                    <div className="nmm-friend-av-placeholder">
                      {friend.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="nmm-friend-info">
                  <span className="nmm-friend-name">{friend.name}</span>
                </div>
                {mode === 'group' && (
                  <div className="nmm-checkbox">
                    {selectedFriends.includes(friend.id) && '✓'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Group Creation Section (only in group mode) */}
        {mode === 'group' && (
          <div className="nmm-group-section">
            <input
              type="text"
              placeholder="গ্রুপের নাম"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="nmm-group-name-input"
            />
            <div className="nmm-selected-count">
              {selectedFriends.length} জন নির্বাচিত
            </div>
            <button
              className="nmm-create-group-btn"
              onClick={handleCreateGroup}
              disabled={submitting || selectedFriends.length < 2 || !groupName.trim()}
            >
              {submitting ? 'তৈরি হচ্ছে...' : 'গ্রুপ তৈরি করুন'}
            </button>
          </div>
        )}

        {/* Direct message loading state */}
        {mode === 'direct' && submitting && (
          <div className="nmm-loading-overlay">
            বার্তা চ্যানেল খুলছে...
          </div>
        )}
      </div>
    </div>
  );
}
