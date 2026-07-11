import React from 'react';
import Navbar from '../components/Navbar';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import StoriesBar from '../components/StoriesBar';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/PostCard';
import './NewsFeed.css';

// Import images to ensure Vite bundles them
import postCommunityImg from '../assets/post_community_1783606546707.png';
import postFactcheckImg from '../assets/post_factcheck_1783606561350.png';

const DUMMY_POSTS = [
  {
    id: 1,
    authorName: 'রহিম আহমেদ',
    avatarClass: 'post-avatar-1',
    timeString: '৩ ঘণ্টা আগে · 3h ago',
    privacy: 'Public',
    textBn: 'আজকের ইফতার পার্টিতে পুরো মহল্লা একসাথে! 🍛❤️ এই মুহূর্তগুলোই জীবনকে সুন্দর করে।',
    textEn: 'The whole neighborhood came together for iftar today! These moments make life beautiful.',
    mediaSrc: postCommunityImg,
    mediaAlt: 'Community gathering — সামাজিক অনুষ্ঠান',
    mediaPlaceholderClass: 'img-placeholder-1',
    mediaPlaceholderIcon: '🍛',
    reactionsList: ['❤️', '😊', '🔥'],
    reactionsCount: '১৮৪ জন · 184',
    commentsCount: '৩৭ মন্তব্য · 37 comments',
    initiallyReacted: false,
  },
  {
    id: 2,
    authorName: 'প্রিয়া রানী দাস',
    avatarClass: 'post-avatar-2',
    timeString: '৫ ঘণ্টা আগে · 5h ago',
    privacy: 'Public',
    factCheckStatus: 'amber',
    factCheckInfoText: 'এই পোস্টের তথ্য এখনো যাচাই করা হয়নি। জলশা কমিউনিটি এটি নিয়ে কাজ করছে।',
    factCheckInfoTextEn: 'This post\'s claim is under community fact-check review. Jolshaa community reviewers are verifying it.',
    factCheckVoters: '🔍 ৪৭ জন যাচাইকারী কাজ করছেন · 47 community reviewers checking',
    textBn: 'শুনলাম আমাদের মহল্লার পুরানো পুকুরটা নাকি ভরাট হয়ে যাচ্ছে? কেউ জানেন এটা সত্যি কিনা?',
    textEn: 'Heard the old pond in our neighbourhood is being filled in. Does anyone know if this is true?',
    mediaSrc: postFactcheckImg,
    mediaAlt: 'Neighbourhood street — মহল্লার রাস্তা',
    mediaPlaceholderClass: 'img-placeholder-2',
    mediaPlaceholderIcon: '🏘️',
    reactionsList: ['😮', '😟'],
    reactionsCount: '৯২ জন · 92',
    commentsCount: '৬৮ মন্তব্য · 68 comments',
    initiallyReacted: false,
  },
  {
    id: 3,
    authorName: 'করিম উদ্দিন',
    avatarClass: 'post-avatar-3',
    timeString: '৮ ঘণ্টা আগে · 8h ago',
    privacy: 'Public',
    postType: 'quote',
    textBn: 'আপন মানুষের হাসি দেখার জন্য হাজার মাইল পার করা যায়।',
    textEn: 'You can cross a thousand miles just to see the smile of someone you love.',
    reactionsList: ['❤️', '😊'],
    reactionsCount: '৪৪৭ জন · 447',
    commentsCount: '১০৩ মন্তব্য · 103 comments',
    initiallyReacted: true,
  },
];

export default function NewsFeed() {
  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar messageCount={5} notificationCount={7} />

      {/* Main Layout Area */}
      <div className="page-body">
        {/* Left Sidebar */}
        <SidebarLeft userName="আমিনুল হক" />

        {/* Center News Feed Content */}
        <main className="feed-center" aria-label="News Feed">
          <div className="feed-inner">
            {/* Stories */}
            <StoriesBar />

            {/* Create Post Field */}
            <CreatePostBox userName="আমিনুল" />

            {/* Dynamic posts rendering */}
            {DUMMY_POSTS.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>

        {/* Right Sidebar Widgets */}
        <SidebarRight />
      </div>
    </div>
  );
}
