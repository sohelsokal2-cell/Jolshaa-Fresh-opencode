import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MoneySettingsPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="settings-card">
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          পেমেন্ট ও উপার্জন
        </div>
        <div style={{ fontFamily: 'var(--font-en)', fontSize: 12, color: 'var(--text-light)', marginBottom: 24 }}>
          Payments & Earnings
        </div>

        <div style={{
          background: 'var(--bg-main)', borderRadius: 12, padding: 20, marginBottom: 24,
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            ক্রিয়েটর ড্যাশবোর্ড
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16, lineHeight: 1.6 }}>
            তোমার সাবস্ক্রিপশন টায়ার, আয়ের হিসাব, লেনদেনের ইতিহাস এবং পেআউট অনুরোধ এখানে দেখতে পারো।
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.6 }}>
            View your subscription tiers, earnings breakdown, transaction history, and payout requests.
          </div>
        </div>

        <button
          onClick={() => navigate('/creator-hub')}
          style={{
            padding: '12px 32px', borderRadius: 10, border: 'none',
            background: 'var(--teal)', color: 'white', fontWeight: 700,
            fontSize: 14, cursor: 'pointer', display: 'inline-flex',
            alignItems: 'center', gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
          ক্রিয়েটর ড্যাশবোর্ড খুলুন
        </button>

        <div style={{
          marginTop: 24, fontSize: 11, color: 'var(--text-xlight)',
          fontFamily: 'var(--font-en)',
        }}>
          Opens Creator Dashboard → /creator-hub
        </div>
      </div>
    </div>
  );
}
