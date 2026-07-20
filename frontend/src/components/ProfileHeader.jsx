import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  uploadAvatar,
  uploadCoverPhoto,
  updateProfile,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} from '../lib/profileApi';

export default function ProfileHeader({
  profileData,
  isOwnProfile,
  friendshipStatus,
  friendCount,
  onEditProfileClick,
  onProfileUpdated,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const [coverUploading, setCoverUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const name = profileData?.name || 'Unknown';
  const initial = name[0] || '?';
  const bio = profileData?.bio || '';
  const location = profileData?.location || '';
  const coverUrl = profileData?.cover_photo_url || null;
  const avatarUrl = profileData?.profile_photo_url || null;

  const joinedDate = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })
    : '';

  const handleCoverUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setCoverUploading(true);
    try {
      const url = await uploadCoverPhoto(user.id, file);
      await updateProfile(user.id, { cover_photo_url: url });
      onProfileUpdated?.();
    } catch (err) {
      console.error('Cover upload failed:', err);
      showToast('কভার আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  }, [user, onProfileUpdated, showToast]);

  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { profile_photo_url: url });
      onProfileUpdated?.();
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showToast('প্রোফাইল ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }, [user, onProfileUpdated, showToast]);

  const handleFriendAction = useCallback(async () => {
    if (!user?.id || !profileData?.id || friendActionLoading) return;
    setFriendActionLoading(true);
    try {
      if (!friendshipStatus) {
        await sendFriendRequest(user.id, profileData.id);
        onProfileUpdated?.();
      } else if (friendshipStatus.status === 'pending' && friendshipStatus.addressee_id === user.id) {
        await acceptFriendRequest(friendshipStatus.id);
        onProfileUpdated?.();
      } else if (friendshipStatus.status === 'accepted') {
        const confirmed = window.confirm('বন্ধুত্ব বাতিল করতে চান? / Remove friend?');
        if (confirmed) {
          await removeFriend(friendshipStatus.id);
          onProfileUpdated?.();
        }
      } else if (friendshipStatus.status === 'pending' && friendshipStatus.requester_id === user.id) {
        await removeFriend(friendshipStatus.id);
        onProfileUpdated?.();
      }
    } catch (err) {
      console.error('Friend action failed:', err);
    } finally {
      setFriendActionLoading(false);
    }
  }, [user, profileData, friendActionLoading, friendshipStatus, onProfileUpdated]);

  const getFriendButtonLabel = () => {
    if (!friendshipStatus) return { bn: 'বন্ধু যোগ করো', en: 'Add Friend' };
    if (friendshipStatus.status === 'pending' && friendshipStatus.requester_id === user?.id) {
      return { bn: 'অনুরোধ পাঠানো হয়েছে', en: 'Request Sent' };
    }
    if (friendshipStatus.status === 'pending' && friendshipStatus.addressee_id === user?.id) {
      return { bn: 'বন্ধুত্ব গ্রহণ করো', en: 'Accept Request' };
    }
    if (friendshipStatus.status === 'accepted') return { bn: 'বন্ধু ✓', en: 'Friends ✓' };
    return { bn: 'বন্ধু যোগ করো', en: 'Add Friend' };
  };

  const friendBtn = getFriendButtonLabel();
  const isPendingSent = friendshipStatus?.status === 'pending' && friendshipStatus?.requester_id === user?.id;

  return (
    <div className="profile-header-wrap">
      {/* Cover Photo */}
      <div className="cover-photo-wrap" role="img" aria-label="Profile cover photo">
        {coverUrl ? (
          <img src={coverUrl} className="cover-photo-img" alt="Cover" onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="cover-photo-img" style={{ background: 'linear-gradient(135deg, #1B6B5A, #4ECDC4)' }} />
        )}
        <div className="cover-bottom-fade"></div>

        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverUpload}
            />
            <button
              className="edit-cover-btn"
              disabled={coverUploading}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverUploading ? (
                <span>আপলোড হচ্ছে...</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <div>
                    <div>কভার পরিবর্তন</div>
                    <span className="edit-cover-btn-en">Edit cover photo</span>
                  </div>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Profile Info Bar */}
      <div className="profile-info-bar">
        <div className="profile-av-row">
          {/* Avatar */}
          <div className="profile-av-wrap">
            <div
              className="profile-av"
              style={avatarUrl ? {
                backgroundImage: `url(${avatarUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'transparent',
              } : {}}
            >
              {avatarUrl ? '' : initial}
            </div>

            {isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
                <button
                  className="profile-av-edit"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Name + info + actions */}
          <div className="profile-name-actions">
            <div className="profile-name-group">
              <h1 className="profile-name">{name}</h1>

              {bio && <p className="profile-bio">{bio}</p>}

              <div className="stat-chips">
                <span className="stat-chip">
                  <span className="stat-chip-num">{friendCount}</span>
                  <span className="stat-chip-label-bn">বন্ধু</span>
                  <span className="stat-chip-label-en">Friends</span>
                </span>
              </div>

              <div className="profile-meta">
                {location && (
                  <div className="profile-meta-item">
                    <span className="meta-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <span className="meta-text-bn">থাকেন <strong style={{ color: 'var(--teal)' }}>{location}</strong>-তে</span>
                  </div>
                )}
                {joinedDate && (
                  <div className="profile-meta-item">
                    <span className="meta-icon" style={{ color: 'var(--gold)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <span className="meta-text-bn">যোগ দিয়েছেন {joinedDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="profile-actions">
              {isOwnProfile ? (
                <>
                  <button className="btn-primary" onClick={onEditProfileClick}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <div>
                      <div>সম্পাদনা</div>
                      <span className="btn-primary-en">Edit Profile</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`btn-primary ${isPendingSent ? 'btn-pending' : ''}`}
                    disabled={friendActionLoading || isPendingSent}
                    onClick={handleFriendAction}
                    style={friendshipStatus?.status === 'accepted' ? { background: 'var(--off-white)', color: 'var(--text)', border: '1px solid var(--border)' } : {}}
                  >
                    {friendActionLoading ? '...' : (
                      <>
                        <span>{friendBtn.bn}</span>
                        <span className="btn-primary-en" style={friendshipStatus?.status === 'accepted' ? { color: 'var(--text)' } : {}}>{friendBtn.en}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
