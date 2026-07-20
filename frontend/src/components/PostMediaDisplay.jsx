import React, { useState } from 'react';
import MediaLightbox from './MediaLightbox';

export default function PostMediaDisplay({ media = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const visible = media.slice(0, 4);
  if (!media.length) return null;

  return (
    <>
      <div className={`post-media-grid post-media-count-${Math.min(media.length, 4)}`}>
        {visible.map((item, index) => <button key={item.id || item.media_url} className="post-media-tile" onClick={() => setActiveIndex(index)} aria-label="Open media">
          {item.media_type === 'video' ? <><img src={item.thumbnail_url || item.media_url} alt="Video thumbnail" /><span className="post-video-play">▶</span></> : <img src={item.media_url} alt="Post media" />}
          {index === 3 && media.length > 4 && <span className="post-media-more">+{media.length - 4}</span>}
        </button>)}
      </div>
      {activeIndex !== null && <MediaLightbox media={media} activeIndex={activeIndex} onChange={setActiveIndex} onClose={() => setActiveIndex(null)} />}
    </>
  );
}
