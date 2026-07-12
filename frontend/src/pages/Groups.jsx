import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import GroupsSidebar from '../components/GroupsSidebar';
import GroupsFeedFilters from '../components/GroupsFeedFilters';
import GroupPostCard from '../components/GroupPostCard';
import PollBlock from '../components/PollBlock';
import './Groups.css';

const DEFAULT_POSTS = [
  {
    id: 1,
    postType: 'normal',
    groupName: 'বাংলাদেশ ট্রাভেল ক্লাব',
    groupIcon: '✈️',
    groupGradStyle: 'linear-gradient(135deg,#22d3ee,#0891b2)',
    memberCount: '২৫,৬৪০ সদস্য',
    privacy: 'Public',
    authorName: 'রাহেলা বেগম',
    authorAvatarClass: 'av-1',
    authorAvatarChar: 'র',
    time: '২০ মিনিট আগে · 20 minutes ago',
    text: 'সাজেক ভ্যালিতে মেঘের সাথে কাটানো কিছু সুন্দর মুহূর্ত! ☁️🌲 বাংলাদেশ সত্যিই রূপসী। যারা ট্রাভেলে যেতে চান গ্রুপে জানান।',
    isLargeText: false,
    hasMedia: true,
    mediaEmoji: '🏕️',
    mediaGradClass: 'media-grad-1',
    reactions: ['❤️', '😍', '👍'],
    reactionsCount: '৩৪৬ জন',
    commentCount: '৪৮টি মন্তব্য',
    shareCount: '১২টি শেয়ার',
    initiallyLiked: true
  },
  {
    id: 2,
    postType: 'poll',
    groupName: 'রান্নাঘর',
    groupIcon: '🍛',
    groupGradStyle: 'linear-gradient(135deg,#fde68a,#f59e0b)',
    memberCount: '১২,০৫৮ সদস্য',
    privacy: 'Private',
    authorName: 'তানভীর আহমেদ',
    authorAvatarClass: 'av-2',
    authorAvatarChar: 'ত',
    time: '৪৫ মিনিট আগে · 45 minutes ago',
    text: '', // Text is empty as it contains the poll question inside PollBlock
    isLargeText: false,
    hasMedia: false,
    reactions: ['😂', '❤️'],
    reactionsCount: '৯৬ জন',
    commentCount: '২৩টি মন্তব্য',
    shareCount: '',
    initiallyLiked: false,
    pollData: {
      questionBn: 'তোমার প্রিয় বাংলাদেশি খাবার কোনটি?',
      questionEn: "What's your favorite Bangladeshi dish?",
      options: [
        { id: 1, bn: 'বিরিয়ানি', en: 'Biryani', emoji: '🍚', percentage: 42, fillColor: '' },
        { id: 2, bn: 'ইলিশ মাছ', en: 'Hilsa Fish', emoji: '🐟', percentage: 28, fillColor: 'coral-fill' },
        { id: 3, bn: 'খিচুড়ি', en: 'Khichuri', emoji: '🍲', percentage: 18, fillColor: 'gold-fill' },
        { id: 4, bn: 'চাটপটি', en: 'Chatpati', emoji: '🥗', percentage: 12, fillColor: 'green-fill' }
      ],
      initialVoteCount: 125,
      timeLeft: '২ দিন বাকি · 2 days left'
    }
  },
  {
    id: 3,
    postType: 'normal',
    groupName: 'ঢাকা ফটোগ্রাফি',
    groupIcon: '📷',
    groupGradStyle: 'linear-gradient(135deg,#c4b5fd,#7c3aed)',
    memberCount: '৮,৯২০ সদস্য',
    privacy: 'Public',
    authorName: 'সামিয়া আক্তার',
    authorAvatarClass: 'av-3',
    authorAvatarChar: 'স',
    time: '২ ঘণ্টা আগে · 2 hours ago',
    text: 'ক্যামেরা কিনতে চাই নতুনদের জন্য। বাজেট ২৫-৩০ হাজার টাকা। কোন মডেল ভালো হবে এবং কোথায় পাওয়া যাবে? পরামর্শ দিলে খুবই ভালো হয়! 📸',
    isLargeText: true,
    hasMedia: false,
    reactions: ['👍', '😮'],
    reactionsCount: '১৫ জন',
    commentCount: '৬টি মন্তব্য',
    shareCount: '১টি শেয়ার',
    initiallyLiked: false
  }
];

export default function Groups() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Shared Navbar */}
      <Navbar messageCount={5} notificationCount={7} />

      {/* Mobile Menu Toggle Button (Floating overlay next to logo on mobile screens) */}
      <button
        className="mobile-menu-btn"
        style={{
          position: 'fixed',
          top: '11px',
          left: '110px',
          zIndex: 400
        }}
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label="Toggle groups sidebar"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Main Page Layout Wrapper */}
      <div className="groups-page-body">
        {/* Left Sidebar */}
        <GroupsSidebar isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(false)} />

        {/* Center Feed Area */}
        <main className="feed-center" aria-label="Groups feed — সাম্প্রতিক কার্যকলাপ">
          <div className="feed-inner">
            
            {/* Feed Section Title */}
            <div className="feed-section-header">
              <div className="feed-title-bn">সাম্প্রতিক কার্যকলাপ</div>
              <div className="feed-title-en">Recent Activity · তোমার গ্রুপগুলো থেকে</div>
            </div>

            {/* Filters */}
            <GroupsFeedFilters onChangeFilter={setActiveFilter} />

            {/* Posts Feed */}
            <div id="feedContent" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {DEFAULT_POSTS.map(post => (
                <GroupPostCard key={post.id} {...post}>
                  {post.postType === 'poll' && (
                    <PollBlock {...post.pollData} />
                  )}
                </GroupPostCard>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
