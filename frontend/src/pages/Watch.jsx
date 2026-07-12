import { useState } from 'react';
import Navbar from '../components/Navbar';
import WatchSidebar from '../components/WatchSidebar';
import MoodFilterStrip from '../components/MoodFilterStrip';
import FeaturedVideoCard from '../components/FeaturedVideoCard';
import VideoCard from '../components/VideoCard';
import SuggestedVideosSidebar from '../components/SuggestedVideosSidebar';
import './Watch.css';

const featuredVideo = {
  id: 'featured',
  title: 'বাংলাদেশের সেরা ১০ প্রাকৃতিক দর্শনীয় স্থান',
  creator: 'Travel BD',
  creatorAvatar: 'T',
  creatorColor: '#1B6B5A',
  views: '৫.২ লক্ষ ভিউ',
  time: '৩ দিন আগে',
  duration: '১৮:৩২',
  emoji: '🏔️',
  bgGradient: 'linear-gradient(140deg, #1a4a3a 0%, #0f2e24 40%, #1B6B5A 70%, #1a3a2a 100%)',
};

const videoCards = [
  {
    id: 1,
    title: 'ঢাকার সেরা ফুড স্ট্রিট — কাঁচা বাজার ভ্রমণ',
    creator: 'Foodie BD',
    creatorAvatar: 'F',
    creatorColor: '#D97706',
    views: '৩.৪ লক্ষ',
    time: '১ সপ্তাহ আগে',
    duration: '১৫:২০',
    emoji: '🍛',
    bgGradient: 'linear-gradient(140deg, #5a3a1a, #8a6a2d, #6a4a1a)',
    category: '🍳 রান্না',
    verified: true,
    live: false,
  },
  {
    id: 2,
    title: 'লাইভ স্ট্রিম: বাংলা গান শিল্পীদের সম্মেলন',
    creator: 'Music BD Live',
    creatorAvatar: 'M',
    creatorColor: '#7c3aed',
    views: '১২.৫ হাজার',
    time: 'এখনই',
    duration: null,
    emoji: '🎤',
    bgGradient: 'linear-gradient(140deg, #3d1a4a, #6b2d8a, #4a1a5e)',
    category: null,
    verified: true,
    live: true,
    viewers: '১২.৫K',
  },
  {
    id: 3,
    title: 'বাংলা সাহিত্যের ইতিহাস — মধ্যযুগ থেকে আধুনিক যুগ',
    creator: 'Literature BD',
    creatorAvatar: 'L',
    creatorColor: '#059669',
    views: '৮৫ হাজার',
    time: '২ সপ্তাহ আগে',
    duration: '২২:১৫',
    emoji: '📚',
    bgGradient: 'linear-gradient(140deg, #1a3a0f, #2d6a1e, #1a4a0a)',
    category: '🧠 শিক্ষা',
    verified: false,
    live: false,
  },
  {
    id: 4,
    title: 'ক্রিকেট হাইলাইটস: বাংলাদেশ vs শ্রীলঙ্কা — তৃতীয় টি-২০',
    creator: 'Sports BD',
    creatorAvatar: 'S',
    creatorColor: '#dc2626',
    views: '৩.১ লক্ষ',
    time: '৩ দিন আগে',
    duration: '১০:৩০',
    emoji: '🏏',
    bgGradient: 'linear-gradient(140deg, #1a1a3f, #2d2d6a, #1a1a4a)',
    category: '🏏 খেলা',
    verified: true,
    live: false,
  },
  {
    id: 5,
    title: 'কুয়াশার সকালে সুন্দরবন — প্রকৃতির অপূর্ব সৌন্দর্য',
    creator: 'Nature BD',
    creatorAvatar: 'N',
    creatorColor: '#0891b2',
    views: '১.৭ লক্ষ',
    time: '৫ দিন আগে',
    duration: '১৪:৪৫',
    emoji: '🌿',
    bgGradient: 'linear-gradient(140deg, #0a3a2a, #1a5a3a, #0a4a3a)',
    category: '✈️ ভ্রমণ',
    verified: false,
    live: false,
  },
  {
    id: 6,
    title: 'ঐতিহ্যবাহী বাংলাদেশি মিষ্টান্ন — ৫টি সহজ রেসিপি',
    creator: 'Cooking BD',
    creatorAvatar: 'C',
    creatorColor: '#ea580c',
    views: '২.৯ লক্ষ',
    time: '১ সপ্তাহ আগে',
    duration: '১২:১০',
    emoji: '🍮',
    bgGradient: 'linear-gradient(140deg, #4a2a0a, #8a5a1e, #5a3a0f)',
    category: '🍳 রান্না',
    verified: true,
    live: false,
  },
];

const Watch = () => {
  const [activeNav, setActiveNav] = useState('foryou');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeMood, setActiveMood] = useState('all');

  return (
    <div className="watch-page-body">
      <Navbar messageCount={5} notificationCount={7} />

      <WatchSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="main-content">
        <FeaturedVideoCard video={featuredVideo} />

        <div className="section-hdr">
          <div>
            <div className="sh-title-bn">জনপ্রিয় ভিডিও</div>
            <div className="sh-title-en">Popular Videos</div>
          </div>
          <button className="btn-see-all">
            সব দেখুন <span>→</span>
          </button>
        </div>

        <MoodFilterStrip activeMood={activeMood} onMoodChange={setActiveMood} />

        <div className="video-grid">
          {videoCards.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              wide={index === 0 || index === 4}
            />
          ))}
        </div>
      </main>

      <SuggestedVideosSidebar />
    </div>
  );
};

export default Watch;
