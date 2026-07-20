import React, { useState, useEffect } from 'react';
import { fetchFlaggedPosts, setAdminVerdict } from '../../lib/factcheckApi';
import './AdminFactCheckQueue.css';

export default function AdminFactCheckQueue() {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verdicts, setVerdicts] = useState({});
  const [notes, setNotes] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    loadFlaggedPosts();
  }, []);

  const loadFlaggedPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchFlaggedPosts();
      setFlaggedPosts(data);
      // Pre-fill notes from existing admin_note
      const existingNotes = {};
      data.forEach(p => { if (p.admin_note) existingNotes[p.id] = p.admin_note; });
      setNotes(existingNotes);
    } catch (err) {
      console.error('Failed to load flagged posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetVerdict = (postId, type) => {
    setVerdicts(prev => ({ ...prev, [postId]: type }));
  };

  const handleNoteChange = (postId, value) => {
    setNotes(prev => ({ ...prev, [postId]: value }));
  };

  const handleSubmitVerdict = async (postId) => {
    const verdict = verdicts[postId];
    if (!verdict) return;

    setSubmittingId(postId);
    try {
      await setAdminVerdict(postId, verdict, notes[postId] || null);
      // Remove from list after successful verdict
      setFlaggedPosts((prev) => prev.filter((p) => p.id !== postId));
      setVerdicts((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setNotes((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } catch (err) {
      console.error('Failed to set verdict:', err);
      alert('ভের্ডিক্ট সেভ হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setSubmittingId(null);
    }
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
    const v = verdicts[post.id] || post.factcheck_status;
    if (v === 'true') return 'acq-row row-confirmed';
    if (v === 'false') return 'acq-row row-confirmed-false';
    if (v === 'mislead') return 'acq-row row-confirmed-mislead';
    return 'acq-row';
  };

  const getNoteStyle = (post) => {
    const v = verdicts[post.id] || post.factcheck_status;
    if (v === 'false') return { borderColor: 'var(--false-border)', background: 'var(--false-xpale)' };
    if (v === 'mislead') return { borderColor: 'var(--mislead-border)', background: 'var(--mislead-xpale)' };
    if (v === 'true') return { borderColor: 'var(--true-border)', background: 'var(--true-xpale)' };
    return {};
  };

  const queueCount = flaggedPosts.filter(p => !verdicts[p.id]).length;

  if (loading) {
    return (
      <div className="acq-panel">
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
        </div>
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)' }}>
          লোড হচ্ছে...
        </div>
      </div>
    );
  }

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
        const currentVerdict = verdicts[post.id] || post.factcheck_status;
        const currentNote = notes[post.id] !== undefined ? notes[post.id] : '';

        return (
          <div key={post.id} className={getRowClass(post)}>
            {/* Post thumbnail + name + snippet */}
            <div className="acq-post">
              <div className="acq-thumb">
                {post.image_url ? (
                  <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                ) : '📰'}
              </div>
              <div>
                <div className="acq-post-name">{post.authorName}</div>
                <div className="acq-post-snippet">{post.content}</div>
              </div>
            </div>

            {/* Mini vote distribution bar */}
            <div className="acq-vote-bar-wrap">
              <div className="acq-mini-bar">
                <div className="acq-mini-seg acq-mini-true" style={{ width: `${post.pctTrue}%` }}/>
                <div className="acq-mini-seg acq-mini-false" style={{ width: `${post.pctFalse}%` }}/>
                <div className="acq-mini-seg acq-mini-mislead" style={{ width: `${post.pctMislead}%` }}/>
              </div>
              <div className="acq-vote-total">{post.totalCount} votes</div>
            </div>

            {/* Reason count (use false+mislead as proxy for "reasons") */}
            <div className="acq-reasons">
              <span style={{ color: currentVerdict === 'mislead' ? 'var(--mislead-amb)' : 'var(--false-coral)', fontWeight: 800, fontSize: 14 }}>
                {post.falseCount + post.misleadCount}
              </span>
              <span className="acq-reasons-lbl">বিপরীত</span>
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
              {/* Submit button */}
              {verdicts[post.id] && (
                <button
                  style={{
                    marginTop: 6,
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
                    color: 'white',
                    fontFamily: 'var(--font-bn)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: submittingId === post.id ? 0.6 : 1,
                  }}
                  onClick={() => handleSubmitVerdict(post.id)}
                  disabled={submittingId === post.id}
                >
                  {submittingId === post.id ? 'সেভ হচ্ছে...' : 'সেভ করো'}
                </button>
              )}
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
