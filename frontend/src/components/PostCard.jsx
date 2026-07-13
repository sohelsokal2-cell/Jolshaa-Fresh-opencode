import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toggleReaction, fetchComments, addComment } from '../lib/postsApi';
import { useToast } from './Toast';

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'এইমাত্র';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} মিনিট আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} দিন আগে`;
  return date.toLocaleDateString('bn-BD');
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function PostCard({ post }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [userReaction, setUserReaction] = useState(post.userReaction);
  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {});
  const [totalReactions, setTotalReactions] = useState(post.totalReactions || 0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleReaction = async (type) => {
    console.log('[handleReaction] called with type:', type, 'user:', user?.id, 'post:', post?.id);
    if (!user) {
      showToast('প্রতিক্রিয়া দিতে লগইন করো।');
      return;
    }

    const prevReaction = userReaction;
    const prevCounts = { ...reactionCounts };
    const prevTotal = totalReactions;

    if (userReaction === type) {
      setUserReaction(null);
      setReactionCounts(prev => {
        const updated = { ...prev };
        updated[type] = (updated[type] || 1) - 1;
        if (updated[type] <= 0) delete updated[type];
        return updated;
      });
      setTotalReactions(prev => Math.max(0, prev - 1));
    } else {
      setUserReaction(type);
      setReactionCounts(prev => {
        const updated = { ...prev };
        if (prevReaction) {
          updated[prevReaction] = (updated[prevReaction] || 1) - 1;
          if (updated[prevReaction] <= 0) delete updated[prevReaction];
        }
        updated[type] = (updated[type] || 0) + 1;
        return updated;
      });
      setTotalReactions(prev => prevReaction ? prev : prev + 1);
    }
    setShowReactionPicker(false);

    try {
      console.log('[handleReaction] calling toggleReaction...');
      await toggleReaction(post.id, user.id, type);
      console.log('[handleReaction] toggleReaction succeeded');
    } catch (err) {
      console.error('Reaction error:', err);
      setUserReaction(prevReaction);
      setReactionCounts(prevCounts);
      setTotalReactions(prevTotal);
      showToast('প্রতিক্রিয়া সেভ হয়নি। আবার চেষ্টা করো।');
    }
  };

  const handleLoadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    if (comments.length > 0) return;

    setLoadingComments(true);
    try {
      const data = await fetchComments(post.id);
      setComments(data);
    } catch (err) {
      console.error('Comments fetch error:', err);
      showToast('মন্তব্য লোড হয়নি।');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;

    setSubmittingComment(true);
    try {
      const newComment = await addComment(post.id, commentText.trim(), user.id);
      setComments(prev => [...prev, newComment]);
      setCommentsCount(prev => prev + 1);
      setCommentText('');
    } catch (err) {
      console.error('Comment error:', err);
      showToast('মন্তব্য যোগ হয়নি। আবার চেষ্টা করো।');
    } finally {
      setSubmittingComment(false);
    }
  };

  const reactionSummary = Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const reactionEmojis = reactionSummary.map(r => r.type);

  return (
    <article className="post-card" aria-label={`Post by ${post.authorName}`}>
      {/* Header */}
      <div className="post-header">
        <div className="post-header-left">
          {post.avatarUrl ? (
            <img src={post.avatarUrl} className="post-avatar-img" alt="" />
          ) : (
            <div className="post-avatar post-avatar-1" aria-hidden="true">
              {post.authorName.charAt(0)}
            </div>
          )}
          <div>
            <div className="post-meta-name" tabIndex="0">{post.authorName}</div>
            <div className="post-meta-row">
              <span className="post-meta-time">{timeAgo(post.created_at)}</span>
              <span className="post-meta-sep">·</span>
              <span className="post-meta-privacy">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                </svg>
                Public
              </span>
            </div>
          </div>
        </div>

        <button className="post-more-btn" aria-label="More options">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Content Text */}
      <p className="post-text">{post.content}</p>

      {/* Media Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          className="post-media"
          alt="Post media"
        />
      )}

      {/* Summary info */}
      <div className="post-react-summary">
        <div className="flex-center">
          {reactionSummary.length > 0 && (
            <div className="post-react-emojis">
              {reactionEmojis.map((emoji, idx) => (
                <div key={idx} className="post-react-emoji-bubble">{emoji}</div>
              ))}
            </div>
          )}
          <span className="post-react-count">{totalReactions || '০'}</span>
        </div>
        <span className="post-comment-count" style={{ cursor: 'pointer' }} onClick={handleLoadComments}>
          {commentsCount} মন্তব্য
        </span>
      </div>

      {/* Reaction Action Bar */}
      <div className="post-reaction-bar" role="group" aria-label="Post reactions">
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            className={`react-btn ${userReaction ? 'reacted' : ''}`}
            onClick={() => userReaction ? handleReaction(userReaction) : setShowReactionPicker(!showReactionPicker)}
            onMouseEnter={() => !userReaction && setShowReactionPicker(true)}
            onMouseLeave={() => { const t = setTimeout(() => setShowReactionPicker(false), 300); window.__reactPickerTimer = t; }}
            aria-label="React"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill={userReaction ? 'currentColor' : 'none'}
              stroke={userReaction ? 'none' : 'currentColor'}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <div>
              <div className="react-btn-label-bn" style={userReaction ? { color: 'var(--coral)' } : undefined}>
                {userReaction || 'প্রতিক্রিয়া'}
              </div>
              <div className="react-btn-label-en">React</div>
            </div>
          </button>

          {showReactionPicker && (
            <div
              className="reaction-picker"
              onMouseEnter={() => { clearTimeout(window.__reactPickerTimer); setShowReactionPicker(true); }}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              {REACTIONS.map(r => (
                <button
                  key={r}
                  className={`reaction-option ${userReaction === r ? 'active' : ''}`}
                  onClick={() => handleReaction(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="react-btn" onClick={handleLoadComments} aria-label="Comment">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <div>
            <div className="react-btn-label-bn">মন্তব্য</div>
            <div className="react-btn-label-en">Comment</div>
          </div>
        </button>

        <button className="react-btn" aria-label="Share">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="7" cy="12" r="3" />
            <path d="M10 12h11M18 9l3 3-3 3" />
          </svg>
          <div>
            <div className="react-btn-label-bn">শেয়ার</div>
            <div className="react-btn-label-en">Share</div>
          </div>
        </button>

        <button className="react-btn" aria-label="Save">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <div>
            <div className="react-btn-label-bn">সেভ</div>
            <div className="react-btn-label-en">Save</div>
          </div>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="post-comments-section">
          {loadingComments ? (
            <div className="comments-loading">লোড হচ্ছে...</div>
          ) : (
            <>
              {comments.length === 0 && (
                <div className="comments-empty">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করো!</div>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  {comment.avatarUrl ? (
                    <img src={comment.avatarUrl} className="comment-avatar-img" alt="" />
                  ) : (
                    <div className="comment-avatar">{comment.authorName.charAt(0)}</div>
                  )}
                  <div className="comment-body">
                    <div className="comment-author">{comment.authorName}</div>
                    <div className="comment-text">{comment.content}</div>
                    <div className="comment-time">{timeAgo(comment.created_at)}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {user && (
            <div className="comment-input-row">
              <div className="comment-avatar">{user.full_name?.charAt(0) || 'উ'}</div>
              <input
                className="comment-input"
                placeholder="মন্তব্য লিখো..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                disabled={submittingComment}
              />
              <button
                className="comment-submit-btn"
                onClick={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? '...' : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
