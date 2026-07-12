const MoodFilterStrip = ({ activeMood, onMoodChange }) => {
  const moods = [
    { id: 'all', emoji: '✨', bn: 'সব ভাইব', en: 'All Vibes' },
    { id: 'funny', emoji: '😂', bn: 'মজার', en: 'Funny' },
    { id: 'inspiring', emoji: '🤩', bn: 'অনুপ্রেরণামূলক', en: 'Inspiring' },
    { id: 'educational', emoji: '🧠', bn: 'শিক্ষামূলক', en: 'Educational' },
    { id: 'trending', emoji: '🔥', bn: 'ট্রেন্ডিং', en: 'Trending' },
    { id: 'cooking', emoji: '🍳', bn: 'রান্না', en: 'Cooking' },
    { id: 'music', emoji: '🎵', bn: 'সঙ্গীত', en: 'Music' },
    { id: 'travel', emoji: '✈️', bn: 'ভ্রমণ', en: 'Travel' },
  ];

  return (
    <div className="mood-strip">
      {moods.map((mood) => (
        <button
          key={mood.id}
          className={`mood-chip ${activeMood === mood.id ? 'active' : ''}`}
          onClick={() => onMoodChange(mood.id)}
        >
          <span>{mood.emoji}</span>
          {mood.bn}
        </button>
      ))}
    </div>
  );
};

export default MoodFilterStrip;
