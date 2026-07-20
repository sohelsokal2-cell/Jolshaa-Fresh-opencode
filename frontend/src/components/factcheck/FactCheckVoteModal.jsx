import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitVote, getFactCheckSummary, getMyVote, subscribeToVoteChanges } from '../../lib/factcheckApi';
import './FactCheckVoteModal.css';

export default function FactCheckVoteModal({ post, isOpen, onClose, onVoteSubmitted }) {
  const { user } = useAuth();
  const [selectedVote, setSelectedVote] = useState(null);
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [dist, setDist] = useState({ true_count: 0, false_count: 0, mislead_count: 0, total: 0, pct_true: 0, pct_false: 0, pct_mislead: 0 });

  // Load vote distribution and user's existing vote
  useEffect(() => {
    if (!isOpen || !post?.id) return;

    let cancelled = false;

    async function load() {
      try {
        const [distribution, userVote] = await Promise.all([
          getFactCheckSummary(post.id),
          user ? getMyVote(post.id, user.id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setDist(distribution);
        if (userVote) {
          setSelectedVote(userVote.vote);
          setReasonText(userVote.reason || '');
        }
      } catch (err) {
        console.error('Failed to load factcheck data:', err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isOpen, post?.id, user]);

  // Realtime subscription for vote changes
  useEffect(() => {
    if (!isOpen || !post?.id) return;

    const unsubscribe = subscribeToVoteChanges(post.id, async () => {
      try {
        const updated = await getFactCheckSummary(post.id);
        setDist(updated);
      } catch (err) {
        console.error('Realtime vote update failed:', err);
      }
    });

    return () => unsubscribe();
  }, [isOpen, post?.id]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVote(null);
      setReasonExpanded(false);
      setReasonText('');
      setSubmitting(false);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalVotes = dist.total;
  const pctTrue = Number(dist.pct_true) || 0;
  const pctFalse = Number(dist.pct_false) || 0;
  const pctMislead = Number(dist.pct_mislead) || 0;

  const handleVoteSelect = (type) => {
    setSelectedVote(type);
  };

  const handleReset = () => {
    setSelectedVote(null);
    setReasonExpanded(false);
    setReasonText('');
  };

  const handleSubmit = async () => {
    if (!selectedVote || submitting || !user) return;
    setSubmitting(true);

    try {
      await submitVote(post.id, user.id, selectedVote, reasonText || null);
      setSubmitSuccess(true);

      // Refresh distribution
      const updated = await getFactCheckSummary(post.id);
      setDist(updated);

      setTimeout(() => {
        setSubmitting(false);
        setSubmitSuccess(false);
        setSelectedVote(null);
        setReasonExpanded(false);
        setReasonText('');
        if (onVoteSubmitted) {
          onVoteSubmitted();
        }
      }, 1500);
    } catch (err) {
      console.error('Vote submit failed:', err);
      setSubmitting(false);
      alert('ভোট সেভ হয়নি। আবার চেষ্টা করুন।');
    }
  };

  const getIconBadgeClass = (type) => {
    if (type === 'true') return 'fcm-vbi-true';
    if (type === 'false') return 'fcm-vbi-false';
    return 'fcm-vbi-mislead';
  };

  const authorInitial = post?.authorName?.charAt(0) || 'প';
  const authorBg = 'linear-gradient(135deg,#7c3aed,#a78bfa)';

  return (
    <div className="fcm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fcm-modal" role="dialog" aria-modal="true" aria-label="সত্যি নাকি গুজব ভোট মোডাল">

        {/* Modal header */}
        <div className="fcm-header">
          <div className="fcm-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="7" stroke="#1B6B5A" strokeWidth="2.2" fill="none"/>
              <path d="M19 19l5 5" stroke="#1B6B5A" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="8" y1="14" x2="20" y2="14" stroke="#1a9e5c" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M8 14 C6.5 16 5 17 8 17s3.5-1 2-3Z" fill="#1a9e5c" opacity="0.6"/>
              <path d="M20 14 C18.5 16.5 17 17.5 20 17.5s3.5-1 2-3.5Z" fill="#d9534f" opacity="0.6"/>
              <circle cx="14" cy="14" r="1.5" fill="#1B6B5A"/>
              <path d="M12 14l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="fcm-title-wrap">
            <div className="fcm-title-bn">সত্যি নাকি গুজব?</div>
            <div className="fcm-title-en">True or Rumor? · Community Fact-Check</div>
          </div>
          <button className="fcm-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Post preview */}
        <div className="fcm-post-preview">
          <div className="fcm-post-av" style={{ background: authorBg }}>
            {authorInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fcm-post-name">{post?.authorName || 'পোস্ট লেখক'}</div>
            <div className="fcm-post-time">{post?.time || ''} · {post?.location || ''}</div>
            <div className="fcm-post-text">{post?.content || 'পোস্টের তথ্য এখানে দেখা যাবে...'}</div>
            <div className="fcm-preview-flag">
              <div className="fcm-flag-chip">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                {totalVotes} জন ফ্যাক্ট-চেক করেছেন · {totalVotes} fact-checkers
              </div>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <div className="fcm-instruction">
          এই পোস্টটি সম্পর্কে আপনার মতামত কী?
          <span className="fcm-instruction-en">What is your assessment of this post?</span>
        </div>

        {/* Vote buttons */}
        <div className="fcm-vote-buttons">
          <button
            className={`fcm-vote-btn fcm-vb-true ${selectedVote === 'true' ? 'selected' : ''}`}
            onClick={() => handleVoteSelect('true')}
            aria-pressed={selectedVote === 'true'}
          >
            <div className={`fcm-vb-icon-badge ${getIconBadgeClass('true')}`}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 3L5 7v6c0 5 4 9 8 10 4-1 8-5 8-10V7z" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.5"/>
                <path d="M9 13l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="fcm-vb-text">
              <div className="fcm-vb-main-bn">সত্যি মনে হচ্ছে ✓</div>
              <div className="fcm-vb-main-en">Seems True · Verified</div>
              <div className="fcm-vb-desc">তথ্যটি সঠিক বলে মনে হচ্ছে</div>
            </div>
            <div className="fcm-vb-selected-mark" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </button>

          <button
            className={`fcm-vote-btn fcm-vb-false ${selectedVote === 'false' ? 'selected' : ''}`}
            onClick={() => handleVoteSelect('false')}
            aria-pressed={selectedVote === 'false'}
          >
            <div className={`fcm-vb-icon-badge ${getIconBadgeClass('false')}`}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="9" stroke="white" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(255,255,255,0.12)"/>
                <line x1="9" y1="9" x2="17" y2="17" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <line x1="17" y1="9" x2="9" y2="17" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="fcm-vb-text">
              <div className="fcm-vb-main-bn">মিথ্যা মনে হচ্ছে ✗</div>
              <div className="fcm-vb-main-en">Seems False · Misinformation</div>
              <div className="fcm-vb-desc">তথ্যটি ভুল বা গুজব বলে মনে হচ্ছে</div>
            </div>
            <div className="fcm-vb-selected-mark" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </button>

          <button
            className={`fcm-vote-btn fcm-vb-mislead ${selectedVote === 'mislead' ? 'selected' : ''}`}
            onClick={() => handleVoteSelect('mislead')}
            aria-pressed={selectedVote === 'mislead'}
          >
            <div className={`fcm-vb-icon-badge ${getIconBadgeClass('mislead')}`}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 3L23 13 13 23 3 13Z" fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="1.5"/>
                <path d="M8 13 C9 11 10 11 11 13 C12 15 13 15 14 13 C15 11 16 11 17 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div className="fcm-vb-text">
              <div className="fcm-vb-main-bn">বিভ্রান্তিকর ~</div>
              <div className="fcm-vb-main-en">Misleading · Partial Truth</div>
              <div className="fcm-vb-desc">তথ্যটি আংশিক সত্য বা প্রসঙ্গ বিভ্রান্তিকর</div>
            </div>
            <div className="fcm-vb-selected-mark" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Distribution bar */}
        <div className="fcm-dist-wrap">
          <div className="fcm-dist-label">
            <span className="fcm-dist-lbn">কমিউনিটির মতামত বিভাজন</span>
            <span className="fcm-vote-count">{totalVotes}টি ভোট</span>
          </div>
          <div className="fcm-dist-bar">
            <div className="fcm-db-seg fcm-db-true" style={{ width: `${pctTrue}%` }}/>
            <div className="fcm-db-seg fcm-db-false" style={{ width: `${pctFalse}%` }}/>
            <div className="fcm-db-seg fcm-db-mislead" style={{ width: `${pctMislead}%` }}/>
          </div>
          <div className="fcm-dist-legend">
            <div className="fcm-dl-item">
              <div className="fcm-dl-dot fcm-dl-true"/>
              <span className="fcm-dl-text-bn">সত্যি</span>
              <span className="fcm-dl-pct">{pctTrue}%</span>
            </div>
            <div className="fcm-dl-item">
              <div className="fcm-dl-dot fcm-dl-false"/>
              <span className="fcm-dl-text-bn">মিথ্যা</span>
              <span className="fcm-dl-pct">{pctFalse}%</span>
            </div>
            <div className="fcm-dl-item">
              <div className="fcm-dl-dot fcm-dl-mislead"/>
              <span className="fcm-dl-text-bn">বিভ্রান্তিকর</span>
              <span className="fcm-dl-pct">{pctMislead}%</span>
            </div>
          </div>
        </div>

        {/* Optional reason */}
        <div className="fcm-reason-wrap">
          <button
            className={`fcm-reason-toggle ${reasonExpanded ? 'open' : ''}`}
            onClick={() => setReasonExpanded(prev => !prev)}
            aria-expanded={reasonExpanded}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <span className="fcm-reason-toggle-bn">কারণ জানাতে চান?</span>
            <span className="fcm-reason-toggle-en">/ Want to explain why?</span>
          </button>
          <div className={`fcm-reason-body ${reasonExpanded ? 'open' : ''}`}>
            <textarea
              className="fcm-reason-textarea"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="আপনার কারণ লিখুন... / Write your reason (optional)..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="fcm-footer">
          <div className="fcm-vote-stats">
            <strong>{totalVotes}</strong> জন ভোট দিয়েছেন
          </div>
          <div className="fcm-actions">
            <button className="fcm-btn-cancel" onClick={handleReset}>বাতিল</button>
            <button
              className={`fcm-btn-submit ${submitSuccess ? 'success' : ''}`}
              onClick={handleSubmit}
              disabled={!selectedVote || submitting}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {submitSuccess ? 'ভোট দেওয়া হয়েছে!' : 'ভোট দিন · Submit Vote'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
