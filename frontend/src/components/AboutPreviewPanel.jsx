import React from 'react';

export default function AboutPreviewPanel({ profileData, isOwnProfile }) {
  const work = profileData?.work || '';
  const education = profileData?.education || '';
  const website = profileData?.website || '';
  const phone = profileData?.phone || '';
  const location = profileData?.location || '';

  const hasAnyData = work || education || website || phone || location;

  if (!hasAnyData) {
    return (
      <div className="support-panel" aria-label="About tab preview">
        <div className="support-panel-header">
          <div className="sp-title">
            <span className="sp-title-bn">সম্পর্কে</span>
            <span className="sp-title-en">About</span>
          </div>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-bn)', fontSize: '13px' }}>
          {isOwnProfile ? 'এখনো কোনো তথ্য যোগ করা হয়নি।' : 'কোনো তথ্য নেই।'}
        </div>
      </div>
    );
  }

  return (
    <div className="support-panel" aria-label="About tab preview">
      <div className="support-panel-header">
        <div className="sp-title">
          <span className="sp-title-bn">সম্পর্কে</span>
          <span className="sp-title-en">About</span>
        </div>
      </div>

      {work && (
        <>
          <div className="about-section-label">কর্মস্থল · Work</div>
          <div className="about-entry">
            <div className="about-entry-icon aei-teal">💼</div>
            <div className="about-entry-text">
              <div className="ae-title">{work}</div>
            </div>
          </div>
        </>
      )}

      {education && (
        <>
          <div className="about-section-label" style={{ marginTop: '8px' }}>শিক্ষা · Education</div>
          <div className="about-entry">
            <div className="about-entry-icon aei-blue">🎓</div>
            <div className="about-entry-text">
              <div className="ae-title">{education}</div>
            </div>
          </div>
        </>
      )}

      {location && (
        <>
          <div className="about-section-label" style={{ marginTop: '8px' }}>লোকেশন · Location</div>
          <div className="about-entry">
            <div className="about-entry-icon aei-teal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="about-entry-text">
              <div className="ae-title">{location}</div>
            </div>
          </div>
        </>
      )}

      {(website || phone) && (
        <>
          <div className="about-section-label" style={{ marginTop: '8px' }}>যোগাযোগ · Contact</div>
          {website && (
            <div className="contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10A15.3 15.3 0 018 12a15.3 15.3 0 014-10z"/>
              </svg>
              <a href={website.startsWith('http') ? website : `https://${website}`} className="contact-link" target="_blank" rel="noopener noreferrer">
                {website}
              </a>
            </div>
          )}
          {phone && (
            <div className="contact-item" style={{ marginBottom: '12px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 9.81 19.79 19.79 0 01.11 1.18 2 2 0 012.11 1h3a2 2 0 012 1.72 12 12 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12 12 0 002.81.7A2 2 0 0122 17l-.08-.08z"/>
              </svg>
              <span className="contact-link">{phone}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
