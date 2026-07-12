import { useState } from 'react';

const FeaturedVideoCard = ({ video }) => {
  const [saved, setSaved] = useState(false);

  const handlePlay = () => {
    console.log('Play featured video:', video.title);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    console.log(saved ? 'Unsave' : 'Save', video.title);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    console.log('Share:', video.title);
  };

  return (
    <div className="featured-card">
      <div className="featured-tag">
        <span className="ft-bn">📌 বিশেষ ভিডিও</span>
        <span className="ft-en">Featured</span>
      </div>

      <div className="fc-thumb" onClick={handlePlay}>
        <div className="fc-thumb-bg" style={{ background: video.bgGradient }}>
          <div className="fc-thumb-overlay" />
          <div className="fc-thumb-emoji">{video.emoji}</div>
          <div className="fc-thumb-label">
            <div className="fctl-title">{video.title}</div>
          </div>
        </div>

        <div className="fc-play-btn" onClick={handlePlay}>
          <div className="fc-play-circle">
            <span style={{ fontSize: '24px', color: 'white', marginLeft: '3px' }}>▶</span>
          </div>
        </div>

        <div className="duration-badge">{video.duration}</div>
      </div>

      <div className="fc-meta">
        <div className="fc-creator-av" style={{ background: video.creatorColor }}>
          {video.creatorAvatar}
        </div>
        <div className="fc-info">
          <div className="fc-video-title">{video.title}</div>
          <div className="fc-creator-name">{video.creator}</div>
          <div className="fc-stats">
            <span>{video.views}</span>
            <span className="fc-stats-dot" />
            <span>{video.time}</span>
          </div>
        </div>
        <div className="fc-actions">
          <button className={`fc-action-btn ${saved ? 'primary' : ''}`} onClick={handleSave}>
            {saved ? '✅' : '🔖'} {saved ? 'সংরক্ষিত' : 'সংরক্ষণ'}
          </button>
          <button className="fc-action-btn" onClick={handleShare}>
            ↗ শেয়ার
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedVideoCard;
