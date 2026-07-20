import React from 'react';
import PostMediaDisplay from './PostMediaDisplay';

const timeAgo = (dateStr) => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
  const days = Math.floor(hrs / 24);
  return `${days} দিন আগে`;
};

export default function ProfilePostCard({ post }) {
  const authorName = post.authorName || 'Unknown';
  const avatarInitial = authorName[0] || '?';
  const avatarUrl = post.avatarUrl || null;

  return (
    <article className="post-card" aria-label="Post">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-av" style={avatarUrl ? {
          backgroundImage: `url(${avatarUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'transparent',
        } : {}}>
          {avatarUrl ? '' : avatarInitial}
        </div>
        <div className="post-meta">
          <div className="post-author">{authorName}</div>
          <div className="post-time-row">
            <span className="post-time">{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Post Body */}
      {post.content && (
        <div className="post-body">
          <p className="post-text-bn">{post.content}</p>
        </div>
      )}

      {/* Post Media */}
      {post.media?.length > 0 ? <PostMediaDisplay media={post.media} /> : post.image_url && (
        <div className="post-image-block">
          <img
            src={post.image_url}
            className="post-img"
            alt="Post image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Post stats */}
      <div className="post-stats-row">
        <div className="post-stat-left">
          <span className="post-stat-count">{post.totalReactions || 0} পছন্দ</span>
        </div>
        <div className="post-stat-right">
          <span className="post-stat-item">{post.commentsCount || 0} মন্তব্য</span>
        </div>
      </div>
    </article>
  );
}
