import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import PersonalDetailsCard from '../components/PersonalDetailsCard';
import HighlightsCard from '../components/HighlightsCard';
import FriendsPreviewCard from '../components/FriendsPreviewCard';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import PostFilterRow from '../components/PostFilterRow';
import ProfilePostCard from '../components/ProfilePostCard';
import AboutPreviewPanel from '../components/AboutPreviewPanel';
import ReelsPreviewPanel from '../components/ReelsPreviewPanel';
import FriendsPreviewPanel from '../components/FriendsPreviewPanel';
import './Profile.css';

const DEFAULT_POSTS = [
  {
    id: 1,
    isPinned: true,
    authorName: 'Md Sohel',
    authorAvatarChar: 'স',
    timeString: 'March 15, 2025',
    privacy: 'Public',
    textBn: 'আমার জলশা যাত্রা শুরু হলো! 🎉 এই প্ল্যাটফর্মে সবাইকে স্বাগতম। বাংলাদেশের মানুষদের জন্য, বাংলাদেশের মানুষদের হাতে তৈরি।',
    captionIcon: '🎊',
    reactionsCount: '৩৪৬',
    commentsCount: '৪৮',
    sharesCount: '২১',
    reactionsList: ['❤️', '😊', '👏'],
    initiallyLiked: true,
  },
  {
    id: 2,
    isPinned: false,
    authorName: 'Md Sohel',
    authorAvatarChar: 'স',
    timeString: '2 hours ago · ২ ঘণ্টা আগে',
    privacy: 'Friends',
    textBn: 'আজ মাগুরার নদীর ধারে সন্ধ্যাকাল কাটালাম। 🌅 এই সৌন্দর্য ভাষায় প্রকাশ করা কঠিন। আমার শহর, আমার গর্ব।',
    hasImage: true,
    mediaSrc: 'cover', // special key to render cover photo
    mediaAlt: 'নদীর সন্ধ্যাকাল — Riverbank at dusk',
    reactionsCount: '৮৭',
    commentsCount: '১২',
    sharesCount: '৫',
    reactionsList: ['❤️', '😍'],
    initiallyLiked: false,
  },
  {
    id: 3,
    isPinned: false,
    authorName: 'Md Sohel',
    authorAvatarChar: 'স',
    timeString: 'Yesterday · গতকাল',
    privacy: 'Public',
    textBn: 'মাগুরা বাজারে গেলাম আজ। ভিডিওতে দেখুন কত রকম শাকসবজি! 🥬🥕 আমাদের কৃষকদের পরিশ্রম সত্যিই অসাধারণ।',
    isVideo: true,
    viewsCount: '২,৪৩১',
    videoDuration: '2:14',
    reactionsCount: '১৫৩',
    commentsCount: '৩২',
    sharesCount: '১৮',
    reactionsList: ['👏', '❤️'],
    initiallyLiked: false,
  },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'about' | 'reels' | 'photos' | 'friends'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Reusing existing Navbar, passing proper notification badges */}
      <Navbar messageCount={5} notificationCount={7} showReels={true} showProfile={true} />

      <div className="profile-page-body">
        {/* Profile Header Block */}
        <ProfileHeader />

        {/* Tabs Block */}
        <ProfileTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Main Content Layout */}
        <div className="profile-content">
          
          {/* Left Column (Sticky Sidebar) */}
          <aside className="profile-left" aria-label="Profile sidebar">
            <PersonalDetailsCard />
            <HighlightsCard />
            <FriendsPreviewCard />
          </aside>

          {/* Right Column (Dynamic Views based on Tabs) */}
          <main className="profile-right">
            {activeTab === 'all' && (
              <>
                <div className="profile-feed-col">
                  {/* Profile Completion Tracker */}
                  <ProfileCompletionCard />

                  {/* Post filtering row */}
                  <PostFilterRow onViewChange={handleViewChange} />

                  {/* Compact post creation input box */}
                  <div className="create-post-compact" aria-label="Create new post">
                    <div className="create-compact-row">
                      <div className="create-compact-av">স</div>
                      <input
                        className="create-compact-input"
                        type="text"
                        placeholder="কী মনে হচ্ছে, Sohel? / What's on your mind?"
                        aria-label="Create post input"
                      />
                    </div>
                    <div className="create-compact-actions">
                      <button className="create-action-btn" aria-label="ছবি/ভিডিও / Photo or Video">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>ছবি / ভিডিও</span>
                      </button>
                      <button className="create-action-btn" aria-label="রিলস / Reel">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"/><rect x="19" y="3" width="2" height="18" rx="1"/>
                        </svg>
                        <span>রিলস</span>
                      </button>
                      <button className="create-action-btn" aria-label="অনুভূতি / Feeling">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                        <span>অনুভূতি</span>
                      </button>
                      <button className="create-action-btn" style={{ flex: 0, padding: '8px 12px', background: 'linear-gradient(135deg,var(--teal),var(--teal-light))', borderRadius: '9px', color: 'white', fontWeight: 700 }} aria-label="পোস্ট করুন / Post">
                        <span style={{ fontFamily: 'var(--font-bn)' }}>পোস্ট</span>
                      </button>
                    </div>
                  </div>

                  {/* Feed post items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {DEFAULT_POSTS.map(post => (
                      <ProfilePostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>

                {/* Right side support columns */}
                <div className="profile-support-col">
                  <AboutPreviewPanel />
                  <ReelsPreviewPanel />
                  <FriendsPreviewPanel />
                </div>
              </>
            )}

            {/* Tab specific detail showcases for better premium UX */}
            {activeTab === 'about' && (
              <div className="profile-feed-col" style={{ maxWidth: '600px' }}>
                <AboutPreviewPanel />
              </div>
            )}

            {activeTab === 'reels' && (
              <div className="profile-feed-col" style={{ maxWidth: '600px' }}>
                <ReelsPreviewPanel />
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="profile-card" style={{ width: '100%', padding: '20px' }}>
                <div className="card-header" style={{ padding: '0 0 10px' }}>
                  <div className="card-title">
                    <span className="card-title-bn">আমার ছবিসমূহ</span>
                    <span className="card-title-en">My Photos</span>
                  </div>
                </div>
                <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div className="media-thumb" style={{ aspectRatio: '1', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🌅</div>
                  <div className="media-thumb" style={{ aspectRatio: '1', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🍛</div>
                  <div className="media-thumb" style={{ aspectRatio: '1', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🌿</div>
                </div>
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="profile-feed-col" style={{ maxWidth: '600px' }}>
                <FriendsPreviewPanel />
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
