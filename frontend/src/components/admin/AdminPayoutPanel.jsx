import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { fetchPayouts, startPayout, completePayout } from '../../lib/adminApi';

const METHOD_LABELS = {
  bkash: { bn: 'bKash', icon: '📱' },
  nagad: { bn: 'Nagad', icon: '📱' },
  rocket: { bn: 'Rocket', icon: '🚀' },
  bank: { bn: 'ব্যাংক ট্রান্সফার', en: 'Bank Transfer', icon: '🏦' },
};

const STATUS_TABS = [
  { id: 'pending', bn: 'পেন্ডিং', en: 'Pending' },
  { id: 'processing', bn: 'প্রক্রিয়াধীন', en: 'Processing' },
  { id: 'completed', bn: 'সম্পন্ন', en: 'Completed' },
  { id: 'all', bn: 'সব', en: 'All' },
];

export default function AdminPayoutPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [completeModal, setCompleteModal] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(null);

  const loadPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchPayouts({ statusFilter: activeTab });
      setPayouts(data);
    } catch (err) {
      showToast(err.message || 'Failed to load payouts', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => { loadPayouts(); }, [loadPayouts]);

  const handleStart = async (payoutId) => {
    setProcessing(payoutId);
    try {
      await startPayout(payoutId);
      setPayouts(prev => prev.map(p =>
        p.id === payoutId ? { ...p, status: 'processing', processed_by: user.id } : p
      ));
      showToast('পেআউট প্রক্রিয়া শুরু হয়েছে', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to start payout', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async () => {
    if (!completeModal) return;
    if (!transactionRef.trim()) {
      showToast('অনুগ্রহ করে ট্রান্সজেকশন রেফারেন্স দিন', 'error');
      return;
    }
    setProcessing(completeModal.id);
    try {
      await completePayout(completeModal.id, transactionRef.trim(), adminNote.trim());
      setPayouts(prev => prev.map(p =>
        p.id === completeModal.id
          ? { ...p, status: 'completed', transaction_ref: transactionRef.trim(), processed_at: new Date().toISOString() }
          : p
      ));
      setCompleteModal(null);
      setTransactionRef('');
      setAdminNote('');
      showToast('পেআউট সম্পন্ন হয়েছে', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to complete payout', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const openCompleteModal = (payout) => {
    setCompleteModal(payout);
    setTransactionRef('');
    setAdminNote('');
  };

  return (
    <div className="admin-panel-section">
      <div className="aps-header">
        <div>
          <div className="aps-title">পেআউট ব্যবস্থাপনা</div>
          <div className="aps-sub">Payout Processing</div>
        </div>
      </div>

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

      {loading && (
        <div className="aps-loading">
          <div className="aps-spinner"></div>
          <span>লোড হচ্ছে...</span>
        </div>
      )}

      {!loading && payouts.length === 0 && (
        <div className="aps-empty">
          <div className="aps-empty-icon">💰</div>
          <div className="aps-empty-bn">কোনো পেআউট রিকোয়েস্ট নেই</div>
          <div className="aps-empty-en">No payout requests for this filter</div>
        </div>
      )}

      {!loading && payouts.length > 0 && (
        <div className="payouts-list">
          {payouts.map(payout => {
            const method = METHOD_LABELS[payout.payout_method] || { bn: payout.payout_method, icon: '💳' };
            return (
              <div key={payout.id} className={`payout-card status-${payout.status}`}>
                <div className="payout-card-header">
                  <div className="payout-creator">
                    <div className="payout-av">
                      {payout.creator?.profile_photo_url ? (
                        <img src={payout.creator.profile_photo_url} alt="" />
                      ) : (
                        <span>{payout.creator?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div>
                      <div className="payout-name">{payout.creator?.name || 'Unknown'}</div>
                      <div className="payout-email">{payout.creator?.email}</div>
                    </div>
                  </div>
                  <div className="payout-amount">
                    ৳{Number(payout.amount_bdt).toLocaleString()}
                    <span className="payout-currency">{payout.currency || 'BDT'}</span>
                  </div>
                </div>

                <div className="payout-details">
                  <div className="payout-method">{method.icon} {method.bn}</div>
                  <div className="payout-account">অ্যাকাউন্ট: {payout.payout_account_details}</div>
                  <div className="payout-date">অনুরোধ: {new Date(payout.requested_at).toLocaleDateString('bn-BD')}</div>
                  {payout.transaction_ref && <div className="payout-ref">রেফারেন্স: {payout.transaction_ref}</div>}
                  {payout.admin_note && <div className="payout-note">নোট: {payout.admin_note}</div>}
                </div>

                <div className="payout-status-badge">
                  {payout.status === 'pending' && '⏳ পেন্ডিং'}
                  {payout.status === 'processing' && '🔄 প্রক্রিয়াধীন'}
                  {payout.status === 'completed' && '✅ সম্পন্ন'}
                  {payout.status === 'rejected' && '❌ প্রত্যাখ্যাত'}
                </div>

                <div className="payout-actions">
                  {payout.status === 'pending' && (
                    <button
                      className="payout-btn start"
                      onClick={() => handleStart(payout.id)}
                      disabled={processing === payout.id}
                    >
                      {processing === payout.id ? '...' : '🔄 প্রক্রিয়া শুরু করুন'}
                    </button>
                  )}
                  {(payout.status === 'pending' || payout.status === 'processing') && (
                    <button
                      className="payout-btn complete"
                      onClick={() => openCompleteModal(payout)}
                      disabled={processing === payout.id}
                    >
                      ✅ সম্পন্ন চিহ্নিত করুন
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completeModal && (
        <div className="modal-backdrop" onClick={() => setCompleteModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">পেআউট সম্পন্ন করুন</div>
              <button className="modal-close" onClick={() => setCompleteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-payout-summary">
                <span>{completeModal.creator?.name}</span> — ৳{Number(completeModal.amount_bdt).toLocaleString()}
              </div>
              <div className="modal-label">ট্রান্সজেকশন রেফারেন্স / Transaction ID *</div>
              <input
                type="text"
                className="modal-input"
                placeholder="bKash/Nagad transaction ID"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
              />
              <div className="modal-label">অ্যাডমিন নোট (ঐচ্ছিক)</div>
              <textarea
                className="modal-textarea"
                placeholder="কোনো নোট থাকলে লিখুন..."
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={2}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setCompleteModal(null)}>বাতিল</button>
              <button
                className="modal-btn confirm"
                onClick={handleComplete}
                disabled={!transactionRef.trim() || processing === completeModal.id}
              >
                {processing === completeModal.id ? '...' : 'সম্পন্ন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
