import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SahajjoHero from '../components/SahajjoHero';
import SahajjoFilterBar from '../components/SahajjoFilterBar';
import HelpRequestCard from '../components/HelpRequestCard';
import HelpDetailPanel from '../components/HelpDetailPanel';
import './SahajjoChai.css';

const requestsData = [
  {
    id: 1,
    title: 'রক্ত দরকার — A+ গ্রুপ, ঢাকা মেডিকেল',
    description: 'আমার মা-র এখনই অপারেশন হবে। A+ রক্ত দরকার। ঢাকা মেডিকেল কলেজ হাসপাতাল, কেবিন নং ৩০৭। যে কেউ সাহায্য করতে পারেন?',
    fullDescription: (
      <>
        আমার মা-র এখনই অপারেশন হবে। <strong>A+ গ্রুপের রক্ত</strong> দরকার। ঢাকা মেডিকেল কলেজ হাসপাতাল, <strong>কেবিন নং ৩০৭</strong>।
        <br /><br />
        যে কেউ সাহায্য করতে পারলে এখনই যোগাযোগ করুন। অনেক ধন্যবাদ আল্লাহ আপনাদের ভালো রাখুন।
        <br /><br />
        <span style={{ fontFamily: 'var(--font-en)', fontSize: '11px', color: 'var(--text-light)' }}>
          Immediate O+ blood needed. DMCH, Cabin 307. Please contact if you can help.
        </span>
      </>
    ),
    category: 'medical',
    urgency: 'immediate',
    timeAgo: '১৫ মিনিট আগে',
    timeAgoEn: '15 mins ago',
    timeRemaining: '২ ঘণ্টা',
    timeRemainingEn: '2 hours left',
    requester: {
      name: 'রাফি আহমেদ',
      avatar: 'র',
      avatarBg: 'linear-gradient(135deg,#1B6B5A,#4ECDC4)',
      location: 'শাহবাগ, ঢাকা',
    },
    helpers: [
      { id: 'h1', name: 'নাদিয়া ইসলাম', avatar: 'ন', avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', message: 'আমি A+ ব্লাড ডোনার। এখনই আসতে পারব।', time: '12 minutes ago', location: 'Dhaka' },
      { id: 'h2', name: 'সামিরা রহমান', avatar: 'স', avatarBg: 'linear-gradient(135deg,#ec4899,#f43f5e)', message: 'আমার O+ আছে, A+ আমার বন্ধুকে জানাচ্ছি এখনই।', time: '9 minutes ago', location: 'Mirpur, Dhaka' },
      { id: 'h3', name: 'মাহমুদ করিম', avatar: 'ম', avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', message: 'আমি হাসপাতালের কাছেই আছি। দরকার হলে গাড়ি নিয়ে সাহায্য করতে পারব।', time: '6 minutes ago', location: 'Shahbag' },
      { id: 'h4', name: 'রনি আক্তার', avatar: 'র', avatarBg: 'linear-gradient(135deg,#d97706,#fbbf24)', message: 'আমার ভাই A+ গ্রুপের। তাকে পাঠিয়ে দিচ্ছি।', time: '4 minutes ago', location: 'Dhaka' },
      { id: 'h5', name: 'তাহমিনা বেগম', avatar: 'ত', avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)', message: 'কোনো সাহায্য লাগলে বলুন। আমি বাগেরহাট থেকে সংযোগ দিতে পারব।', time: '2 minutes ago', location: 'Bagerhat' },
    ],
  },
  {
    id: 2,
    title: 'বন্যার পানিতে বাড়ি আটকে গেছি — নৌকা দরকার',
    description: 'সিলেটের সুনামগঞ্জে আমাদের পুরো গ্রাম পানিতে তলিয়ে গেছে। বৃদ্ধ মা ও বাচ্চাসহ ৭ জন আটকে আছি। যদি কারো নৌকা বা ত্রাণ সংযোগ থাকে জানান।',
    fullDescription: (
      <>
        সিলেটের সুনামগঞ্জে আমাদের পুরো গ্রাম <strong>পানিতে তলিয়ে গেছে</strong>। বৃদ্ধ মা ও বাচ্চাসহ <strong>৭ জন আটকে আছি</strong>।
        <br /><br />
        যদি কারো নৌকা বা ত্রাণ সংযোগ থাকে জানান। অনেক ধন্যবাদ।
      </>
    ),
    category: 'flood',
    urgency: 'hours',
    timeAgo: '৪৫ মিনিট আগে',
    timeAgoEn: '45 mins ago',
    timeRemaining: '৫ ঘণ্টা',
    timeRemainingEn: '5 hours left',
    requester: {
      name: 'করিম মিয়া',
      avatar: 'ক',
      avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
      location: 'সুনামগঞ্জ, সিলেট',
    },
    helpers: [
      { id: 'h6', name: 'আব্দুল হাকিম', avatar: 'আ', avatarBg: 'linear-gradient(135deg,#1B6B5A,#4ECDC4)', message: 'আমার নৌকা আছে। এখনই যাচ্ছি।', time: '30 minutes ago', location: 'Sunamganj' },
      { id: 'h7', name: 'রহিম উদ্দিন', avatar: 'র', avatarBg: 'linear-gradient(135deg,#d97706,#fbbf24)', message: 'ত্রাণ সামগ্রী পাঠাচ্ছি।', time: '20 minutes ago', location: 'Sylhet' },
    ],
  },
  {
    id: 3,
    title: '৭ বছরের ছেলে হারিয়ে গেছে — চট্টগ্রাম',
    description: 'আমার ছেলে তানভীর (৭ বছর) গতকাল বিকেল থেকে নিখোঁজ। পরেছিল নীল জামা ও কালো প্যান্ট। চট্টগ্রামের অক্সিজেন এলাকায় দেখলে অনুগ্রহ করে জানাবেন।',
    fullDescription: (
      <>
        আমার ছেলে <strong>তানভীর (৭ বছর)</strong> গতকাল বিকেল থেকে <strong>নিখোঁজ</strong>।
        <br /><br />
        পরেছিল নীল জামা ও কালো প্যান্ট। চট্টগ্রামের অক্সিজেন এলাকায় দেখলে অনুগ্রহ করে জানাবেন।
      </>
    ),
    category: 'lost',
    urgency: 'days',
    timeAgo: '১ দিন আগে',
    timeAgoEn: '1 day ago',
    timeRemaining: 'চলমান',
    timeRemainingEn: 'ongoing',
    requester: {
      name: 'নাসরিন বেগম',
      avatar: 'ন',
      avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
      location: 'অক্সিজেন, চট্টগ্রাম',
    },
    helpers: [
      { id: 'h8', name: 'তানিয়া আক্তার', avatar: 'ত', avatarBg: 'linear-gradient(135deg,#ec4899,#f43f5e)', message: 'আমি সেই এলাকায় থাকি। খোঁজ করছি।', time: '20 hours ago', location: 'Chattogram' },
      { id: 'h9', name: 'জাহিদ হাসান', avatar: 'জ', avatarBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', message: 'পুলিশে রিপোর্ট করেছি।', time: '18 hours ago', location: 'Chattogram' },
      { id: 'h10', name: 'মাহরিন সুলতানা', avatar: 'ম', avatarBg: 'linear-gradient(135deg,#10b981,#34d399)', message: 'সোশ্যাল মিডিয়ায় শেয়ার করেছি।', time: '15 hours ago', location: 'Dhaka' },
    ],
  },
  {
    id: 4,
    title: 'শিবিরে ১৫০ জনের জন্য রান্না করা খাবার দরকার',
    description: 'বন্যাদুর্গত শিবিরে ৩ দিন ধরে ১৫০ জন আশ্রয় নিয়েছে। রান্না করা খাবার ও পানি অত্যন্ত দরকার। কুমিল্লার দেবীদ্বার উপজেলা।',
    fullDescription: (
      <>
        বন্যাদুর্গত শিবিরে <strong>৩ দিন ধরে ১৫০ জন</strong> আশ্রয় নিয়েছে।
        <br /><br />
        <strong>রান্না করা খাবার ও পানি</strong> অত্যন্ত দরকার। কুমিল্লার দেবীদ্বার উপজেলা।
      </>
    ),
    category: 'food',
    urgency: 'hours',
    timeAgo: '৩ ঘণ্টা আগে',
    timeAgoEn: '3 hours ago',
    timeRemaining: '৮ ঘণ্টা',
    timeRemainingEn: '8 hours left',
    requester: {
      name: 'মিজানুর রহমান',
      avatar: 'ম',
      avatarBg: 'linear-gradient(135deg,#16a34a,#4ade80)',
      location: 'দেবীদ্বার, কুমিল্লা',
    },
    helpers: [
      { id: 'h11', name: 'সুমন আক্তার', avatar: 'স', avatarBg: 'linear-gradient(135deg,#f97316,#ea580c)', message: 'রান্নার সামগ্রী নিয়ে যাচ্ছি।', time: '2 hours ago', location: 'Comilla' },
    ],
  },
];

const statsData = {
  resolved: '১,২৪৮',
  active: '৩৮',
  helpers: '৫,৬০০+',
  districts: '৬৪',
};

const SahajjoChai = () => {
  const [selectedRequestId, setSelectedRequestId] = useState(1);
  const [resolvedRequestIds, setResolvedRequestIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('all');
  const detailPanelRef = useRef(null);

  const selectedRequest = requestsData.find((r) => r.id === selectedRequestId);

  const filteredRequests = activeFilter === 'all'
    ? requestsData
    : requestsData.filter((r) => r.category === activeFilter);

  const handleResolve = (requestId, isResolved) => {
    setResolvedRequestIds((prev) => {
      const next = new Set(prev);
      if (isResolved) {
        next.add(requestId);
      } else {
        next.delete(requestId);
      }
      return next;
    });
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequestId(requestId);
    // Mobile: scroll detail panel into view
    if (window.innerWidth < 860 && detailPanelRef.current) {
      detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleRequestHelp = () => {
    // TODO: Open "Create Help Request" modal
    console.log('Open Create Help Request modal — coming soon!');
  };

  return (
    <div className="sahajjo-page-body">
      <Navbar messageCount={5} notificationCount={7} />

      <SahajjoHero stats={statsData} onRequestHelp={handleRequestHelp} />

      <div className="sahajjo-content-area">
        <div className="sahajjo-feed-col">
          <SahajjoFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

          {filteredRequests.map((request) => (
            <HelpRequestCard
              key={request.id}
              request={request}
              selectedRequestId={selectedRequestId}
              onSelectRequest={handleSelectRequest}
              isResolved={resolvedRequestIds.has(request.id)}
            />
          ))}

          <div className="sahajjo-feed-footer">
            <div className="feed-footer-bn">সবার সাহায্যে আরও অনেকে নিরাপদ হোক।</div>
            <div className="feed-footer-en">Together, we keep our community safe.</div>
            <div>
              <button className="btn-load-more">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                আরও দেখো · Load More
              </button>
            </div>
          </div>
        </div>

        <div ref={detailPanelRef}>
          <HelpDetailPanel request={selectedRequest} onResolve={handleResolve} />
        </div>
      </div>
    </div>
  );
};

export default SahajjoChai;
