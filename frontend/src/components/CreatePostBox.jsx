import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePostBox({ userName = 'আমিনুল' }) {
  const navigate = useNavigate();

  return (
    <section className="create-post" aria-label="Create a post — পোস্ট লিখুন">
      <div className="create-post-top">
        <div className="create-avatar" aria-hidden="true">
          {userName.charAt(0)}
        </div>
        <button
          className="create-input"
          id="createPostInput"
          aria-label="What's on your mind? — কী মনে হচ্ছে?"
        >
          কী মনে হচ্ছে, {userName}? · What's on your mind?
        </button>
      </div>
      <div className="create-divider"></div>
      <div className="create-actions">
        {/* Photo/Video */}
        <button className="create-action-btn" aria-label="ছবি বা ভিডিও যোগ করুন — Add Photo/Video">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>
            ছবি/ভিডিও{' '}
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '1px' }}>
              Photo/Video
            </span>
          </span>
        </button>

        {/* Feeling */}
        <button className="create-action-btn" aria-label="অনুভূতি বা কার্যকলাপ — Feeling/Activity">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <span>
            অনুভূতি{' '}
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '1px' }}>
              Feeling
            </span>
          </span>
        </button>

        {/* Location */}
        <button className="create-action-btn" aria-label="অবস্থান যোগ করুন — Add Location">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            লোকেশন{' '}
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '10px', color: 'var(--text-light)', display: 'block', marginTop: '1px' }}>
              Location
            </span>
          </span>
        </button>

        {/* Sahajjo Chai in create post — VISUALLY DISTINCT */}
        <button
          className="create-sahajjo"
          id="createSahajjoBtn"
          aria-label="সাহায্য চাই — Request emergency help"
          onClick={() => navigate('/sahajjo')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            🆘 সাহায্য চাই{' '}
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '9px', fontWeight: 400, display: 'block', marginTop: '1px' }}>
              Request Help
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
