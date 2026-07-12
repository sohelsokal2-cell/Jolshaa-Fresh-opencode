import React from 'react';

const DEFAULT_DETAILS = [
  {
    iconType: 'livesIn', // livesIn, from, birthday, relationship, joined
    mainTextBn: 'থাকেন মাগুরা-তে',
    subTextEn: 'Lives in Magura, Khulna Division',
    colorClass: 'dw-teal',
  },
  {
    iconType: 'from',
    mainTextBn: 'থেকে এসেছেন খুলনা',
    subTextEn: 'Originally from Khulna',
    colorClass: 'dw-gold',
  },
  {
    iconType: 'birthday',
    mainTextBn: 'জন্ম ১৪ই জুলাই',
    subTextEn: 'Birthday: July 14th',
    colorClass: 'dw-coral',
  },
  {
    iconType: 'relationship',
    mainTextBn: 'সম্পর্কের অবস্থা একক',
    subTextEn: 'Relationship Status: Single',
    colorClass: 'dw-blue',
  },
  {
    iconType: 'joined',
    mainTextBn: 'যোগ দিয়েছেন জানুয়ারি ২০২৫',
    subTextEn: 'Joined Jolshaa: January 2025',
    colorClass: 'dw-teal',
  },
];

export default function PersonalDetailsCard({ details = DEFAULT_DETAILS, onEditClick, onSeeMoreClick }) {
  const getIcon = (type) => {
    switch (type) {
      case 'livesIn':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        );
      case 'from':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        );
      case 'birthday':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-8 0v2"/><path d="M12 11a4 4 0 100-8 4 4 0 000 8z"/><path d="M4 21c0-3 1.8-5 4-5"/><path d="M17 3l1 4-4-1z" opacity="0.5"/>
          </svg>
        );
      case 'relationship':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        );
      case 'joined':
      default:
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        );
    }
  };

  // Helper to bold specific words like 'মাগুরা', 'খুলনা', '১৪ই জুলাই', 'একক', 'জানুয়ারি ২০২৫'
  const formatText = (text) => {
    const keywords = ['মাগুরা', 'খুলনা', '১৪ই জুলাই', 'একক', 'জানুয়ারি ২০২৫'];
    let formatted = text;
    keywords.forEach(word => {
      if (text.includes(word)) {
        const parts = text.split(word);
        formatted = (
          <>
            {parts[0]}<strong>{word}</strong>{parts[1]}
          </>
        );
      }
    });
    return formatted;
  };

  return (
    <div className="profile-card" aria-label="Personal details card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-bn">ব্যক্তিগত তথ্য</span>
          <span className="card-title-en">Personal Details</span>
        </div>
        <button className="card-edit-btn" aria-label="তথ্য সম্পাদনা / Edit details" onClick={onEditClick}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      <div className="details-list">
        {details.map((detail, index) => (
          <div className="detail-row" key={index}>
            <div className={`detail-icon-wrap ${detail.colorClass}`}>
              {getIcon(detail.iconType)}
            </div>
            <div className="detail-text">
              <div className="detail-main-bn">
                {formatText(detail.mainTextBn)}
              </div>
              <div className="detail-sub-en">{detail.subTextEn}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="see-more-link"
        role="button"
        tabIndex="0"
        aria-label="আরও দেখুন / See more"
        onClick={onSeeMoreClick}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <span>আরও দেখুন</span>
        <span className="see-more-en">· See more</span>
      </div>
    </div>
  );
}
