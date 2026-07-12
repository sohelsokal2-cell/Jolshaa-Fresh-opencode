import React from 'react';

const NAV_ITEMS = [
  {
    section: 'Dashboard',
    items: [
      { id: 'overview', bn: 'সারসংক্ষেপ', en: 'Overview', iconBg: 'linear-gradient(135deg,var(--teal-xpale),var(--gold-pale))', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
      { id: 'earnings', bn: 'আয় বিবরণ', en: 'Earnings', iconBg: 'var(--gold-pale)', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
      { id: 'subscribers', bn: 'সাবস্ক্রাইবার', en: 'Subscribers', iconBg: 'var(--purple-pale)', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
      { id: 'analytics', bn: 'বিশ্লেষণ', en: 'Analytics', iconBg: 'var(--teal-xpale)', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    ],
  },
  {
    section: 'Monetization',
    items: [
      { id: 'payment', bn: 'পেমেন্ট পদ্ধতি', en: 'Payment Methods', iconBg: 'var(--blue-pale)', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 10h20"/></svg> },
      { id: 'tax', bn: 'ট্যাক্স ডকুমেন্ট', en: 'Tax Documents', iconBg: 'var(--green-pale)', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    ],
  },
];

export default function CreatorSidebar({ activeItem = 'overview', onItemChange }) {
  return (
    <aside className="sidebar-left">
      {/* Creator badge */}
      <div className="sb-creator-badge">
        <div className="scb-av">আ</div>
        <div>
          <div className="scb-name">আরিফ হোসেন</div>
          <div className="scb-badge">
            <span className="scb-badge-icon">⭐</span>
            <span className="scb-badge-text">VERIFIED CREATOR</span>
          </div>
        </div>
      </div>

      {NAV_ITEMS.map((group) => (
        <React.Fragment key={group.section}>
          <div className="sb-section-lbl">{group.section}</div>
          <div className="sb-nav">
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`sb-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => onItemChange?.(item.id)}
              >
                <div className="si-icon" style={{ background: item.iconBg }}>
                  {item.svg}
                </div>
                <div>
                  <div className="si-bn">{item.bn}</div>
                  <div className="si-en">{item.en}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="sb-divider" />
        </React.Fragment>
      ))}

      {/* Monthly summary mini card */}
      <div style={{ padding: '0 4px' }}>
        <div style={{
          background: 'linear-gradient(135deg,var(--teal-xpale),var(--gold-pale))',
          border: '1px solid rgba(212,160,23,0.15)',
          borderRadius: 12,
          padding: '12px 12px',
        }}>
          <div style={{ fontFamily: 'var(--font-bn)', fontSize: '11.5px', fontWeight: 700, color: 'var(--teal)', marginBottom: 6 }}>
            📊 এই মাসের সারসংক্ষেপ
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-light)' }}>Views</span>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-dark)' }}>2.4M</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-light)' }}>Engagement</span>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '10.5px', fontWeight: 700, color: 'var(--green)' }}>8.7%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: 10, color: 'var(--text-light)' }}>New Subs</span>
            <span style={{ fontFamily: 'var(--font-en)', fontSize: '10.5px', fontWeight: 700, color: 'var(--purple)' }}>+234</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
