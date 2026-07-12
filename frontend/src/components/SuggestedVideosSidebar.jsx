import { useState } from 'react';

const SuggestedVideosSidebar = () => {
  const [subscribed, setSubscribed] = useState({});

  const handleSubscribe = (creatorId) => {
    setSubscribed((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  const suggestedVideos = [
    {
      id: 1,
      title: 'সুন্দরবনের প্রাকৃতিক সৌন্দর্য',
      creator: 'Nature BD',
      views: '২.৩ লক্ষ',
      time: '২ ঘণ্টা আগে',
      duration: '১২:৪৫',
      bgGradient: 'linear-gradient(140deg, #1e5a3a, #2d8a5a, #1a6a4a)',
      emoji: '🌿',
      live: false,
    },
    {
      id: 2,
      title: 'ঢাকার রাস্তার খাবার — ফুড ভ্লগ',
      creator: 'Foodie BD',
      views: '১.৮ লক্ষ',
      time: '৫ ঘণ্টা আগে',
      duration: '১৫:২০',
      bgGradient: 'linear-gradient(140deg, #5a3a1a, #8a6a2d, #6a4a1a)',
      emoji: '🍛',
      live: false,
    },
    {
      id: 3,
      title: 'লাইভ: বাংলা গান শিল্পী সম্মেলন',
      creator: 'Music BD Live',
      views: '১২.৫ হাজার',
      time: 'এখনই',
      duration: null,
      bgGradient: 'linear-gradient(140deg, #4a1a5a, #7a2d8a, #5a1a6a)',
      emoji: '🎤',
      live: true,
      viewers: '১২.৫K',
    },
    {
      id: 4,
      title: 'বাংলাদেশের ঐতিহাসিক স্থাপনা',
      creator: 'History BD',
      views: '৮৫ হাজার',
      time: '১ দিন আগে',
      duration: '২০:১০',
      bgGradient: 'linear-gradient(140deg, #3a2a1a, #6a5a2d, #4a3a1a)',
      emoji: '🏛️',
      live: false,
    },
    {
      id: 5,
      title: 'ক্রিকেট হাইলাইটস: বাংলাদেশ vs শ্রীলঙ্কা',
      creator: 'Sports BD',
      views: '৩.১ লক্ষ',
      time: '৩ দিন আগে',
      duration: '১০:৩০',
      bgGradient: 'linear-gradient(140deg, #1a3a5a, #2d6a8a, #1a4a6a)',
      emoji: '🏏',
      live: false,
    },
  ];

  const creatorSpotlight = {
    name: 'রাশেদ হাসান',
    subs: '২.১ লক্ষ সাবস্ক্রাইবার',
    avatar: 'R',
    color: '#1B6B5A',
  };

  return (
    <aside className="sidebar-right">
      <div className="srb-hdr">
        <div className="srb-title-bn">পরামর্শিত ভিডিও</div>
        <div className="srb-title-en">Suggested Videos</div>
      </div>

      {suggestedVideos.map((video, index) => (
        <div key={video.id}>
          <div className="sv-row">
            <div className="sv-thumb">
              <div className="sv-thumb-bg" style={{ background: video.bgGradient }}>
                <span>{video.emoji}</span>
              </div>
              {video.live ? (
                <div className="sv-live-badge">LIVE</div>
              ) : (
                <div className="sv-dur">{video.duration}</div>
              )}
            </div>
            <div className="sv-info">
              <div className="sv-title">{video.title}</div>
              <div className="sv-creator">{video.creator}</div>
              <div className="sv-stats">
                {video.live ? video.viewers : video.views} · {video.time}
              </div>
            </div>
          </div>
          {index < suggestedVideos.length - 1 && <div className="sv-divider" />}
        </div>
      ))}

      <div className="creator-spotlight">
        <div className="cs-hdr-bn">⭐ ক্রিয়েটর স্পটলাইট</div>
        <div className="cs-creator-row">
          <div className="cs-av" style={{ background: creatorSpotlight.color }}>
            {creatorSpotlight.avatar}
          </div>
          <div>
            <div className="cs-name">{creatorSpotlight.name}</div>
            <div className="cs-sub">{creatorSpotlight.subs}</div>
          </div>
        </div>
        <button
          className="btn-cs-sub"
          onClick={() => handleSubscribe('spotlight')}
        >
          {subscribed['spotlight'] ? '✅ সাবস্ক্রাইবড' : '🔔 সাবস্ক্রাইব'}
        </button>
      </div>
    </aside>
  );
};

export default SuggestedVideosSidebar;
