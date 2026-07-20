import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import PersonalDetailsCard from '../components/PersonalDetailsCard';
import FriendsPreviewCard from '../components/FriendsPreviewCard';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import ProfilePostCard from '../components/ProfilePostCard';
import AboutPreviewPanel from '../components/AboutPreviewPanel';
import FriendsPreviewPanel from '../components/FriendsPreviewPanel';
import EditProfileModal from '../components/EditProfileModal';
import PhotosTab from '../components/profile/PhotosTab';
import FriendsTab from '../components/profile/FriendsTab';
import AboutTab from '../components/profile/AboutTab';
import ReelsTab from '../components/profile/ReelsTab';
import CheckInsTab from '../components/profile/CheckInsTab';
import ManageSectionsModal from '../components/profile/ManageSectionsModal';
import { useAuth } from '../context/AuthContext';
import {
  fetchProfile,
  fetchFriendshipStatus,
  fetchFriendCount,
  fetchFriends,
  fetchProfilePosts,
  fetchProfilePhotos,
} from '../lib/profileApi';
import './Profile.css';

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showEditModal, setShowEditModal] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [showManageSections, setShowManageSections] = useState(false);

  const profileUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const loadProfile = useCallback(async () => {
    if (!profileUserId) return;
    setLoading(true);
    try {
      const [profile, count, frStatus] = await Promise.all([
        fetchProfile(profileUserId),
        fetchFriendCount(profileUserId),
        isOwnProfile ? Promise.resolve(null) : fetchFriendshipStatus(user?.id, profileUserId),
      ]);
      setProfileData(profile);
      setFriendCount(count);
      setFriendshipStatus(frStatus);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [profileUserId, isOwnProfile, user?.id]);

  const loadPosts = useCallback(async () => {
    if (!profileUserId) return;
    try {
      const data = await fetchProfilePosts(profileUserId);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  }, [profileUserId]);

  const loadPhotos = useCallback(async () => {
    if (!profileUserId) return;
    try {
      const data = await fetchProfilePhotos(profileUserId);
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  }, [profileUserId]);

  const loadFriends = useCallback(async () => {
    if (!profileUserId) return;
    try {
      const data = await fetchFriends(profileUserId, 9);
      setFriends(data);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  }, [profileUserId]);

  useEffect(() => {
    loadProfile();
    loadPosts();
    loadPhotos();
    loadFriends();
  }, [loadProfile, loadPosts, loadPhotos, loadFriends]);

  const handleViewChange = (mode) => setViewMode(mode);

  const handleProfileUpdated = () => {
    loadProfile();
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
        <Navbar messageCount={0} notificationCount={0} showReels={true} showProfile={true} />
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)', fontFamily: 'var(--font-bn)' }}>
          লোড হচ্ছে...
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
        <Navbar messageCount={0} notificationCount={0} showReels={true} showProfile={true} />
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)', fontFamily: 'var(--font-bn)' }}>
          প্রোফাইল পাওয়া যায়নি।
        </div>
      </div>
    );
  }

  const firstName = profileData.name?.split(' ')[0] || profileData.name || 'User';

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <Navbar messageCount={5} notificationCount={7} showReels={true} showProfile={true} />

      <div className="profile-page-body">
        <ProfileHeader
          profileData={profileData}
          isOwnProfile={isOwnProfile}
          friendshipStatus={friendshipStatus}
          friendCount={friendCount}
          onEditProfileClick={() => setShowEditModal(true)}
          onProfileUpdated={() => {
            loadProfile();
            loadFriends();
          }}
        />

        <ProfileTabs activeTab={activeTab} onChangeTab={setActiveTab} visibleSections={profileData.visible_sections || {}} onManageSections={() => setShowManageSections(true)} />

        <div className="profile-content">
          <aside className="profile-left" aria-label="Profile sidebar">
            <PersonalDetailsCard profileData={profileData} isOwnProfile={isOwnProfile} />
            <FriendsPreviewCard
              friends={friends}
              totalFriendsCount={friendCount}
              isOwnProfile={isOwnProfile}
            />
          </aside>

          <main className="profile-right">
            {activeTab === 'all' && (
              <>
                <div className="profile-feed-col">
                  {isOwnProfile && <ProfileCompletionCard profileData={profileData} />}

                  <div className="create-post-compact" aria-label="Create new post">
                    <div className="create-compact-row">
                      <div className="create-compact-av">
                        {profileData.name?.[0] || '?'}
                      </div>
                      <input
                        className="create-compact-input"
                        type="text"
                        placeholder={`কী মনে হচ্ছে, ${firstName}? / What's on your mind?`}
                        readOnly
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {posts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '14px' }}>
                        কোনো পোস্ট নেই।
                      </div>
                    ) : (
                      posts.map(post => (
                        <ProfilePostCard key={post.id} post={post} />
                      ))
                    )}
                  </div>
                </div>

                <div className="profile-support-col">
                  <AboutPreviewPanel profileData={profileData} isOwnProfile={isOwnProfile} />
                  <FriendsPreviewPanel
                    friends={friends}
                    totalCount={friendCount}
                    isOwnProfile={isOwnProfile}
                  />
                </div>
              </>
            )}

            {activeTab === 'about' && <AboutTab profileData={profileData} isOwnProfile={isOwnProfile} onUpdated={loadProfile} />}

            {activeTab === 'photos' && <PhotosTab userId={profileUserId} isOwnProfile={isOwnProfile} />}

            {activeTab === 'friends' && <FriendsTab friends={friends} isOwnProfile={isOwnProfile} />}
            {activeTab === 'reels' && <ReelsTab userId={profileUserId} isOwnProfile={isOwnProfile} />}
            {activeTab === 'checkins' && <CheckInsTab userId={profileUserId} isOwnProfile={isOwnProfile} />}
          </main>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          profileData={profileData}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleProfileUpdated}
        />
      )}
      {showManageSections && isOwnProfile && <ManageSectionsModal profileData={profileData} onClose={() => setShowManageSections(false)} onSaved={sections => { setProfileData(prev => ({ ...prev, visible_sections: sections })); if (activeTab !== 'all' && sections[activeTab] === false) setActiveTab('all'); }} />}
    </div>
  );
}
