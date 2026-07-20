import { useState, useRef } from 'react';

const VideoCard = ({ video, wide, onPlay }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (video.video_url) {
      setPlaying(true);
      if (onPlay && video.id) onPlay(video.id);
    }
  };

  if (playing && video.video_url) {
    return (
      <div className={`video-card ${wide ? 'vc-wide' : ''}`} style={{ position: 'relative' }}>
        <div className="vc-thumb" style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            src={video.video_url}
            controls
            autoPlay
            style={{ width: '100%', borderRadius: '12px', background: '#000', maxHeight: '280px' }}
            onEnded={() => setPlaying(false)}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setPlaying(false); }}
            style={{
              position: 'absolute', top: '8px', left: '8px', zIndex: 10,
              background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px'
            }}
          >
            ←
          </button>
        </div>
        <div className="vc-info">
          <div className="vc-creator-row">
            <div className="vc-av" style={{ background: video.creatorColor }}>
              {video.creatorAvatar}
            </div>
            <div className="vc-creator-name">{video.creator}</div>
          </div>
          <div className="vc-title">{video.title}</div>
          <div className="vc-stats">
            <span>{video.views}</span>
            <span className="vc-stats-sep" />
            <span>{video.time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-card ${wide ? 'vc-wide' : ''}`} onClick={handlePlay}>
      <div className="vc-thumb">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', borderRadius: '12px' }}
          />
        ) : (
          <div className={`vct-bg vct-${video.id}`} style={{ background: video.bgGradient || 'linear-gradient(140deg, #1a4a3a, #2a6a4a)' }}>
            <div className="vct-emoji">{video.emoji || '▶️'}</div>
            <div className="vct-overlay" />
            <div className="vct-bottom" />
          </div>
        )}

        <div className="vc-play-overlay">
          <div className="vc-play-btn">
            <span style={{ fontSize: '18px', color: 'white', marginLeft: '2px' }}>▶</span>
          </div>
        </div>

        {video.live ? (
          <>
            <div className="live-badge">
              <div className="live-dot" />
              <span className="live-text">LIVE</span>
              <span className="live-bn">সরাসরি</span>
            </div>
            <div className="live-viewers">
              <span className="lv-icon">❤️</span>
              <span className="lv-text">{video.viewers}</span>
            </div>
          </>
        ) : (
          <div className="dur-badge">
            <span className="dur-text">{video.duration}</span>
          </div>
        )}

        {video.category && (
          <div style={{ position: 'absolute', top: '8px', right: '9px', zIndex: 5 }}>
            <div className="vc-cat-tag">{video.category}</div>
          </div>
        )}
      </div>

      <div className="vc-info">
        <div className="vc-creator-row">
          <div className="vc-av" style={{ background: video.creatorColor }}>
            {video.creatorAvatar}
          </div>
          <div className="vc-creator-name">{video.creator}</div>
          {video.verified && (
            <div className="vc-verified">
              <span style={{ fontSize: '8px', color: 'white' }}>✓</span>
            </div>
          )}
        </div>
        <div className="vc-title">{video.title}</div>
        <div className="vc-stats">
          <span>{video.views}</span>
          <span className="vc-stats-sep" />
          <span>{video.time}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
