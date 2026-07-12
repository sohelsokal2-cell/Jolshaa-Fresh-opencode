import React, { useState } from 'react';
import { highlightMatch } from '../utils/highlight';

const DEFAULT_PAGES = [
  {
    id: 1,
    name: 'মন্টুর কমেডি শো',
    category: 'বিনোদন পেজ',
    followerCountText: '৩২,৫০০ followers',
    emoji: '🎭',
    gradient: 'linear-gradient(135deg,#fde68a,#fbbf24)',
    description: 'বাংলা হাসির জগতে স্বাগতম। প্রতিদিনের মজার কন্টেন্ট, স্কেচ ও কমেডি ক্লিপ।',
    initiallyFollowing: true
  },
  {
    id: 2,
    name: 'মন্টুর ক্রিকেট ডাইরি',
    category: 'ক্রীড়া পেজ',
    followerCountText: '৮,৯০০ followers',
    emoji: '📰',
    gradient: 'linear-gradient(135deg,#bae6fd,#7dd3fc)',
    description: 'বাংলাদেশ ক্রিকেটের সর্বশেষ আপডেট, বিশ্লেষণ ও খেলোয়াড়দের পরিসংখ্যান।',
    initiallyFollowing: false
  },
  {
    id: 3,
    name: 'মন্টুর রান্নাঘর',
    category: 'খাদ্য পেজ',
    followerCountText: '১৫,২০০ followers',
    emoji: '🍛',
    gradient: 'linear-gradient(135deg,#fce7f3,#f9a8d4)',
    description: 'দেশীয় রেসিপি ও রান্নার কৌশল প্রতিদিন শেয়ার করা হয়।',
    initiallyFollowing: false
  }
];

export default function PagesResultsCard({
  pages = DEFAULT_PAGES,
  searchQuery = 'মন্টু',
  totalCountText = '৬টি পেজ',
  onSeeAllPagesClick
}) {
  const [followingStates, setFollowingStates] = useState(() => {
    const initial = {};
    pages.forEach(p => {
      initial[p.id] = p.initiallyFollowing;
    });
    return initial;
  });

  const toggleFollow = (id) => {
    setFollowingStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="result-card" id="pagesCard">
      {/* Header */}
      <div className="rc-header">
        <div className="rc-title-wrap">
          <div className="rc-icon rci-pages">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4h10l4 4v14H4z"/><path d="M14 4v4h4"/>
              <line x1="8" y1="12" x2="14" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
            </svg>
          </div>
          <div>
            <div className="rc-title-bn">পেজ</div>
            <div className="rc-title-en">Pages</div>
          </div>
        </div>
        <span className="rc-count-badge">{totalCountText}</span>
      </div>

      {/* List */}
      <div className="pages-list">
        {pages.map((page, idx) => {
          const isFollowing = followingStates[page.id];
          return (
            <React.Fragment key={page.id}>
              {idx > 0 && <div className="pr-divider" />}
              <div className="page-row">
                {/* Thumb */}
                <div className="page-thumb" style={{ background: page.gradient }}>
                  {page.emoji}
                </div>

                {/* Info */}
                <div className="pgr-info">
                  <div className="pgr-name">{highlightMatch(page.name, searchQuery)}</div>
                  <div className="pgr-cat-row">
                    <span className="pgr-cat">{page.category} ·</span>
                    <span className="pgr-fol">{page.followerCountText}</span>
                  </div>
                  <div className="pgr-desc">{page.description}</div>
                </div>

                {/* Follow Button */}
                <button
                  className={`btn-follow ${isFollowing ? 'following' : ''}`}
                  onClick={() => toggleFollow(page.id)}
                >
                  {isFollowing ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <div>
                        <div className="btn-follow-bn">ফলো করা</div>
                        <div className="btn-follow-en">Following</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <div>
                        <div className="btn-follow-bn">ফলো করো</div>
                        <div className="btn-follow-en">Follow</div>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* See All */}
      <div className="rc-see-all">
        <button className="btn-see-all" onClick={onSeeAllPagesClick}>
          <span className="btn-sa-bn">সব দেখো</span>
          See all {totalCountText}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
