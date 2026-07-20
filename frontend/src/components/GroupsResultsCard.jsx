import React, { useState } from 'react';
import { highlightMatch } from '../utils/highlight';

const DEFAULT_GROUPS = [
  {
    id: 1,
    name: 'মন্টু ফ্যানস ক্লাব',
    description: 'মন্টু মিয়ার অফিসিয়াল ফ্যান পেজ। সবাই যোগ দিন!',
    memberCountText: '২,৪৫০ সদস্য',
    privacy: 'public',
    coverUrl: null,
    gradient: 'linear-gradient(135deg,#fde68a,#fbbf24)',
    emoji: '👥'
  },
  {
    id: 2,
    name: 'ঢাকা ফুডিজ',
    description: 'ঢাকার সেরা খাবারের রিভিউ ও রেকমেন্ডেশন।',
    memberCountText: '১২,৮০০ সদস্য',
    privacy: 'public',
    coverUrl: null,
    gradient: 'linear-gradient(135deg,#fce7f3,#f9a8d4)',
    emoji: '🍛'
  },
  {
    id: 3,
    name: 'বাংলা ক্রিকেট লাভারস',
    description: 'বাংলাদেশ ক্রিকেটের সব খবর ও আলোচনা।',
    memberCountText: '৮,২০০ সদস্য',
    privacy: 'private',
    coverUrl: null,
    gradient: 'linear-gradient(135deg,#bae6fd,#7dd3fc)',
    emoji: '🏏'
  }
];

export default function GroupsResultsCard({
  groups = DEFAULT_GROUPS,
  searchQuery = '',
  totalCountText = '৩টি',
  onSeeAllClick
}) {
  const [joinStates, setJoinStates] = useState(() => {
    const initial = {};
    groups.forEach(g => { initial[g.id] = false; });
    return initial;
  });

  const toggleJoin = (id) => {
    setJoinStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="result-card" id="groupsCard">
      <div className="rc-header">
        <div className="rc-title-wrap">
          <div className="rc-icon" style={{ background: 'linear-gradient(135deg,var(--gold),#f59e0b)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <div className="rc-title-bn">গ্রুপ</div>
            <div className="rc-title-en">Groups</div>
          </div>
        </div>
        <span className="rc-count-badge">{totalCountText}</span>
      </div>

      <div className="pages-list">
        {groups.map((group, idx) => {
          const isJoined = joinStates[group.id];
          return (
            <React.Fragment key={group.id}>
              {idx > 0 && <div className="pr-divider" />}
              <div className="page-row">
                <div className="page-thumb" style={{ background: group.coverUrl ? 'none' : (group.gradient || 'linear-gradient(135deg,#6b7280,#9ca3af)') }}>
                  {group.coverUrl ? (
                    <img src={group.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                  ) : (
                    <span>{group.emoji || '👥'}</span>
                  )}
                </div>

                <div className="pgr-info">
                  <div className="pgr-name">{highlightMatch(group.name, searchQuery)}</div>
                  <div className="pgr-cat-row">
                    <span className="pgr-cat">{group.privacy === 'private' ? '🔒 প্রাইভেট' : '🌐 পাবলিক'}</span>
                    {group.memberCountText && (
                      <span className="pgr-fol"> · {group.memberCountText}</span>
                    )}
                  </div>
                  {group.description && (
                    <div className="pgr-desc">{group.description}</div>
                  )}
                </div>

                <button
                  className={`btn-follow ${isJoined ? 'following' : ''}`}
                  onClick={() => toggleJoin(group.id)}
                >
                  {isJoined ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <div>
                        <div className="btn-follow-bn">যোগ দেওয়া</div>
                        <div className="btn-follow-en">Joined</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <div>
                        <div className="btn-follow-bn">যোগ দাও</div>
                        <div className="btn-follow-en">Join</div>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="rc-see-all">
        <button className="btn-see-all" onClick={onSeeAllClick}>
          <span className="btn-sa-bn">সব দেখো</span>
          See all {totalCountText} groups
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
