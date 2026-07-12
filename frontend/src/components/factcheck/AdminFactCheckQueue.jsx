import React, { useState } from 'react';
import './AdminFactCheckQueue.css';

/**
 * AdminFactCheckQueue — Admin Panel queue for reviewing flagged posts.
 * Ready for future Admin Panel integration (not added to routes yet).
 *
 * Props:
 *   flaggedPosts: array of {
 *     id, thumbEmoji, name, snippet,
 *     percentages: { true, false, mislead },
 *     voteCount, reasonCount,
 *     existingVerdict: 'true' | 'false' | 'mislead' | null,
 *     existingNote: string
 *   }
 */
export default function AdminFactCheckQueue({ flaggedPosts = [] }) {
  const [verdicts, setVerdicts] = useState({});
  const [notes, setNotes] = useState({});

  const handleSetVerdict = (postId, type) => {
    setVerdicts(prev => ({ ...prev, [postId]: type }));
  };

  const handleNoteChange = (postId, value) => {
    setNotes(prev => ({ ...prev, [postId]: value }));
  };

  const getVerdictLabel = (type) => {
    const labels = {
      true: '✓ সত্যি নিশ্চিত হয়েছে',
      false: '✓ গুজব নিশ্চিত হয়েছে',
      mislead: '✓ বিভ্রান্তিকর চিহ্নিত',
    };
    return labels[type] || '';
  };

  const getRowClass = (post) => {
    const v = verdicts[post.id] || post.existingVerdict;
    if (v === 'true') return 'acq-row row-confirmed';
    if (v === 'false') return 'acq-row row-confirmed-false';
    if (v === 'mislead') return 'acq-row row-confirmed-mislead';
    return 'acq-row';
  };

  const getNoteStyle = (post) => {
    const v = verdicts[post.id] || post.existingVerdict;
    if (v === 'false') return { borderColor: 'var(--false-border)', background: 'var(--false-xpale)' };
    if (v === 'mislead') return { borderColor: 'var(--mislead-border)', background: 'var(--mislead-xpale)' };
    if (v === 'true') return { borderColor: 'var(--true-border)', background: 'var(--true-xpale)' };
    return {};
  };

  const queueCount = flaggedPosts.filter(p => !verdicts[p.id] && !p.existingVerdict).length;

  return (
    <div className="acq-panel">
      {/* Header */}
      <div className="acq-hdr">
        <div className="acq-hdr-left">
          <div className="acq-hdr-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div className="acq-title-bn">গুজব রিভিউ কিউ</div>
            <div className="acq-title-en">Rumor Review Queue · Admin Panel</div>
          </div>
        </div>
        <div className="acq-queue-count">{queueCount}টি বাকি</div>
      </div>

      {/* Column headers (hidden on mobile) */}
      <div className="acq-col-hdr">
        <div className="acq-ach-cell">Post</div>
        <div className="acq-ach-cell">Vote Split</div>
        <div className="acq-ach-cell">Reasons</div>
        <div className="acq-ach-cell">Verdict</div>
      </div>

      {/* Rows */}
      {flaggedPosts.map((post) => {
        const currentVerdict = verdicts[post.id] || post.existingVerdict;
        const currentNote = notes[post.id] !== undefined ? notes[post.id] : (post.existingNote || '');

        return (
          <div key={post.id} className={getRowClass(post)}>
            {/* Post thumbnail + name + snippet */}
            <div className="acq-post">
              <div className="acq-thumb">{post.thumbEmoji}</div>
              <div>
                <div className="acq-post-name">{post.name}</div>
                <div className="acq-post-snippet">{post.snippet}</div>
              </div>
            </div>

            {/* Mini vote distribution bar */}
            <div className="acq-vote-bar-wrap">
              <div className="acq-mini-bar">
                <div className="acq-mini-seg acq-mini-true" style={{ width: `${post.percentages?.true || 0}%` }}/>
                <div className="acq-mini-seg acq-mini-false" style={{ width: `${post.percentages?.false || 0}%` }}/>
                <div className="acq-mini-seg acq-mini-mislead" style={{ width: `${post.percentages?.mislead || 0}%` }}/>
              </div>
              <div className="acq-vote-total">{post.voteCount || 0} votes</div>
            </div>

            {/* Reason count */}
            <div className="acq-reasons">
              <span style={{ color: currentVerdict === 'mislead' ? 'var(--mislead-amb)' : 'var(--false-coral)', fontWeight: 800, fontSize: 14 }}>
                {post.reasonCount || 0}
              </span>
              <span className="acq-reasons-lbl">কারণ</span>
            </div>

            {/* Verdict buttons + note */}
            <div>
              <div className="acq-verdicts">
                <button
                  className={`acq-btn-verdict acq-bv-true ${currentVerdict === 'true' ? 'confirmed' : ''}`}
                  onClick={() => handleSetVerdict(post.id, 'true')}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {currentVerdict === 'true' ? getVerdictLabel('true') : 'সত্যি নিশ্চিত করো'}
                </button>
                <button
                  className={`acq-btn-verdict acq-bv-false ${currentVerdict === 'false' ? 'confirmed' : ''}`}
                  onClick={() => handleSetVerdict(post.id, 'false')}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  {currentVerdict === 'false' ? getVerdictLabel('false') : 'গুজব নিশ্চিত করো'}
                </button>
                <button
                  className={`acq-btn-verdict acq-bv-mislead ${currentVerdict === 'mislead' ? 'confirmed' : ''}`}
                  onClick={() => handleSetVerdict(post.id, 'mislead')}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {currentVerdict === 'mislead' ? getVerdictLabel('mislead') : 'বিভ্রান্তিকর'}
                </button>
              </div>
              <textarea
                className="acq-note-input"
                value={currentNote}
                onChange={(e) => handleNoteChange(post.id, e.target.value)}
                placeholder="অ্যাডমিন নোট / Admin note..."
                style={getNoteStyle(post)}
              />
            </div>
          </div>
        );
      })}

      {flaggedPosts.length === 0 && (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)' }}>
          কোনো ফ্ল্যাগ করা পোস্ট নেই।
        </div>
      )}
    </div>
  );
}
