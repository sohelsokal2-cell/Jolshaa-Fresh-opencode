import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toggleSaveVideo, isVideoSaved } from '../lib/watchApi';

const FeaturedVideoCard = ({ video }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (user && video.id) {
      isVideoSaved(user.id, video.id).then(setSaved).catch(() => {});
    }
  }, [user, video.id]);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save videos.');
      return;
    }
    try {
      const isNowSaved = await toggleSaveVideo(user.id, video.id);
      setSaved(isNowSaved);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: video.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  if (playing && video.video_url) {
    return (
      <div className="featured-card">
        <div className="featured-tag">
          <span className="ft-bn">📌 বিশেষ ভিডিও</span>
          <span className="ft-en">Featured</span>
        </div>
        <div className="fc-thumb" style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            src={video.video_url}
            controls
            autoPlay
            style={{ width: '100%', borderRadius: '12px', background: '#000', maxHeight: '400px' }}
            onEnded={() => setPlaying(false)}
          />
          <button
            onClick={() => setPlaying(false)}
            style={{
              position: 'absolute', top: '12px', left: '12px', zIndex: 10,
              background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
              borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px'
            }}
          >
            ← Back
          </button>
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
              {saved ? '✅' : '🔖'} {saved ? 'Saved' : 'Save'}
            </button>
            <button className="fc-action-btn" onClick={handleShare}>
              ↗ Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="featured-card">
      <div className="featured-tag">
        <span className="ft-bn">📌 বিশেষ ভিডিও</span>
        <span className="ft-en">Featured</span>
      </div>

      <div className="fc-thumb" onClick={handlePlay}>
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', borderRadius: '12px' }}
          />
        ) : (
          <div className="fc-thumb-bg" style={{ background: video.bgGradient || 'linear-gradient(140deg, #1a4a3a, #1B6B5A)' }}>
            <div className="fc-thumb-overlay" />
            <div className="fc-thumb-emoji">{video.emoji || '▶️'}</div>
            <div className="fc-thumb-label">
              <div className="fctl-title">{video.title}</div>
            </div>
          </div>
        )}

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
            {saved ? '✅' : '🔖'} {saved ? 'Saved' : 'Save'}
          </button>
          <button className="fc-action-btn" onClick={handleShare}>
            ↗ Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedVideoCard;
