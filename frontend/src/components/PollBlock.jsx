import React, { useState } from 'react';

const DEFAULT_OPTIONS = [
  { id: 1, bn: 'বিরিয়ানি', en: 'Biryani', emoji: '🍚', percentage: 42, fillColor: '' },
  { id: 2, bn: 'ইলিশ মাছ', en: 'Hilsa Fish', emoji: '🐟', percentage: 28, fillColor: 'coral-fill' },
  { id: 3, bn: 'খিচুড়ি', en: 'Khichuri', emoji: '🍲', percentage: 18, fillColor: 'gold-fill' },
  { id: 4, bn: 'চাটপটি', en: 'Chatpati', emoji: '🥗', percentage: 12, fillColor: 'green-fill' }
];

export default function PollBlock({
  questionBn = 'তোমার প্রিয় বাংলাদেশি খাবার কোনটি?',
  questionEn = "What's your favorite Bangladeshi dish?",
  options = DEFAULT_OPTIONS,
  initialVoteCount = 125,
  timeLeft = '২ দিন বাকি · 2 days left'
}) {
  const [selectedOption, setSelectedOption] = useState(1); // Default voted on Option 1 (as in design)
  const [voteCount, setVoteCount] = useState(initialVoteCount);

  const handleVote = (id) => {
    if (selectedOption === id) {
      // Toggle off
      setSelectedOption(null);
      setVoteCount(prev => prev - 1);
    } else {
      // Vote new option
      if (selectedOption === null) {
        setVoteCount(prev => prev + 1);
      }
      setSelectedOption(id);
    }
  };

  return (
    <>
      {/* Poll question block */}
      <div className="poll-question-block">
        <div className="poll-question-label" aria-label="Poll">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4A04A" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          <span className="poll-label-text">ভোট করুন · Poll</span>
        </div>
        <div className="poll-question-bn" role="heading" aria-level="3">{questionBn}</div>
        <div className="poll-question-en">{questionEn}</div>
      </div>

      {/* Poll options */}
      <div className="poll-options" role="group" aria-label="Poll options — click to vote">
        {options.map(option => {
          const isVoted = selectedOption === option.id;
          return (
            <div
              key={option.id}
              className={`poll-option ${option.fillColor} ${isVoted ? 'voted' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={isVoted}
              aria-label={`${option.bn} — ${option.percentage}%, ${isVoted ? 'voted' : ''}`}
              onClick={() => handleVote(option.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleVote(option.id); }}
            >
              <div className="poll-fill" style={{ width: `${option.percentage}%` }} aria-hidden="true"></div>
              <div className="poll-option-inner">
                <span className="poll-emoji" aria-hidden="true">{option.emoji}</span>
                <div className="poll-texts">
                  <div className="poll-opt-bn">{option.bn}</div>
                  <div className="poll-opt-en">{option.en}</div>
                </div>
                <div className="poll-pct" aria-label={`${option.percentage} percent`}>{option.percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Poll meta */}
      <div className="poll-meta">
        <div className="poll-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span>{voteCount} জন ভোট দিয়েছে · <span style={{ fontFamily: 'var(--font-en)' }}>{voteCount} votes</span></span>
        </div>
        <div className="poll-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{timeLeft}</span>
        </div>
      </div>
    </>
  );
}
