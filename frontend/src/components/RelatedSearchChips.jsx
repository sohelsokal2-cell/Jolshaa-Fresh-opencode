import React from 'react';

const DEFAULT_SUGGESTIONS = [
  { bn: 'মন্টু মিয়া', en: '/ Montu Mia' },
  { bn: 'মন্টু ভাই', en: '/ Montu Bhai' },
  { bn: 'মন্টু ক্রিকেট', en: '/ Montu Cricket' },
  { bn: '#মন্টু', en: '/ #montoo' }
];

export default function RelatedSearchChips({
  suggestions = DEFAULT_SUGGESTIONS,
  onChipClick
}) {
  return (
    <div className="related-chips" style={{ marginBottom: '20px' }}>
      <span className="related-lbl">সম্পর্কিত খোঁজ · Related searches:</span>
      {suggestions.map((sug, idx) => (
        <button
          key={idx}
          className="chip-related"
          onClick={() => onChipClick?.(sug.bn)}
        >
          {sug.bn} <span className="chip-rel-en">{sug.en}</span>
        </button>
      ))}
    </div>
  );
}
