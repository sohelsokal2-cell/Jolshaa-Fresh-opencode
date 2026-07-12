import React, { useState } from 'react';
import FactCheckVoteModal from '../components/factcheck/FactCheckVoteModal';
import FactCheckBadge from '../components/factcheck/FactCheckBadge';
import FactCheckFalseOverlay from '../components/factcheck/FactCheckFalseOverlay';
import AdminFactCheckQueue from '../components/factcheck/AdminFactCheckQueue';
import './FactCheckPreview.css';

const DEMO_POST = {
  id: 'demo-1',
  authorName: 'নাহিদ হাসান',
  avatarBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
  time: '২ ঘণ্টা আগে',
  location: 'Dhaka',
  text: 'শুনলাম নতুন আইনে এখন থেকে মোবাইল নম্বর ছাড়া ফেসবুক ব্যবহার করা যাবে না এবং সব অ্যাকাউন্ট সরকারি ডেটাবেজে যুক্ত হবে। এটা কি সত্যি?',
  factCheckerCount: 47,
};

const DEMO_FLAGGED_POSTS = [
  {
    id: 'flagged-1',
    thumbEmoji: '📱',
    name: 'নতুন আইনে মোবাইল নম্বর বাধ্যতামূলক?',
    snippet: 'শুনলাম নতুন আইনে এখন থেকে মোবাইল নম্বর ছাড়া ফেসবুক ব্যবহার করা যাবে না...',
    percentages: { true: 18, false: 62, mislead: 20 },
    voteCount: 47,
    reasonCount: 12,
    existingVerdict: null,
    existingNote: '',
  },
  {
    id: 'flagged-2',
    thumbEmoji: '🌐',
    name: 'ইন্টারনেট বন্ধ হচ্ছে আগামীকাল?',
    snippet: 'বাংলাদেশে মোবাইল ইন্টারনেট আগামীকাল থেকে সম্পূর্ণ বন্ধ...',
    percentages: { true: 8, false: 78, mislead: 14 },
    voteCount: 89,
    reasonCount: 23,
    existingVerdict: 'false',
    existingNote: 'কোনো সরকারি ঘোষণা নেই। BTRC-এর অফিশিয়াল পেজে এই তথ্য নেই।',
  },
  {
    id: 'flagged-3',
    thumbEmoji: '🏫',
    name: 'স্কুল বন্ধের খবর — পুরো ঢাকা?',
    snippet: 'কাল থেকে ঢাকার সব স্কুল বন্ধ থাকবে — শুধু কিছু এলাকায় প্রযোজ্য...',
    percentages: { true: 22, false: 28, mislead: 50 },
    voteCount: 61,
    reasonCount: 8,
    existingVerdict: 'mislead',
    existingNote: 'শুধু নির্দিষ্ট কিছু থানায় প্রযোজ্য, পুরো ঢাকায় নয়।',
  },
];

export default function FactCheckPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleVoteSubmitted = (_data) => {
    setVoteSubmitted(true);
    setTimeout(() => setVoteSubmitted(false), 3000);
  };

  return (
    <div className="fcp-page">
      {/* Hero */}
      <div className="fcp-hero">
        <div className="fcp-hero-inner">
          <div className="fcp-hero-icon" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="19" cy="19" r="9" stroke="#1B6B5A" strokeWidth="2.5" fill="none"/>
              <path d="M26 26l6 6" stroke="#1B6B5A" strokeWidth="2.8" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="26" y2="19" stroke="#1a9e5c" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 19 C10 21 8 22 12 22 C16 22 14 21 12 19Z" fill="#1a9e5c" opacity="0.7"/>
              <path d="M26 19 C24 22 22 23 26 23 C30 23 28 22 26 19Z" fill="#d9534f" opacity="0.7"/>
              <circle cx="19" cy="19" r="2" fill="#1B6B5A"/>
              <path d="M16 19l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="fcp-hero-text">
            <div className="fcp-hero-title">সত্যি নাকি গুজব?</div>
            <span className="fcp-hero-title-en">Jolshaa Fact-Check · True or Rumor?</span>
            <div className="fcp-hero-sub">কমিউনিটি মিলে যাচাই করে। ভোট দিন, কারণ জানান, সত্যকে সামনে আনুন।</div>
          </div>
          <div className="fcp-legend">
            <div className="fcp-verdict-pill fcp-vp-true">
              <div className="fcp-vp-icon fcp-vpi-true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div><div className="fcp-vp-label-bn">সত্যি</div><div className="fcp-vp-label-en">True</div></div>
            </div>
            <div className="fcp-verdict-pill fcp-vp-mislead">
              <div className="fcp-vp-icon fcp-vpi-mislead">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <line x1="5" y1="8" x2="12" y2="8"/>
                  <line x1="5" y1="16" x2="12" y2="16"/>
                </svg>
              </div>
              <div><div className="fcp-vp-label-bn">বিভ্রান্তিকর</div><div className="fcp-vp-label-en">Misleading</div></div>
            </div>
            <div className="fcp-verdict-pill fcp-vp-false">
              <div className="fcp-vp-icon fcp-vpi-false">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <div><div className="fcp-vp-label-bn">মিথ্যা</div><div className="fcp-vp-label-en">False / Rumor</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="fcp-content-grid">
        {/* PART A: Vote Modal */}
        <div className="fcp-vote-modal-wrap">
          <div className="fcp-section-lbl">
            <div className="fcp-sl-letter">A</div>
            <div>
              <div className="fcp-sl-bn">ভোট মোডাল — পোস্টে ক্লিক করলে দেখা যায়</div>
              <div className="fcp-sl-en">Vote Modal · Appears when user clicks fact-check on a post</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card-bg, #fff)', borderRadius: '14px', border: '1.5px solid var(--border-light)' }}>
            <p style={{ fontFamily: 'var(--font-bn)', fontSize: 14, color: 'var(--text-mid)', marginBottom: 12 }}>
              বাটনে ক্লিক করে ভোট মোডাল দেখুন
            </p>
            <button onClick={handleOpenModal} style={{
              padding: '10px 24px',
              borderRadius: 11,
              background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
              border: 'none',
              color: 'white',
              fontFamily: 'var(--font-bn)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(27,107,90,0.26)',
            }}>
              ⚑ ভোট মোডাল খুলুন
            </button>
            {voteSubmitted && (
              <p style={{ fontFamily: 'var(--font-bn)', fontSize: 13, color: 'var(--true-green)', marginTop: 10 }}>
                ✓ ভোট সফলভাবে জমা হয়েছে!
              </p>
            )}
          </div>
        </div>

        {/* PART B: Badge States */}
        <div className="fcp-badge-states-wrap">
          <div className="fcp-section-lbl">
            <div className="fcp-sl-letter">B</div>
            <div>
              <div className="fcp-sl-bn">পোস্ট ব্যাজ স্টেট — তিনটি অবস্থা</div>
              <div className="fcp-sl-en">Post Badge States · Three verification states on post cards</div>
            </div>
          </div>
          <div className="fcp-badge-cards">
            {/* Unverified state */}
            <div className="fcp-post-card-mini">
              <div className="fcp-pcm-inner">
                <div className="fcp-state-label" style={{ color: 'var(--text-xlight)' }}>UNVERIFIED STATE</div>
                <div className="fcp-pcm-header">
                  <div className="fcp-pcm-av" style={{ background: 'linear-gradient(135deg,#1B6B5A,#4ECDC4)' }}>আ</div>
                  <div>
                    <div className="fcp-pcm-name">আরিফ হোসেন</div>
                    <div className="fcp-pcm-time">৩ ঘণ্টা আগে</div>
                  </div>
                </div>
                <div className="fcp-pcm-text">শুনলাম ঢাকায় কাল থেকে সব স্কুল বন্ধ থাকবে। কেউ নিশ্চিত করতে পারবেন?</div>
                <div className="fcp-pcm-footer">
                  <FactCheckBadge status="unverified" onClick={handleOpenModal} voteCount={3} />
                  <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-xlight)' }}>3 votes · unverified</span>
                </div>
              </div>
            </div>

            {/* True state */}
            <div className="fcp-post-card-mini">
              <div style={{ height: 4, background: 'linear-gradient(to right, var(--true-green), #22c55e)' }}/>
              <div className="fcp-pcm-inner">
                <div className="fcp-state-label" style={{ color: 'var(--true-green)' }}>VERIFIED TRUE STATE</div>
                <div className="fcp-pcm-header">
                  <div className="fcp-pcm-av" style={{ background: 'linear-gradient(135deg,#16a34a,#4ade80)' }}>ত</div>
                  <div>
                    <div className="fcp-pcm-name">তাসনিম আক্তার</div>
                    <div className="fcp-pcm-time">১ দিন আগে</div>
                  </div>
                </div>
                <div className="fcp-pcm-text">ঈদের পরদিন থেকে নতুন বাস রুট চালু হচ্ছে — BRTC অফিশিয়াল বিজ্ঞপ্তি অনুযায়ী।</div>
                <div className="fcp-pcm-footer">
                  <div>
                    <FactCheckBadge status="true" percentage={89} />
                    <div style={{ fontFamily: 'var(--font-en)', fontSize: 9, color: 'var(--true-green)', marginTop: 3, marginLeft: 2 }}>
                      Seems True · 89% community verified
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-xlight)' }}>134 votes</span>
                </div>
              </div>
            </div>

            {/* False state */}
            <div className="fcp-post-card-mini">
              <FactCheckFalseOverlay percentage={78}>
                <div className="fcp-pcm-inner">
                  <div className="fcp-state-label" style={{ color: 'var(--false-coral)' }}>FALSE STATE</div>
                  <div className="fcp-pcm-header">
                    <div className="fcp-pcm-av" style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>র</div>
                    <div>
                      <div className="fcp-pcm-name">রফিক ইসলাম</div>
                      <div className="fcp-pcm-time">৫ ঘণ্টা আগে</div>
                    </div>
                  </div>
                  <div className="fcp-pcm-text">বাংলাদেশে মোবাইল ইন্টারনেট আগামীকাল থেকে সম্পূর্ণ বন্ধ করে দেওয়া হবে — সরকারি সিদ্ধান্ত।</div>
                  <div className="fcp-pcm-footer">
                    <FactCheckBadge status="false" percentage={78} />
                    <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-xlight)' }}>89 votes</span>
                  </div>
                </div>
              </FactCheckFalseOverlay>
            </div>
          </div>
        </div>

        {/* PART C: Admin Review Panel */}
        <div className="fcp-admin-panel-wrap">
          <div className="fcp-section-lbl">
            <div className="fcp-sl-letter" style={{ background: 'var(--false-coral)' }}>C</div>
            <div>
              <div className="fcp-sl-bn">অ্যাডমিন রিভিউ প্যানেল — ফ্ল্যাগ করা পোস্ট</div>
              <div className="fcp-sl-en">Admin Review Panel · Flagged content queue</div>
            </div>
          </div>
          <AdminFactCheckQueue flaggedPosts={DEMO_FLAGGED_POSTS} />
        </div>
      </div>

      {/* Vote Modal */}
      <FactCheckVoteModal
        post={DEMO_POST}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onVoteSubmitted={handleVoteSubmitted}
      />
    </div>
  );
}
