import React from 'react';
import { useToast } from '../Toast';

/**
 * SubscriptionTierCard — reusable tier card.
 *
 * Props:
 *  - variant: 'bronze' | 'silver' | 'gold'
 *  - name: string (Bn name)
 *  - nameEn: string
 *  - price: number
 *  - subscribers: number
 *  - monthlyEarning: string
 *  - perks: string
 *  - badge: string (emoji)
 */
export default function SubscriptionTierCard({ variant, name, nameEn, price, subscribers, monthlyEarning, perks, badge }) {
  const { showToast } = useToast();

  const cardClass = `tier-card tc-${variant}`;
  const badgeIconClass = `tc-badge-icon tbi-${variant}`;

  return (
    <div className={cardClass}>
      <div className={badgeIconClass}>{badge}</div>
      <div className="tc-name">{name}</div>
      <div className="tc-name-en">{nameEn}</div>
      <div className="tc-price">
        ৳<span>{price}</span>
        <span className="tc-per">/মাস</span>
      </div>
      <div className="tc-stats">
        <div className="tcs-item">
          <div className="tcs-val">{subscribers}</div>
          <div className="tcs-lbl">সাবস্ক্রাইবার</div>
        </div>
        <div className="tcs-item">
          <div className="tcs-val">৳{monthlyEarning}</div>
          <div className="tcs-lbl">মাসিক আয়</div>
        </div>
      </div>
      <div className="tc-earning">{perks}</div>
      <button
        className="btn-edit-tier"
        onClick={() => showToast('টায়ার সম্পাদনা করছেন...')}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
        </svg>
        সম্পাদনা করো
      </button>
    </div>
  );
}
