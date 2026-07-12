import React from 'react';
import { useToast } from '../Toast';

const TYPE_CONFIG = {
  ad: { iconClass: 'ti-ad', svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 17V7l5 10 5-10v10"/></svg> },
  subscription: { iconClass: 'ti-sub', svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  gift: { iconClass: 'ti-gift', svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.2" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="2"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg> },
  payout: { iconClass: 'ti-payout', svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2v14m0 0l-4-4m4 4l4-4M3 18h18"/></svg> },
  bonus: { iconClass: 'ti-bonus', svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
};

/**
 * TransactionsTable — transaction row list.
 *
 * Props:
 *  - transactions: [{ type, labelBn, labelEn, date, amount, direction }]
 *    direction: 'plus' | 'minus' | 'neutral'
 */
export default function TransactionsTable({ transactions }) {
  const { showToast } = useToast();

  return (
    <div className="txn-card">
      <div className="txn-hdr">
        <div>
          <div className="txnh-bn">সাম্প্রতিক লেনদেন</div>
          <div className="txnh-en">Recent Transactions</div>
        </div>
        <button
          className="btn-export"
          onClick={() => showToast('CSV ফাইল ডাউনলোড হচ্ছে...')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          CSV রপ্তানি করো
        </button>
      </div>

      {transactions.map((txn, i) => {
        const config = TYPE_CONFIG[txn.type] || TYPE_CONFIG.ad;
        const amountClass = txn.direction === 'plus' ? 'ta-plus' : txn.direction === 'minus' ? 'ta-minus' : 'ta-neutral';

        return (
          <div className="txn-row" key={i}>
            <div className={`txn-icon ${config.iconClass}`}>
              {config.svg}
            </div>
            <div className="txn-desc">
              <div className="td-bn">{txn.labelBn}</div>
              <div className="td-en">{txn.labelEn}</div>
            </div>
            <div className="txn-date">{txn.date}</div>
            <div className={`txn-amount ${amountClass}`}>
              {txn.direction === 'plus' ? '+' : txn.direction === 'minus' ? '−' : ''}{txn.amount}
            </div>
          </div>
        );
      })}
    </div>
  );
}
