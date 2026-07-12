const VideoCard = ({ video, wide }) => {
  const handlePlay = () => {
    console.log('Play video:', video.title);
  };

  return (
    <div className={`video-card ${wide ? 'vc-wide' : ''}`} onClick={handlePlay}>
      <div className="vc-thumb">
        <div className={`vct-bg vct-${video.id}`} style={{ background: video.bgGradient }}>
          <div className="vct-emoji">{video.emoji}</div>
          <div className="vct-overlay" />
          <div className="vct-bottom" />
        </div>

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
