import React from 'react';

const DEFAULT_STORIES = [
  { id: 1, name: 'রাহেলা\nবেগম', freshness: 'fresh', bgClass: 'story-grad-1', customBg: null, label: 'রাহেলা বেগমের স্টোরি — ১ ঘণ্টা আগে' },
  { id: 2, name: 'করিম\nভাই', freshness: 'fresh', bgClass: 'story-grad-5', customBg: null, label: 'করিম ভাইয়ের স্টোরি — ২ ঘণ্টা আগে' },
  { id: 3, name: 'নিলুফার', freshness: 'recent', bgClass: 'story-grad-2', customBg: null, label: 'নিলুফারের স্টোরি — ৪ ঘণ্টা আগে' },
  { id: 4, name: 'তানভীর\nআহমেদ', freshness: 'recent', bgClass: 'story-grad-3', customBg: null, label: 'তানভীর আহমেদের স্টোরি — ৫ ঘণ্টা আগে' },
  { id: 5, name: 'ফারহান', freshness: 'older', bgClass: 'story-grad-4', customBg: null, label: 'ফারহানের স্টোরি — ৮ ঘণ্টা আগে' },
  { id: 6, name: 'সুমাইয়া', freshness: 'older', bgClass: '', customBg: 'linear-gradient(145deg,#f472b6,#9333ea)', label: 'সুমাইয়ার স্টোরি — ১০ ঘণ্টা আগে' },
];

export default function StoriesBar({ stories = DEFAULT_STORIES }) {
  return (
    <section className="stories-bar" aria-label="Stories — স্টোরি">
      <div className="stories-bar-header">
        <div>
          <span className="stories-bar-title-bn">স্টোরি</span>
          <span className="stories-bar-title-en">· Stories</span>
        </div>
        <button className="stories-see-all" aria-label="See all stories">See all</button>
      </div>

      <div className="stories-scroll" role="list">
        {/* Your Story */}
        <div className="story-card-yours" role="listitem" tabIndex="0" aria-label="আপনার স্টোরি যোগ করুন — Add your story">
          <div className="story-add-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="story-yours-label-bn">আপনার স্টোরি</div>
          <div className="story-yours-label-en">Your Story</div>
        </div>

        {/* Dynamic Stories */}
        {stories.map(story => (
          <div
            key={story.id}
            className={`story-card ${story.freshness}`}
            role="listitem"
            tabIndex="0"
            aria-label={story.label}
          >
            <div
              className={`story-bg ${story.bgClass}`}
              style={{ height: '100%', background: story.customBg || undefined }}
            />
            <span className="story-freshness-dot"></span>
            <div className="story-overlay">
              <span className="story-name">
                {story.name.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < story.name.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ring legend */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }}></span> Fresh · তাজা
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }}></span> Recent · সাম্প্রতিক
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c8c0b6', display: 'inline-block' }}></span> Older · পুরনো
        </div>
      </div>
    </section>
  );
}
