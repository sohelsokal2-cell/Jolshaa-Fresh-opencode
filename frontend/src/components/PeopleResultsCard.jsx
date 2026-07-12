import React, { useState } from 'react';
import { highlightMatch } from '../utils/highlight';

const DEFAULT_PEOPLE = [
  {
    id: 1,
    name: 'মন্টু মিয়া',
    avatarChar: 'ম',
    avatarGrad: 'linear-gradient(135deg,#1B6B5A,#4ECDC4)',
    location: 'ঢাকা, বাংলাদেশ',
    mutualCount: 8,
    mutuals: [
      { char: 'র', grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
      { char: 'স', grad: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
      { char: 'ক', grad: 'linear-gradient(135deg,var(--teal),var(--teal-light))' }
    ],
    initiallyPending: false
  },
  {
    id: 2,
    name: 'মন্টু ভাই কমিলা',
    avatarChar: 'ম',
    avatarGrad: 'linear-gradient(135deg,#f97316,#ea580c)',
    location: 'কুমিল্লা, বাংলাদেশ',
    mutualCount: 3,
    mutuals: [
      { char: 'ত', grad: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' },
      { char: 'আ', grad: 'linear-gradient(135deg,#10b981,#34d399)' }
    ],
    initiallyPending: true
  },
  {
    id: 3,
    name: 'মো. মন্টু হোসেন',
    avatarChar: 'ম',
    avatarGrad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    location: 'সিলেট, বাংলাদেশ',
    mutualCount: 1,
    mutuals: [],
    initiallyPending: false
  }
];

export default function PeopleResultsCard({
  people = DEFAULT_PEOPLE,
  searchQuery = 'মন্টু',
  totalCountText = '১২ জন',
  onSeeAllClick
}) {
  // Store pending states for each person by ID
  const [pendingStates, setPendingStates] = useState(() => {
    const initial = {};
    people.forEach(p => {
      initial[p.id] = p.initiallyPending;
    });
    return initial;
  });

  const toggleFriendRequest = (id) => {
    setPendingStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="result-card" id="peopleCard">
      {/* Header */}
      <div className="rc-header">
        <div className="rc-title-wrap">
          <div className="rc-icon rci-people">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="9" cy="7" r="4"/><path d="M1 21c0-4 3.6-7 8-7s8 3 8 7"/>
              <path d="M20 7.5a3 3 0 010 5M23 21c0-2.5-2-4.5-4-5.5"/>
            </svg>
          </div>
          <div>
            <div className="rc-title-bn">মানুষ</div>
            <div className="rc-title-en">People</div>
          </div>
        </div>
        <span className="rc-count-badge">{totalCountText}</span>
      </div>

      {/* List */}
      <div className="people-list">
        {people.map((person, idx) => {
          const isPending = pendingStates[person.id];
          return (
            <React.Fragment key={person.id}>
              {idx > 0 && <div className="pr-divider" />}
              <div className="person-row">
                {/* Avatar */}
                <div className="pr-avatar" style={{ background: person.avatarGrad }}>
                  {person.avatarChar}
                </div>

                {/* Info */}
                <div className="pr-info">
                  <div className="pr-name">{highlightMatch(person.name, searchQuery)}</div>
                  <div className="pr-meta">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {person.location}

                    {person.mutualCount > 0 && (
                      <>
                        <div className="pr-meta-dot"></div>
                        <div className="pr-mutual">
                          <div className="pr-mutual-faces">
                            {person.mutuals.map((m, mIdx) => (
                              <div className="pr-mf" key={mIdx} style={{ background: m.grad }}>
                                {m.char}
                              </div>
                            ))}
                          </div>
                          <span>{person.mutualCount} জন পরিচিত</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Add Friend Toggle Button */}
                <button
                  className={`btn-add-friend ${isPending ? 'pending' : ''}`}
                  onClick={() => toggleFriendRequest(person.id)}
                >
                  {isPending ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <div>
                        <div className="btn-af-bn">অনুরোধ গেছে</div>
                        <div className="btn-af-en">Requested</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <div>
                        <div className="btn-af-bn">বন্ধু যোগ করো</div>
                        <div className="btn-af-en">Add Friend</div>
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
        <button className="btn-see-all" onClick={onSeeAllClick}>
          <span className="btn-sa-bn">সব দেখো</span>
          See all {totalCountText} people
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
