import React from 'react';

export default function PersonalDetailsCard({ profileData, isOwnProfile }) {
  const location = profileData?.location || '';
  const work = profileData?.work || '';
  const education = profileData?.education || '';
  const joined = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })
    : '';

  const details = [];
  if (location) {
    details.push({
      iconType: 'livesIn',
      mainTextBn: `থাকেন ${location}-তে`,
      subTextEn: `Lives in ${location}`,
      colorClass: 'dw-teal',
    });
  }
  if (work) {
    details.push({
      iconType: 'work',
      mainTextBn: `কর্মস্থল: ${work}`,
      subTextEn: `Work: ${work}`,
      colorClass: 'dw-gold',
    });
  }
  if (education) {
    details.push({
      iconType: 'education',
      mainTextBn: `শিক্ষা: ${education}`,
      subTextEn: `Education: ${education}`,
      colorClass: 'dw-blue',
    });
  }
  if (joined) {
    details.push({
      iconType: 'joined',
      mainTextBn: `যোগ দিয়েছেন ${joined}`,
      subTextEn: `Joined ${joined}`,
      colorClass: 'dw-teal',
    });
  }

  if (details.length === 0) {
    return (
      <div className="profile-card" aria-label="Personal details card">
        <div className="card-header">
          <div className="card-title">
            <span className="card-title-bn">ব্যক্তিগত তথ্য</span>
            <span className="card-title-en">Personal Details</span>
          </div>
        </div>
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          {isOwnProfile ? 'প্রোফাইলে তথ্য যোগ করুন।' : 'কোনো তথ্য নেই।'}
        </div>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'livesIn':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        );
      case 'work':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          </svg>
        );
      case 'education':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
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

  return (
    <div className="profile-card" aria-label="Personal details card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-bn">ব্যক্তিগত তথ্য</span>
          <span className="card-title-en">Personal Details</span>
        </div>
      </div>

      <div className="details-list">
        {details.map((detail, index) => (
          <div className="detail-row" key={index}>
            <div className={`detail-icon-wrap ${detail.colorClass}`}>
              {getIcon(detail.iconType)}
            </div>
            <div className="detail-text">
              <div className="detail-main-bn">{detail.mainTextBn}</div>
              <div className="detail-sub-en">{detail.subTextEn}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
