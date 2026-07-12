import React from 'react';

const DEFAULT_DEACTIVATED_PAGES = [
  {
    id: 1,
    name: 'ফটোগ্রাফি বাংলা',
    type: 'Photography',
    followersCount: '2.1K followers',
    emoji: '📸',
    gradient: 'linear-gradient(135deg,#d1fae5,#6ee7b7)'
  }
];

export default function DeactivatedPagesPanel({
  deactivatedPages = DEFAULT_DEACTIVATED_PAGES,
  onActivatePage,
  onSeeAllClick
}) {
  return (
    <div className="deactivated-card">
      {/* Header */}
      <div className="dc-header">
        <div className="dc-hdr-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <div className="dc-title-bn">নিষ্ক্রিয় পেজ</div>
          <div className="dc-title-en">Deactivated Pages</div>
        </div>
      </div>

      {/* Body */}
      <div className="dc-body">
        <div className="dc-desc-bn">এই পেজগুলো এখন সবার কাছে দেখা যাচ্ছে না।</div>
        <span className="dc-desc-en">These pages are not publicly visible at this time.</span>
      </div>

      {/* Pages list */}
      {deactivatedPages.map(page => (
        <div className="dc-page-item" key={page.id}>
          <div className="dc-thumb" style={{ background: page.gradient }}>
            {page.emoji}
          </div>
          <div>
            <div className="dc-pname-bn">{page.name}</div>
            <div className="dc-pmeta">{page.type} · {page.followersCount}</div>
          </div>
          <button
            className="btn-activate"
            onClick={() => onActivatePage?.(page.id)}
          >
            <span className="btn-activate-bn">সক্রিয় করো</span>
            <span className="btn-activate-en">Activate</span>
          </button>
        </div>
      ))}

      {/* Footer */}
      <div className="dc-footer">
        <button
          className="dc-see-all"
          onClick={onSeeAllClick}
        >
          সব দেখো · See all
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
