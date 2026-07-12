import React from 'react';

const PREVIEW_REELS = [
  {
    id: 1,
    name: 'করিম ভাই',
    bgClass: 'rpc-bg-1',
  },
  {
    id: 2,
    name: 'তানভীর রিলস',
    bgClass: 'rpc-bg-2',
  },
];

export default function ReelPreviewStrip() {
  return (
    <div className="reel-preview-strip" aria-label="Upcoming reels preview" aria-hidden="true">
      {PREVIEW_REELS.map((reel) => (
        <div key={reel.id} className="reel-preview-card">
          <div className={`rpc-bg ${reel.bgClass}`} style={{ height: '100%' }}></div>
          <div className="rpc-overlay">
            <div className="rpc-name">{reel.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
