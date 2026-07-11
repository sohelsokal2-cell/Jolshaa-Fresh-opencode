import React, { useState } from 'react';

export default function PostCard({ post }) {
  const [reacted, setReacted] = useState(post.initiallyReacted || false);
  const [showFactCheck, setShowFactCheck] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const handleReactClick = () => {
    setReacted(prev => !prev);
  };

  const getFactCheckClass = (status) => {
    if (status === 'green') return 'green';
    if (status === 'red') return 'red';
    return 'amber'; // default/under review
  };

  const getFactCheckLabelBn = (status) => {
    if (status === 'green') return 'যাচাইকৃত সত্য';
    if (status === 'red') return 'ভুল/গুজব';
    return 'যাচাই চলছে';
  };

  const getFactCheckLabelEn = (status) => {
    if (status === 'green') return 'Verified True';
    if (status === 'red') return 'False/Misleading';
    return 'Under Review';
  };

  return (
    <article className="post-card" aria-label={`Post by ${post.authorName}`}>
      {/* Header */}
      <div className="post-header">
        <div className="post-header-left">
          <div className={`post-avatar ${post.avatarClass || 'post-avatar-1'}`} aria-hidden="true">
            {post.authorName.charAt(0)}
          </div>
          <div>
            <div className="post-meta-name" tabIndex="0">{post.authorName}</div>
            <div className="post-meta-row">
              <span className="post-meta-time">{post.timeString}</span>
              <span className="post-meta-sep">·</span>
              <span className="post-meta-privacy">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                </svg>
                {post.privacy || 'Public'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          {/* FACT-CHECK BADGE */}
          {post.factCheckStatus && (
            <button
              className={`fact-check-badge ${getFactCheckClass(post.factCheckStatus)}`}
              onClick={() => setShowFactCheck(prev => !prev)}
              aria-label={`Fact check status: ${getFactCheckLabelEn(post.factCheckStatus)}`}
            >
              <svg width="13" height="14" viewBox="0 0 20 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 2L3 5v6c0 5 3.5 9.7 7 11 3.5-1.3 7-6 7-11V5L10 2z" />
                <path d="M10 8v4M10 14h.01" strokeWidth="2.2" />
              </svg>
              <div>
                <div className="fact-badge-label-bn">{getFactCheckLabelBn(post.factCheckStatus)}</div>
                <div className="fact-badge-label-en">{getFactCheckLabelEn(post.factCheckStatus)}</div>
              </div>
            </button>
          )}

          <button className="post-more-btn" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fact-check expanded info panel */}
      {post.factCheckStatus && showFactCheck && (
        <div className="fact-check-info">
          <div className="fact-check-info-title">
            <svg width="14" height="14" viewBox="0 0 20 22" fill="none" stroke="var(--fact-amber)" strokeWidth="2" strokeLinecap="round">
              <path d="M10 2L3 5v6c0 5 3.5 9.7 7 11 3.5-1.3 7-6 7-11V5L10 2z" />
              <path d="M10 8v4M10 14h.01" strokeWidth="2.2" />
            </svg>
            <div>
              <div className="fci-title-bn">সত্যি নাকি গুজব? — Fact Check</div>
              <div className="fci-title-en">Community Fact-Checking in Progress</div>
            </div>
          </div>
          <div className="fci-body">
            {post.factCheckInfoText || 'এই পোস্টের তথ্য এখনো যাচাই করা হয়নি। জলশা কমিউনিটি এটি নিয়ে কাজ করছে।'}
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '12px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
              {post.factCheckInfoTextEn || 'This post\'s claim is under community fact-check review. Jolshaa community reviewers are verifying it.'}
            </span>
          </div>
          <div className="fci-voters">
            {post.factCheckVoters || '🔍 ৪৭ জন যাচাইকারী কাজ করছেন · 47 community reviewers checking'}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <button style={{ padding: '5px 12px', borderRadius: '7px', border: '1.5px solid var(--fact-green)', background: 'var(--fact-green-bg)', color: 'var(--fact-green)', fontFamily: 'var(--font-bn)', fontSize: '12px', cursor: 'pointer' }}>
              ✓ সত্য মনে হচ্ছে · Seems True
            </button>
            <button style={{ padding: '5px 12px', borderRadius: '7px', border: '1.5px solid var(--fact-red)', background: 'var(--fact-red-bg)', color: 'var(--fact-red)', fontFamily: 'var(--font-bn)', fontSize: '12px', cursor: 'pointer' }}>
              ✗ গুজব মনে হচ্ছে · Seems False
            </button>
          </div>
        </div>
      )}

      {/* Content Text (Large quote style vs Normal text) */}
      {post.postType === 'quote' ? (
        <p
          className="post-text large"
          style={{
            background: 'linear-gradient(135deg,var(--teal-xpale),var(--off-white))',
            margin: 0,
            padding: '24px 20px 20px',
            fontSize: '20px',
            borderRadius: 0,
          }}
        >
          "{post.textBn}"<br />
          <span style={{ fontFamily: 'var(--font-en)', fontSize: '14px', color: 'var(--text-light)', fontWeight: 400, marginTop: '8px', display: 'block' }}>
            "{post.textEn}"
          </span>
        </p>
      ) : (
        <p className="post-text">
          {post.textBn}<br />
          <span style={{ fontFamily: 'var(--font-en)', fontSize: '13px', color: 'var(--text-light)' }}>
            {post.textEn}
          </span>
        </p>
      )}

      {/* Media Image */}
      {post.mediaSrc && post.postType !== 'quote' && (
        <>
          <img
            src={post.mediaSrc}
            className="post-media"
            alt={post.mediaAlt || 'Post Media'}
            style={{ display: mediaError ? 'none' : 'block' }}
            onError={() => setMediaError(true)}
          />
          {mediaError && (
            <div className={`post-media post-media-placeholder ${post.mediaPlaceholderClass || 'img-placeholder-1'}`}>
              {post.mediaPlaceholderIcon || '🍛'}
            </div>
          )}
        </>
      )}

      {/* Summary info */}
      <div className="post-react-summary">
        <div className="flex-center">
          <div className="post-react-emojis">
            {(post.reactionsList || ['❤️', '😊', '🔥']).map((emoji, idx) => (
              <div key={idx} className="post-react-emoji-bubble">{emoji}</div>
            ))}
          </div>
          <span className="post-react-count">{post.reactionsCount || '০'}</span>
        </div>
        <span className="post-comment-count">{post.commentsCount || '০'}</span>
      </div>

      {/* Reaction Action Bar */}
      <div className="post-reaction-bar" role="group" aria-label="Post reactions">
        {/* React Button */}
        <button
          className={`react-btn ${reacted ? 'reacted' : ''}`}
          onClick={handleReactClick}
          aria-label="প্রতিক্রিয়া / React"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill={reacted ? 'currentColor' : 'none'}
            stroke={reacted ? 'none' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            {!reacted && (
              <path d="M3 14 Q5 11 7 14 Q9 17 11 14" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
            )}
          </svg>
          <div>
            <div className="react-btn-label-bn" style={reacted ? { color: 'var(--coral)' } : undefined}>
              প্রতিক্রিয়া
            </div>
            <div className="react-btn-label-en">React</div>
          </div>
        </button>

        {/* Comment Button */}
        <button className="react-btn" aria-label="মন্তব্য / Comment">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <circle cx="8.5" cy="11" r="1" fill="currentColor" />
            <circle cx="12" cy="11" r="1" fill="currentColor" />
            <circle cx="15.5" cy="11" r="1" fill="currentColor" />
          </svg>
          <div>
            <div className="react-btn-label-bn">মন্তব্য</div>
            <div className="react-btn-label-en">Comment</div>
          </div>
        </button>

        {/* Share Button */}
        <button className="react-btn" aria-label="শেয়ার / Share">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="7" cy="12" r="3" />
            <path d="M10 12h11M18 9l3 3-3 3" />
          </svg>
          <div>
            <div className="react-btn-label-bn">শেয়ার</div>
            <div className="react-btn-label-en">Share</div>
          </div>
        </button>

        {/* Save Button */}
        <button className="react-btn" aria-label="সেভ / Save">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            <path d="M9 11h6" strokeWidth="1.5" opacity="0.6" />
          </svg>
          <div>
            <div className="react-btn-label-bn">সেভ</div>
            <div className="react-btn-label-en">Save</div>
          </div>
        </button>
      </div>
    </article>
  );
}
