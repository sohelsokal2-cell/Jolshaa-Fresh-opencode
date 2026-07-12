import { useState } from 'react';
import Navbar from '../components/Navbar';
import EventsSidebar from '../components/EventsSidebar';
import EventCategoryPillRow from '../components/EventCategoryPillRow';
import EventCard from '../components/EventCard';
import EventDetailPanel from '../components/EventDetailPanel';
import './Events.css';

const eventsData = [
  {
    id: 1,
    title: 'ঢাকা লোকসংগীত উৎসব ২০২৫ — বাউল থেকে ব্যান্ড একই মঞ্চে',
    category: 'music',
    categoryEmoji: '🎵',
    categoryLabel: 'সংগীত / Music',
    emoji: '🎸',
    coverGradient: 'linear-gradient(140deg,#1a0f2e,#3b1a5e,#5c2d8a)',
    day: '১৫',
    monthShort: 'Aug',
    monthFull: 'August',
    dayOfWeek: 'শনিবার',
    whenBn: 'শনি, ১৫ আগস্ট · সন্ধ্যা ৬টা',
    whenEn: 'Sat, Aug 15, 2025 · 6:00 PM – 10:00 PM',
    whereBn: 'বাংলাদেশ শিল্পকলা একাডেমি, সেগুনবাগিচা, ঢাকা',
    whereEn: 'Shilpakala Academy · Segunbagicha, Dhaka',
    duration: 'রাত ১০টা',
    ticket: 'প্রবেশ মূল্য: ২০০ টাকা',
    ticketEn: 'Entry: ৳200 · Available online & at gate',
    goingText: '৯১ জন যাচ্ছে',
    goingEn: '91 going · 145 interested',
    avatars: [
      { letter: 'ন', bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
      { letter: 'আ', bg: 'linear-gradient(135deg,#1B6B5A,#4ECDC4)' },
      { letter: 'ম', bg: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
      { letter: 'র', bg: 'linear-gradient(135deg,#d97706,#fbbf24)' },
    ],
    extraCount: '৮৭',
    initialRsvp: 'going',
    host: {
      name: 'জলশা মিউজিক কমিউনিটি',
      role: 'আয়োজক / Host · Verified',
      avatar: 'জ',
      avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    },
    description: 'বাংলাদেশের লোকসংগীতের সমৃদ্ধ ঐতিহ্যকে উদযাপন করতে আমরা আয়োজন করছি ঢাকা লোকসংগীত উৎসব ২০২৫। এই উৎসবে একই মঞ্চে পাবেন বাউল গান, ভাটিয়ালি, মুর্শিদি এবং আধুনিক ব্যান্ড সংগীতের অসাধারণ মেলবন্ধন। দেশের বিভিন্ন প্রান্ত থেকে আসবেন ৩০ জনেরও বেশি শিল্পী।',
    guests: {
      going: [
        { name: 'আরিফ হোসেন', avatar: 'আ', avatarBg: 'linear-gradient(135deg,var(--teal),var(--teal-light))', mutual: 'পারস্পরিক বন্ধু: ৩ জন' },
        { name: 'নাহিদ হাসান', avatar: 'ন', avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', mutual: 'পারস্পরিক বন্ধু: ১ জন' },
        { name: 'মিতা চৌধুরী', avatar: 'ম', avatarBg: 'linear-gradient(135deg,#ec4899,#f43f5e)', mutual: 'পারস্পরিক বন্ধু: ৫ জন' },
        { name: 'রাফি আহমেদ', avatar: 'র', avatarBg: 'linear-gradient(135deg,#d97706,#fbbf24)', mutual: 'পারস্পরিক বন্ধু: ২ জন' },
      ],
      interested: [
        { name: 'পারিসা তাহের', avatar: 'প', avatarBg: 'linear-gradient(135deg,#ec4899,#f43f5e)', mutual: 'পারস্পরিক বন্ধু: ৪ জন' },
        { name: 'কামরুল হাসান', avatar: 'ক', avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', mutual: 'পারস্পরিক বন্ধু: ২ জন' },
        { name: 'তাসনিম আক্তার', avatar: 'ত', avatarBg: 'linear-gradient(135deg,#d97706,#fbbf24)', mutual: 'পারস্পরিক বন্ধু: ৬ জন' },
      ],
    },
    comments: [
      { name: 'নাহিদ হাসান', avatar: 'ন', avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', text: 'এই ইভেন্টের জন্য অনেকদিন ধরে অপেক্ষা করছিলাম! ছাদনাতলা ব্যান্ড কি পারফর্ম করবে?' },
      { name: 'সাদিয়া ইসলাম', avatar: 'স', avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)', text: 'আমি বাউল গানের জন্য বিশেষভাবে যাব। প্রতি বছরের মতো এবারও অসাধারণ হবে আশা করি! 🎵' },
    ],
  },
  {
    id: 2,
    title: 'জলশা ফুটবল টুর্নামেন্ট — কমিউনিটি কাপ ২০২৫',
    category: 'sports',
    categoryEmoji: '⚽',
    categoryLabel: 'খেলাধুলা / Sports',
    emoji: '⚽',
    coverGradient: 'linear-gradient(140deg,#052e16,#14532d,#1e7c3c)',
    day: '২২',
    monthShort: 'Aug',
    monthFull: 'August',
    dayOfWeek: 'শুক্রবার',
    whenBn: 'শুক্র, ২২ আগস্ট · সকাল ৯টা',
    whenEn: 'Fri, Aug 22, 2025 · 9:00 AM',
    whereBn: 'বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা',
    whereEn: 'National Stadium · Dhaka',
    duration: 'বিকাল ৫টা',
    ticket: null,
    ticketEn: null,
    goingText: '৪৫ জন যাচ্ছে',
    goingEn: '45 going · 78 interested',
    avatars: [
      { letter: 'ক', bg: 'linear-gradient(135deg,#16a34a,#4ade80)' },
      { letter: 'স', bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' },
      { letter: 'ত', bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
    ],
    extraCount: '৪২',
    initialRsvp: 'interested',
    host: {
      name: 'জলশা স্পোর্টস ক্লাব',
      role: 'আয়োজক / Host',
      avatar: 'স',
      avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)',
    },
    description: 'জলশা কমিউনিটির বার্ষিক ফুটবল টুর্নামেন্ট! এই বছর ১৬টি দল অংশগ্রহণ করবে। সকাল ৯টা থেকে ম্যাচ শুরু হবে এবং বিকালে ফাইনাল অনুষ্ঠিত হবে। সবাইকে স্বাগতম!',
    guests: {
      going: [
        { name: 'কামাল হোসেন', avatar: 'ক', avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)', mutual: 'পারস্পরিক বন্ধু: ৭ জন' },
        { name: 'সাইফুল ইসলাম', avatar: 'স', avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', mutual: 'পারস্পরিক বন্ধু: ৩ জন' },
        { name: 'তানভীর আহমেদ', avatar: 'ত', avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', mutual: 'পারস্পরিক বন্ধু: ২ জন' },
      ],
      interested: [
        { name: 'রাশেদুল ইসলাম', avatar: 'র', avatarBg: 'linear-gradient(135deg,#d97706,#fbbf24)', mutual: 'পারস্পরিক বন্ধু: ১ জন' },
        { name: 'নাফিস আহমেদ', avatar: 'ন', avatarBg: 'linear-gradient(135deg,var(--teal),var(--teal-light))', mutual: 'পারস্পরিক বন্ধু: ৪ জন' },
      ],
    },
    comments: [
      { name: 'কামাল হোসেন', avatar: 'ক', avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)', text: 'আমাদের দল এবার জিতবেই! সবাই আসুন সমর্থন করতে! ⚽' },
    ],
  },
  {
    id: 3,
    title: 'ওয়েব ডিজাইন ওয়ার্কশপ — ফ্রি বিগিনার সেশন',
    category: 'online',
    categoryEmoji: '🌐',
    categoryLabel: 'অনলাইন ইভেন্ট / Online',
    emoji: '💻',
    coverGradient: 'linear-gradient(140deg,#0c1a2e,#1a3a5e,#0a2a4a)',
    day: '৩০',
    monthShort: 'Aug',
    monthFull: 'August',
    dayOfWeek: 'শনিবার',
    whenBn: 'শনি, ৩০ আগস্ট · দুপুর ৩টা',
    whenEn: 'Sat, Aug 30, 2025 · 3:00 PM',
    whereBn: 'জলশা লাইভ প্ল্যাটফর্ম',
    whereEn: 'Jolshaa Live Platform · Free',
    duration: 'বিকাল ৫টা',
    ticket: 'ফ্রি / Free',
    ticketEn: 'Free registration required',
    goingText: '২৩৭ জন যাচ্ছে',
    goingEn: '237 going · 412 interested',
    isOnline: true,
    avatars: [
      { letter: 'আ', bg: 'linear-gradient(135deg,var(--teal),var(--teal-light))' },
      { letter: 'ফ', bg: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
      { letter: 'র', bg: 'linear-gradient(135deg,#d97706,#fbbf24)' },
    ],
    extraCount: '২৩৪',
    initialRsvp: 'none',
    host: {
      name: 'জলশা টেক কমিউনিটি',
      role: 'আয়োজক / Host',
      avatar: 'ট',
      avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    },
    description: 'বিগিনারদের জন্য ফ্রি ওয়েব ডিজাইন ওয়ার্কশপ। HTML, CSS, এবং বেসিক UI/UX ডিজাইন শিখুন। সেশনের শেষে সবাই একটি ছোট প্রজেক্ট তৈরি করবে। সবার জন্য ওপেন!',
    guests: {
      going: [
        { name: 'আরিফ হোসেন', avatar: 'আ', avatarBg: 'linear-gradient(135deg,var(--teal),var(--teal-light))', mutual: 'পারস্পরিক বন্ধু: ৩ জন' },
        { name: 'ফারিয়া আক্তার', avatar: 'ফ', avatarBg: 'linear-gradient(135deg,#ec4899,#f43f5e)', mutual: 'পারস্পরিক বন্ধু: ২ জন' },
        { name: 'রাশেদ হাসান', avatar: 'র', avatarBg: 'linear-gradient(135deg,#d97706,#fbbf24)', mutual: 'পারস্পরিক বন্ধু: ৫ জন' },
      ],
      interested: [
        { name: 'নাহিদ আক্তার', avatar: 'ন', avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', mutual: 'পারস্পরিক বন্ধু: ১ জন' },
        { name: 'সাবরিনা রহমান', avatar: 'স', avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)', mutual: 'পারস্পরিক বন্ধু: ৩ জন' },
        { name: 'তানিয়া ইসলাম', avatar: 'ত', avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', mutual: 'পারস্পরিক বন্ধু: ২ জন' },
        { name: 'মাহমুদুল হাসান', avatar: 'ম', avatarBg: 'linear-gradient(135deg,var(--teal),var(--teal-light))', mutual: 'পারস্পরিক বন্ধু: ৪ জন' },
      ],
    },
    comments: [],
  },
  {
    id: 4,
    title: 'চিত্রকলা প্রদর্শনী — তরুণ শিল্পীদের কাজ একই ছাদের নিচে',
    category: 'arts',
    categoryEmoji: '🎨',
    categoryLabel: 'শিল্পকলা / Arts',
    emoji: '🎨',
    coverGradient: 'linear-gradient(140deg,#2e0a1e,#5a1a3a,#8a2d5a)',
    day: '০৫',
    monthShort: 'Sep',
    monthFull: 'September',
    dayOfWeek: 'শুক্রবার',
    whenBn: 'শুক্র, ৫ সেপ্টেম্বর · বিকাল ৪টা',
    whenEn: 'Fri, Sep 5, 2025 · 4:00 PM',
    whereBn: 'ধানমন্ডি আর্ট গ্যালারি, ঢাকা',
    whereEn: 'Dhanmondi Art Gallery · Dhaka',
    duration: 'রাত ৮টা',
    ticket: null,
    ticketEn: null,
    goingText: '৩৩ জন যাচ্ছে',
    goingEn: '33 going · 57 interested',
    avatars: [
      { letter: 'ল', bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
      { letter: 'প', bg: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
    ],
    extraCount: '৩১',
    initialRsvp: 'none',
    host: {
      name: 'ধানমন্ডি আর্ট সোসাইটি',
      role: 'আয়োজক / Host',
      avatar: 'ধ',
      avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    },
    description: 'তরুণ বাংলাদেশি শিল্পীদের চিত্রকলা প্রদর্শনী। এখানে দেখতে পাবেন তেল রঙ, জলরঙ, ডিজিটাল আর্ট এবং মিশ্র মাধ্যমের কাজ। প্রদর্শনী চলবে ৩ দিন।',
    guests: {
      going: [
        { name: 'লাবণ্য দেবী', avatar: 'ল', avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', mutual: 'পারস্পরিক বন্ধু: ২ জন' },
        { name: 'প্রিয়াঙ্কা সেন', avatar: 'প', avatarBg: 'linear-gradient(135deg,#ec4899,#f43f5e)', mutual: 'পারস্পরিক বন্ধু: ১ জন' },
      ],
      interested: [
        { name: 'তানিয়া রহমান', avatar: 'ত', avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', mutual: 'পারস্পরিক বন্ধু: ৩ জন' },
        { name: 'সামিউল হক', avatar: 'স', avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)', mutual: 'পারস্পরিক বন্ধু: ২ জন' },
      ],
    },
    comments: [
      { name: 'লাবণ্য দেবী', avatar: 'ল', avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', text: 'আমার দুটি কাজ এই প্রদর্শনীতে থাকবে। সবাইকে আসতে বলছি! 🎨' },
    ],
  },
];

const upcomingEvents = [
  { id: 1, title: 'ঢাকা লোকসংগীত উৎসব ২০২৫', day: '১৫', month: 'Aug', dateBg: 'var(--teal-xpale)', dateBorder: 'var(--teal-pale)', dayColor: null },
  { id: 2, title: 'জলশা কমিউনিটি মিট-আপ', day: '২২', month: 'Aug', dateBg: 'var(--amber-pale)', dateBorder: '#fde68a', dayColor: 'var(--amber)' },
  { id: 3, title: 'ওয়েব ডিজাইন ওয়ার্কশপ', day: '৩০', month: 'Aug', dateBg: 'var(--purple-pale)', dateBorder: '#ddd6fe', dayColor: 'var(--purple)' },
];

const Events = () => {
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [activeTab, setActiveTab] = useState('discover');
  const [activeCategory, setActiveCategory] = useState('all');

  const selectedEvent = eventsData.find((e) => e.id === selectedEventId);

  return (
    <div className="events-page-body">
      <Navbar messageCount={5} notificationCount={7} />

      <EventsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onSelectEvent={setSelectedEventId}
        upcomingEvents={upcomingEvents}
      />

      <div className="content-area">
        <div className="feed-col">
          <div className="feed-hdr">
            <div>
              <div className="fh-title-bn">ইভেন্ট আবিষ্কার করো</div>
              <div className="fh-title-en">Discover Events · Near You & Online</div>
            </div>
            <div className="feed-sort">
              <span className="sort-label">Sort:</span>
              <select className="sort-select">
                <option>তারিখ / Date</option>
                <option>জনপ্রিয়তা / Popular</option>
                <option>কাছে / Near Me</option>
              </select>
            </div>
          </div>

          <EventCategoryPillRow />

          <div className="events-grid">
            {eventsData.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isWide={event.id === 1}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />
            ))}
          </div>
        </div>

        <EventDetailPanel event={selectedEvent} />
      </div>
    </div>
  );
};

export default Events;
