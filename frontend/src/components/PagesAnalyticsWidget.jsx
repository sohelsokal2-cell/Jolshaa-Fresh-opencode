import React from 'react';

const DEFAULT_STATS = [
  {
    id: 1,
    value: '৫৬.৬K',
    titleBn: 'মোট অনুসারী',
    titleEn: 'Total Followers',
    trendDirection: 'up',
    trendValue: '+২.৪%'
  },
  {
    id: 2,
    value: '১৩.২K',
    titleBn: 'সাপ্তাহিক নাগাল',
    titleEn: 'Weekly Reach',
    trendDirection: 'up',
    trendValue: '+৫.১%'
  },
  {
    id: 3,
    value: '৩,২৮৭',
    titleBn: 'এনগেজমেন্ট',
    titleEn: 'Engagement',
    trendDirection: 'down',
    trendValue: '−১.২%'
  },
  {
    id: 4,
    value: '৩১',
    titleBn: 'এ মাসে পোস্ট',
    titleEn: 'Posts this month',
    trendDirection: 'up',
    trendValue: '+৮ new'
  }
];

export default function PagesAnalyticsWidget({
  stats = DEFAULT_STATS,
  onSeeAllClick
}) {
  return (
    <div className="analytics-card">
      <div className="ac-header">
        <div>
          <div className="ac-title-bn">সামগ্রিক পরিসংখ্যান</div>
          <div className="ac-title-en">Combined Analytics</div>
        </div>
        <button
          className="ac-see-all"
          onClick={onSeeAllClick}
        >
          See all
        </button>
      </div>

      <div className="ac-grid">
        {stats.map(stat => (
          <div className="ac-stat" key={stat.id}>
            <div className="ac-val">{stat.value}</div>
            <div className="ac-lbn">{stat.titleBn}</div>
            <div className="ac-len">{stat.titleEn}</div>
            <div className={`ac-trend ${stat.trendDirection === 'up' ? 'up' : 'dn'}`}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '2px' }}>
                {stat.trendDirection === 'up' ? (
                  <polyline points="18 15 12 9 6 15"/>
                ) : (
                  <polyline points="6 9 12 15 18 9"/>
                )}
              </svg>
              {stat.trendValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
