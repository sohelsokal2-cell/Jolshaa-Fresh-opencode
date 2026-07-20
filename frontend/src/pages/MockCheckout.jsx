import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { confirmMockPayment } from '../lib/paymentGateway';
import Navbar from '../components/Navbar';

const BADGE_EMOJI = { bronze: '🥉', silver: '🥈', gold: '🏆' };

export default function MockCheckout() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | ready | processing | success | failure | error
  const [tier, setTier] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // We don't need to fetch tier info separately — the backend already
    // has the transaction. The mock checkout page just needs the transactionId.
    // For a better UX, we could fetch tier details, but for testing this is fine.
    setStatus('ready');
  }, [transactionId]);

  async function handleConfirm(outcome) {
    if (!session?.access_token) {
      setError('অনুগ্রহ করে আবার লগইন করুন');
      return;
    }

    setStatus('processing');
    setError('');

    try {
      await confirmMockPayment(transactionId, outcome, session.access_token);
      setStatus(outcome === 'success' ? 'success' : 'failure');
    } catch (err) {
      console.error('Mock confirm error:', err);
      setError(err.message || 'সমস্যা হয়েছে');
      setStatus('ready');
    }
  }

  return (
    <div className="settings-page">
      <Navbar />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)', padding: 24,
      }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: 40,
          maxWidth: 440, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}>
          {/* Header */}
          <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            মক পেমেন্ট চেকআউট
          </div>
          <div style={{ fontFamily: 'var(--font-en)', color: 'var(--text-xlight)', fontSize: 12, marginBottom: 24 }}>
            Mock Payment Checkout
          </div>

          {status === 'loading' && (
            <div style={{ color: 'var(--text-light)', padding: 20 }}>লোড হচ্ছে...</div>
          )}

          {status === 'ready' && (
            <>
              {/* Transaction Info */}
              <div style={{
                background: 'var(--bg-main)', borderRadius: 12, padding: 16, marginBottom: 24,
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-xlight)', marginBottom: 4, fontFamily: 'var(--font-en)' }}>
                  Transaction ID
                </div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-en)', wordBreak: 'break-all', color: 'var(--text-dark)' }}>
                  {transactionId}
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 24 }}>
                এটি একটি মক পেমেন্ট পেজ। নিচের বাটন দিয়ে পেমেন্ট সিমুলেট করুন।
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <button
                  onClick={() => handleConfirm('success')}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
                    background: 'var(--teal)', color: 'white', fontWeight: 700,
                    fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Simulate Success
                </button>
                <button
                  onClick={() => handleConfirm('failure')}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
                    background: 'var(--coral)', color: 'white', fontWeight: 700,
                    fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Simulate Failure
                </button>
              </div>

              {error && (
                <div style={{ color: 'var(--coral)', fontSize: 12, marginBottom: 8 }}>{error}</div>
              )}
            </>
          )}

          {status === 'processing' && (
            <div style={{ padding: 20 }}>
              <div className="spinner" />
              <div style={{ marginTop: 12, color: 'var(--text-light)' }}>প্রসেস হচ্ছে...</div>
            </div>
          )}

          {status === 'success' && (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)', marginBottom: 8 }}>
                পেমেন্ট সফল হয়েছে!
              </div>
              <div style={{ fontFamily: 'var(--font-en)', color: 'var(--text-light)', fontSize: 12, marginBottom: 24 }}>
                Payment Successful
              </div>
              <button
                onClick={() => navigate('/creator-hub')}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: 'var(--teal)', color: 'white', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                ড্যাশবোর্ডে ফিরে যান
              </button>
            </div>
          )}

          {status === 'failure' && (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--coral)', marginBottom: 8 }}>
                পেমেন্ট ব্যর্থ হয়েছে
              </div>
              <div style={{ fontFamily: 'var(--font-en)', color: 'var(--text-light)', fontSize: 12, marginBottom: 24 }}>
                Payment Failed
              </div>
              <button
                onClick={() => setStatus('ready')}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'white', color: 'var(--text-dark)', fontWeight: 600,
                  fontSize: 14, cursor: 'pointer', marginRight: 8,
                }}
              >
                আবার চেষ্টা করুন
              </button>
              <button
                onClick={() => navigate('/creator-hub')}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: 'var(--teal)', color: 'white', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                ড্যাশবোর্ডে ফিরে যান
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
