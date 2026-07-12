import { useState } from 'react';

const EventCategoryPillRow = ({ onPillChange }) => {
  const [activePill, setActivePill] = useState('all');

  const pills = [
    { id: 'all', emoji: '🎯', label: 'সব' },
    { id: 'music', emoji: '🎵', label: 'সংগীত' },
    { id: 'sports', emoji: '⚽', label: 'খেলাধুলা' },
    { id: 'community', emoji: '🤝', label: 'সম্প্রদায়' },
    { id: 'education', emoji: '📚', label: 'শিক্ষা' },
    { id: 'arts', emoji: '🎭', label: 'শিল্পকলা' },
    { id: 'tech', emoji: '💻', label: 'টেক' },
    { id: 'online', emoji: '🌐', label: 'অনলাইন' },
  ];

  const handlePillClick = (pillId) => {
    setActivePill(pillId);
    if (onPillChange) onPillChange(pillId);
  };

  return (
    <div className="cat-pill-row">
      {pills.map((pill) => (
        <button
          key={pill.id}
          className={`cat-pill ${activePill === pill.id ? 'active' : ''}`}
          onClick={() => handlePillClick(pill.id)}
        >
          {pill.emoji} {pill.label}
        </button>
      ))}
    </div>
  );
};

export default EventCategoryPillRow;
