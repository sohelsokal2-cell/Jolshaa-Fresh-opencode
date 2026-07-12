import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CreatorSidebar from '../components/creator/CreatorSidebar';
import DashboardHeader from '../components/creator/DashboardHeader';
import StatCard from '../components/creator/StatCard';
import EarningsChart from '../components/creator/EarningsChart';
import RevenueBreakdown from '../components/creator/RevenueBreakdown';
import SubscriptionTierCard from '../components/creator/SubscriptionTierCard';
import TransactionsTable from '../components/creator/TransactionsTable';
import { useToast } from '../components/Toast';
import './CreatorDashboard.css';

/* ─── Demo data (to be replaced with backend/Supabase data) ─── */

const STAT_CARDS = [
  {
    variant: 'total',
    label: { bn: 'মোট আয়', en: 'TOTAL EARNINGS (LIFETIME)' },
    amount: '1,24,850',
    subtitle: 'Since January 2024',
  },
  {
    variant: 'available',
    label: { bn: 'উত্তোলনযোগ্য ব্যালেন্স', en: 'AVAILABLE BALANCE' },
    amount: '18,450',
    showPayoutBtn: true,
  },
  {
    variant: 'pending',
    label: { bn: 'মুলতুবি ব্যালেন্স', en: 'PENDING BALANCE' },
    amount: '6,200',
    subtitle: 'Clears in 7–14 days',
  },
  {
    variant: 'month',
    label: { bn: 'এই মাসের আয়', en: 'THIS MONTH\'S EARNINGS' },
    amount: '9,340',
    change: { direction: 'up', text: '+23.4% vs last month' },
  },
];

const REVENUE_SEGMENTS = [
  { id: 'ads', labelBn: 'বিজ্ঞাপন', labelEn: 'Ad Revenue', color: 'var(--teal)', percent: 52, amount: '৳4,857' },
  { id: 'subs', labelBn: 'সাবস্ক্রিপশন', labelEn: 'Subscriptions', color: 'var(--gold)', percent: 35, amount: '৳3,269' },
  { id: 'gifts', labelBn: 'উপহার / গিফট', labelEn: 'Gifts', color: 'var(--coral)', percent: 13, amount: '৳1,214' },
];

const TIERS = [
  {
    variant: 'bronze', name: 'ব্রোঞ্জ সদস্য', nameEn: 'Bronze Member',
    price: 99, subscribers: 142, monthlyEarning: '14k',
    perks: '🔒 এক্সক্লুসিভ পোস্ট + আর্লি অ্যাক্সেস', badge: '🥉',
  },
  {
    variant: 'silver', name: 'সিলভার সদস্য', nameEn: 'Silver Member',
    price: 249, subscribers: 58, monthlyEarning: '14.4k',
    perks: '🎬 লাইভ সেশন + Q&A + ব্যাজ', badge: '🥈',
  },
  {
    variant: 'gold', name: 'গোল্ড সদস্য', nameEn: 'Gold Member · Premium',
    price: 599, subscribers: 24, monthlyEarning: '14.4k',
    perks: '⭐ সব কিছু + সরাসরি মেসেজ + শাউটআউট', badge: '🏆',
  },
];

const TRANSACTIONS = [
  { type: 'ad', labelBn: 'বিজ্ঞাপন আয় — জুলাই ১ম সপ্তাহ', labelEn: 'Ad Revenue · Week 1, July 2025', date: 'Jul 7, 2025', amount: '৳2,140', direction: 'plus' },
  { type: 'subscription', labelBn: 'নতুন সাবস্ক্রাইবার — গোল্ড টায়ার (৩ জন)', labelEn: 'New Subscribers · Gold Tier × 3', date: 'Jul 6, 2025', amount: '৳1,797', direction: 'plus' },
  { type: 'gift', labelBn: 'লাইভ গিফট — "বাউল সন্ধ্যা" সেশন', labelEn: 'Live Gifts · Baul Evening Session', date: 'Jul 5, 2025', amount: '৳890', direction: 'plus' },
  { type: 'payout', labelBn: 'পেআউট সম্পন্ন — বিকাশে স্থানান্তর', labelEn: 'Payout Completed · Transfer to bKash', date: 'Jul 4, 2025', amount: '৳10,000', direction: 'minus' },
  { type: 'bonus', labelBn: 'পারফরম্যান্স বোনাস — জলশা ক্রিয়েটর ফান্ড', labelEn: 'Performance Bonus · Jolshaa Creator Fund', date: 'Jul 1, 2025', amount: '৳500', direction: 'plus' },
  { type: 'ad', labelBn: 'বিজ্ঞাপন আয় — জুন ৪র্থ সপ্তাহ', labelEn: 'Ad Revenue · Week 4, June 2025', date: 'Jun 30, 2025', amount: '৳1,940', direction: 'plus' },
];

export default function CreatorDashboard() {
  const [activeItem, setActiveItem] = useState('overview');
  const { showToast } = useToast();

  return (
    <div className="settings-page">
      <Navbar />

      <div className="page-body">
        <CreatorSidebar activeItem={activeItem} onItemChange={setActiveItem} />

        <main className="creator-main">
          <DashboardHeader />

          {/* Stat cards */}
          <div className="stat-grid">
            {STAT_CARDS.map((card) => (
              <StatCard key={card.variant} {...card} />
            ))}
          </div>

          {/* Chart row */}
          <div className="chart-row">
            <EarningsChart />
            <RevenueBreakdown segments={REVENUE_SEGMENTS} total="৳9.3k" />
          </div>

          {/* Subscription tiers */}
          <div className="section-hdr">
            <div>
              <div className="sech-bn">তোমার সাবস্ক্রিপশন টায়ার</div>
              <div className="sech-en">Your Subscription Tiers · Active plans</div>
            </div>
            <button
              className="btn-new-tier"
              onClick={() => showToast('নতুন টায়ার তৈরির ফর্ম খুলছে...')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              নতুন টায়ার / New Tier
            </button>
          </div>

          <div className="tiers-grid">
            {TIERS.map((tier) => (
              <SubscriptionTierCard key={tier.variant} {...tier} />
            ))}
          </div>

          {/* Transactions */}
          <TransactionsTable transactions={TRANSACTIONS} />
        </main>
      </div>
    </div>
  );
}
