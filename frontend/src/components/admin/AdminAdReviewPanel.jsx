import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { fetchAds, approveAd, rejectAd } from '../../lib/adminApi';

const REJECT_REASONS = [
  { value: 'inappropriate', label: 'অনুপযুক্ত কন্টেন্ট', en: 'Inappropriate content' },
  { value: 'misinformation', label: 'ভুয়া তথ্য', en: 'Misinformation' },
  { value: 'broken_link', label: 'ভাঙা লিংক', en: 'Broken link' },
  { value: 'policy_violation', label: 'বাজেট নীতিমালা লঙ্ঘন', en: 'Policy violation' },
  { value: 'spam', label: 'স্প্যাম', en: 'Spam' },
  { value: 'other', label: 'অন্যান্য', en: 'Other' },
];

const STATUS_TABS = [
  { id: 'pending', bn: 'পেন্ডিং', en: 'Pending' },
  { id: 'approved', bn: 'অনুমোদিত', en: 'Approved' },
  { id: 'rejected', bn: 'প্রত্যাখ্যাত', en: 'Rejected' },
  { id: 'active', bn: 'সক্রিয়', en: 'Active' },
  { id: 'all', bn: 'সব', en: 'All' },
];

export default function AdminAdReviewPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [processing, setProcessing] = useState(null);

  const loadAds = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchAds({ statusFilter: activeTab });
      setAds(data);
    } catch (err) {
      showToast(err.message || 'Failed to load ads', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => { loadAds(); }, [loadAds]);

  const handleApprove = async (adId) => {
    setProcessing(adId);
    try {
      await approveAd(adId);
      setAds(prev => prev.filter(a => a.id !== adId));
      showToast('বিজ্ঞাপন অনুমোদিত হয়েছে', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve ad', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const finalReason = rejectReason === 'other' ? customReason : REJECT_REASONS.find(r => r.value === rejectReason)?.label || rejectReason;
    if (!finalReason.trim()) {
      showToast('অনুগ্রহ করে একটি কারণ দিন', 'error');
      return;
    }
    setProcessing(rejectModal.id);
    try {
      await rejectAd(rejectModal.id, finalReason);
      setAds(prev => prev.filter(a => a.id !== rejectModal.id));
      setRejectModal(null);
      setRejectReason('');
      setCustomReason('');
      showToast('বিজ্ঞাপন প্রত্যাখ্যাত হয়েছে', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reject ad', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (ad) => {
    setRejectModal(ad);
    setRejectReason('');
    setCustomReason('');
  };

  return (
    <div className="admin-panel-section">
      <div className="aps-header">
        <div>
          <div className="aps-title">বিজ্ঞাপন রিভিউ</div>
          <div className="aps-sub">Ad Review Queue</div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="aps-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            className={`aps-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="aps-tab-bn">{tab.bn}</span>
            <span className="aps-tab-en">{tab.en}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="aps-loading">
          <div className="aps-spinner"></div>
          <span>লোড হচ্ছে...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && ads.length === 0 && (
        <div className="aps-empty">
          <div className="aps-empty-icon">📢</div>
          <div className="aps-empty-bn">কোনো বিজ্ঞাপন নেই</div>
          <div className="aps-empty-en">No ads found for this filter</div>
        </div>
      )}

      {/* Ad Cards */}
      {!loading && ads.length > 0 && (
        <div className="ads-list">
          {ads.map(ad => (
            <div key={ad.id} className="ad-card">
              <div className="ad-card-header">
                <div className="ad-preview">
                  {ad.image_url ? (
                    <img src={ad.image_url} alt={ad.title} className="ad-thumb" />
                  ) : (
                    <div className="ad-thumb-placeholder">📢</div>
                  )}
                </div>
                <div className="ad-info">
                  <div className="ad-title">{ad.title}</div>
                  {ad.description && <div className="ad-desc">{ad.description}</div>}
                  <div className="ad-meta">
                    {ad.target_url && (
                      <span className="ad-meta-item">
                        🔗 {ad.target_url}
                      </span>
                    )}
                    <span className="ad-meta-item">
                      💰 ৳{Number(ad.budget).toLocaleString()}
                    </span>
                    {ad.start_date && (
                      <span className="ad-meta-item">
                        📅 {ad.start_date} → {ad.end_date || '—'}
                      </span>
                    )}
                  </div>
                  {ad.advertiser && (
                    <div className="ad-advertiser">
                      <span className="ad-adv-name">{ad.advertiser.name}</span>
                      <span className="ad-adv-email">{ad.advertiser.email}</span>
                    </div>
                  )}
                  {ad.status === 'rejected' && ad.rejection_reason && (
                    <div className="ad-rejection-reason">
                      কারণ: {ad.rejection_reason}
                    </div>
                  )}
                </div>
              </div>

              {ad.status === 'pending' && (
                <div className="ad-actions">
                  <button
                    className="ad-btn approve"
                    onClick={() => handleApprove(ad.id)}
                    disabled={processing === ad.id}
                  >
                    {processing === ad.id ? '...' : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        অনুমোদন · Approve
                      </>
                    )}
                  </button>
                  <button
                    className="ad-btn reject"
                    onClick={() => openRejectModal(ad)}
                    disabled={processing === ad.id}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    প্রত্যাখ্যান · Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-backdrop" onClick={() => setRejectModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">বিজ্ঞাপন প্রত্যাখ্যান</div>
              <button className="modal-close" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-ad-title">"{rejectModal.title}"</div>
              <div className="modal-label">কারণ নির্বাচন করুন:</div>
              <div className="reject-reasons">
                {REJECT_REASONS.map(reason => (
                  <label key={reason.value} className="reject-option">
                    <input
                      type="radio"
                      name="rejectReason"
                      value={reason.value}
                      checked={rejectReason === reason.value}
                      onChange={() => setRejectReason(reason.value)}
                    />
                    <div className="reject-radio"></div>
                    <div>
                      <div className="reject-bn">{reason.label}</div>
                      <div className="reject-en">{reason.en}</div>
                    </div>
                  </label>
                ))}
              </div>
              {rejectReason === 'other' && (
                <textarea
                  className="reject-custom"
                  placeholder="কারণ লিখুন..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  rows={3}
                />
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setRejectModal(null)}>বাতিল</button>
              <button
                className="modal-btn confirm-reject"
                onClick={handleReject}
                disabled={!rejectReason || processing === rejectModal.id}
              >
                {processing === rejectModal.id ? '...' : 'প্রত্যাখ্যান করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
