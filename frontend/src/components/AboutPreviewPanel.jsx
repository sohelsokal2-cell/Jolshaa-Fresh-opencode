import React from 'react';

const DEFAULT_WORK = [
  {
    role: 'Content Creator',
    company: 'Freelance Digital Media',
    date: 'Jan 2023 — বর্তমান · Present',
    icon: '💼',
    colorClass: 'aei-teal'
  },
  {
    role: 'Web Developer',
    company: 'TechBD Solutions, Dhaka',
    date: 'Jun 2021 — Dec 2022',
    icon: '🏢',
    colorClass: 'aei-gold'
  }
];

const DEFAULT_EDUCATION = [
  {
    degree: 'BSc Computer Science',
    school: 'Khulna University',
    date: '2017 — 2021',
    icon: '🎓',
    colorClass: 'aei-blue'
  }
];

const DEFAULT_CONTACT = [
  {
    type: 'website',
    value: 'sohel.dev.bd',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10A15.3 15.3 0 018 12a15.3 15.3 0 014-10z"/>
      </svg>
    )
  },
  {
    type: 'phone',
    value: '@sohel.digital',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 9.81 19.79 19.79 0 01.11 1.18 2 2 0 012.11 1h3a2 2 0 012 1.72 12 12 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12 12 0 002.81.7A2 2 0 0122 17l-.08-.08z"/>
      </svg>
    )
  }
];

export default function AboutPreviewPanel({
  workHistory = DEFAULT_WORK,
  education = DEFAULT_EDUCATION,
  contact = DEFAULT_CONTACT,
  onEditClick
}) {
  return (
    <div className="support-panel" aria-label="About tab preview">
      <div className="support-panel-header">
        <div className="sp-title">
          <span className="sp-title-bn">সম্পর্কে</span>
          <span className="sp-title-en">About</span>
        </div>
        <button
          className="sp-see-all"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={onEditClick}
        >
          সম্পাদনা · Edit
        </button>
      </div>

      <div className="about-section-label">কর্মজীবন · Work History</div>
      {workHistory.map((item, idx) => (
        <div className="about-entry" key={idx}>
          <div className={`about-entry-icon ${item.colorClass}`}>{item.icon}</div>
          <div className="about-entry-text">
            <div className="ae-title">{item.role}</div>
            <div className="ae-sub">{item.company}</div>
            <div className="ae-date">{item.date}</div>
          </div>
        </div>
      ))}

      <div className="about-section-label" style={{ marginTop: '8px' }}>শিক্ষা · Education</div>
      {education.map((item, idx) => (
        <div className="about-entry" key={idx}>
          <div className={`about-entry-icon ${item.colorClass}`}>{item.icon}</div>
          <div className="about-entry-text">
            <div className="ae-title">{item.degree}</div>
            <div className="ae-sub">{item.school}</div>
            <div className="ae-date">{item.date}</div>
          </div>
        </div>
      ))}

      <div className="about-section-label" style={{ marginTop: '8px' }}>যোগাযোগ · Contact</div>
      {contact.map((item, idx) => (
        <div className="contact-item" key={idx} style={idx === contact.length - 1 ? { marginBottom: '12px' } : {}}>
          {item.icon}
          <a href="#" className="contact-link" onClick={(e) => e.preventDefault()}>
            {item.value}
          </a>
        </div>
      ))}
    </div>
  );
}
