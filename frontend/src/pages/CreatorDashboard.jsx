import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreatorSidebar from '../components/creator/CreatorSidebar';
import DashboardHeader from '../components/creator/DashboardHeader';
import StatCard from '../components/creator/StatCard';
import EarningsChart from '../components/creator/EarningsChart';
import RevenueBreakdown from '../components/creator/RevenueBreakdown';
import SubscriptionTierCard from '../components/creator/SubscriptionTierCard';
import TransactionsTable from '../components/creator/TransactionsTable';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  getCreatorEarnings,
  getRevenueBreakdown,
  getEarningsChart,
  getCreatorSubscriberCount,
  fetchTiers,
  getRecentTransactions,
  getCreatorStatus,
} from '../lib/monetizationApi';
import './CreatorDashboard.css';

function formatBDT(amount) {
  if (amount === null || amount === undefined) return '0';
  const num = Number(amount);
  if (num >= 100000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toLocaleString('bn-BD');
}

const TYPE_MAP = {
  ad_revenue: 'ad',
  subscription: 'subscription',
  gift: 'gift',
  payout: 'payout',
};

const REVENUE_COLORS = {
  ad_revenue: 'var(--teal)',
  subscription: 'var(--gold)',
  gift: 'var(--coral)',
};

const REVENUE_LABELS = {
  ad_revenue: { bn: 'বিজ্ঞাপন', en: 'Ad Revenue' },
  subscription: { bn: 'সাবস্ক্রিপশন', en: 'Subscriptions' },
  gift: { bn: 'উপহার / গিফট', en: 'Gifts' },
};

const BADGE_EMOJI = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🏆',
};

const BADGE_NAMES = {
  bronze: { bn: 'ব্রোঞ্জ সদস্য', en: 'Bronze Member' },
  silver: { bn: 'সিলভার সদস্য', en: 'Silver Member' },
  gold: { bn: 'গোল্ড সদস্য', en: 'Gold Member' },
};

export default function CreatorDashboard() {
  const [activeItem, setActiveItem] = useState('overview');
  const { user } = useAuth();
  const { showToast } = useToast();

  const [earnings, setEarnings] = useState(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [tiers, setTiers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorStatus, setCreatorStatus] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    async function loadDashboard() {
      try {
        setLoading(true);
        const [
          earningsData,
          breakdownData,
          chartResult,
          subCount,
          tiersData,
          txnData,
          statusData,
        ] = await Promise.all([
          getCreatorEarnings(user.id),
          getRevenueBreakdown(user.id),
          getEarningsChart(user.id, 30),
          getCreatorSubscriberCount(user.id),
          fetchTiers(user.id),
          getRecentTransactions(user.id, 6),
          getCreatorStatus(user.id),
        ]);

        setEarnings(earningsData);
        setRevenueBreakdown(breakdownData);
        setChartData(chartResult);
        setSubscriberCount(subCount);
        setTiers(tiersData);
        setTransactions(txnData);
        setCreatorStatus(statusData);
      } catch (err) {
        console.error('Dashboard load error:', err);
        showToast('ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user?.id]);

  // Format stat cards
  const statCards = earnings
    ? [
        {
          variant: 'total',
          label: { bn: 'মোট আয়', en: 'TOTAL EARNINGS (LIFETIME)' },
          amount: formatBDT(earnings.total_earnings),
        },
        {
          variant: 'available',
          label: { bn: 'উত্তোলনযোগ্য ব্যালেন্স', en: 'AVAILABLE BALANCE' },
          amount: formatBDT(earnings.available_balance),
          showPayoutBtn: true,
        },
        {
          variant: 'pending',
          label: { bn: 'মুলতুবি ব্যালেন্স', en: 'PENDING BALANCE' },
          amount: formatBDT(earnings.pending_balance),
          subtitle: 'Clears in 7–14 days',
        },
        {
          variant: 'month',
          label: { bn: 'এই মাসের আয়', en: "THIS MONTH'S EARNINGS" },
          amount: formatBDT(earnings.this_month_earnings),
        },
      ]
    : [];

  // Format revenue segments
  const totalRevenue = revenueBreakdown.reduce((sum, r) => sum + Number(r.amount), 0);
  const revenueSegments = revenueBreakdown.map((r) => ({
    id: r.type,
    labelBn: REVENUE_LABELS[r.type]?.bn || r.type,
    labelEn: REVENUE_LABELS[r.type]?.en || r.type,
    color: REVENUE_COLORS[r.type] || 'var(--text-light)',
    percent: totalRevenue > 0 ? Math.round((Number(r.amount) / totalRevenue) * 100) : 0,
    amount: `৳${Number(r.amount).toLocaleString()}`,
  }));

  // Format transactions
  const formattedTransactions = transactions.map((txn) => {
    const dateStr = new Date(txn.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return {
      type: TYPE_MAP[txn.type] || 'ad',
      labelBn: txn.type === 'ad_revenue'
        ? 'বিজ্ঞাপন আয়'
        : txn.type === 'subscription'
        ? 'সাবস্ক্রিপশন আয়'
        : txn.type === 'gift'
        ? 'গিফট আয়'
        : 'পেআউট',
      labelEn: txn.type === 'ad_revenue'
        ? 'Ad Revenue'
        : txn.type === 'subscription'
        ? 'Subscription Income'
        : txn.type === 'gift'
        ? 'Gift Income'
        : 'Payout',
      date: dateStr,
      amount: `৳${txn.amount_bdt.toLocaleString()}`,
      direction: txn.type === 'payout' ? 'minus' : 'plus',
    };
  });

  // Format tiers
  const formattedTiers = tiers.map((tier) => ({
    variant: tier.badge_tier,
    name: BADGE_NAMES[tier.badge_tier]?.bn || tier.name,
    nameEn: BADGE_NAMES[tier.badge_tier]?.en || tier.name,
    price: tier.price_bdt,
    subscribers: tier.subscriberCount || 0,
    monthlyEarning: formatBDT(tier.price_bdt * (tier.subscriberCount || 0)),
    perks: tier.perks_description || 'এক্সক্লুসিভ কনটেন্ট',
    badge: BADGE_EMOJI[tier.badge_tier] || '🏅',
    tierId: tier.id,
  }));

  if (loading) {
    return (
      <div className="settings-page">
        <Navbar />
        <div className="page-body">
          <CreatorSidebar activeItem={activeItem} onItemChange={setActiveItem} />
          <main className="creator-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>
              <div className="spinner" />
              <div style={{ marginTop: 12 }}>লোড হচ্ছে...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!creatorStatus?.is_monetization_enabled) {
    return (
      <div className="settings-page">
        <Navbar />
        <div className="page-body">
          <CreatorSidebar activeItem={activeItem} onItemChange={setActiveItem} />
          <main className="creator-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>ক্রিয়েটর ড্যাশবোর্ড</div>
              <div style={{ color: 'var(--text-light)', marginBottom: 16 }}>
                মনিটাইজেশন সক্রিয় করতে অ্যাডমিনের কাছে আবেদন করুন।
              </div>
              <div style={{ fontFamily: 'var(--font-en)', color: 'var(--text-xlight)', fontSize: 12 }}>
                Contact admin to enable monetization.
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Navbar />

      <div className="page-body">
        <CreatorSidebar activeItem={activeItem} onItemChange={setActiveItem} />

        <main className="creator-main">
          <DashboardHeader />

          {/* Stat cards */}
          <div className="stat-grid">
            {statCards.map((card) => (
              <StatCard key={card.variant} {...card} />
            ))}
          </div>

          {/* Chart row */}
          <div className="chart-row">
            <EarningsChart chartData={chartData} />
            <RevenueBreakdown segments={revenueSegments} total={`৳${formatBDT(totalRevenue)}`} />
          </div>

          {/* Subscription tiers */}
          <div className="section-hdr">
            <div>
              <div className="sech-bn">তোমার সাবস্ক্রিপশন টায়ার</div>
              <div className="sech-en">Your Subscription Tiers · Active plans</div>
            </div>
          </div>

          <div className="tiers-grid">
            {formattedTiers.length > 0 ? (
              formattedTiers.map((tier) => (
                <SubscriptionTierCard key={tier.tierId} {...tier} />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24, color: 'var(--text-light)' }}>
                এখনো কোনো টায়ার তৈরি হয়নি।
              </div>
            )}
          </div>

          {/* Transactions */}
          <TransactionsTable transactions={formattedTransactions} />
        </main>
      </div>
    </div>
  );
}
