import React from 'react';
import { useToast } from '../Toast';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const name = user?.full_name || user?.name || 'ক্রিয়েটর';
  const initial = name.charAt(0);

  return (
    <div className="page-hdr">
      <div className="ph-left">
        <div className="ph-av">{initial}</div>
        <div>
          <div className="ph-title-bn">ক্রিয়েটর ড্যাশবোর্ড</div>
          <div className="ph-title-en">Creator Dashboard · Jolshaa Monetization Studio</div>
          <div className="ph-creator-row">
            <div className="ph-creator-name">{name}</div>
            <div className="verified-chip">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" strokeWidth="2.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="verified-chip-text">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ph-right">
        <button
          className="btn-share-stats"
          onClick={() => showToast('স্ট্যাটস শেয়ার লিংক কপি হয়েছে!')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          স্ট্যাটস শেয়ার
        </button>
        <button
          className="btn-payout-main"
          onClick={() => showToast('উত্তোলনের অনুরোধ পাঠানো হয়েছে!')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v14m0 0l-4-4m4 4l4-4M3 18h18"/></svg>
          উত্তোলনের অনুরোধ করো
        </button>
      </div>
    </div>
  );
}
