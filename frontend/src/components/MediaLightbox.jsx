import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function MediaLightbox({ media, activeIndex, onChange, onClose }) {
  const current = media[activeIndex];
  useEffect(() => {
    const handleKey = event => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange(Math.max(0, activeIndex - 1));
      if (event.key === 'ArrowRight') onChange(Math.min(media.length - 1, activeIndex + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, media.length, onChange, onClose]);

  return createPortal(
    <div className="media-lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="media-lightbox-close" onClick={onClose} aria-label="Close">×</button>
      {activeIndex > 0 && <button className="media-lightbox-prev" onClick={event => { event.stopPropagation(); onChange(activeIndex - 1); }} aria-label="Previous">‹</button>}
      <div className="media-lightbox-content" onClick={event => event.stopPropagation()}>
        {current.media_type === 'video' ? <video src={current.media_url} poster={current.thumbnail_url || undefined} controls autoPlay /> : <img src={current.media_url} alt="Post media" />}
        <small>{activeIndex + 1} / {media.length}</small>
      </div>
      {activeIndex < media.length - 1 && <button className="media-lightbox-next" onClick={event => { event.stopPropagation(); onChange(activeIndex + 1); }} aria-label="Next">›</button>}
    </div>,
    document.body,
  );
}
