// ================================================================
// paymentGateway.js — Abstraction layer for payment gateway
//
// Currently uses mock endpoint for testing.
// To switch to real SSLCommerz:
//   1. Change PAYMENT_MODE to 'sslcommerz'
//   2. Create routes/payments/sslcommerz.js in backend
//   3. Uncomment sslcommerz routes in routes/paymentRoutes.js
//
// No component changes needed — they all call initiatePayment() from here.
// ================================================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '')
  || 'http://localhost:5000';

// TODO: Switch to 'sslcommerz' when real gateway is configured
const PAYMENT_MODE = 'mock';

/**
 * Initiate a payment for a subscription tier.
 *
 * @param {string} tierId - The subscription tier ID
 * @param {string} accessToken - Supabase auth token
 * @returns {Promise<{ checkoutUrl: string, transactionId: string, tier: object }>}
 */
export async function initiatePayment(tierId, accessToken) {
  if (PAYMENT_MODE === 'mock') {
    return mockInitPayment(tierId, accessToken);
  }

  // TODO: Implement real SSLCommerz init
  // return sslcommerzInitPayment(tierId, accessToken);
  throw new Error('Real SSLCommerz not yet configured');
}

/**
 * Confirm a mock payment outcome.
 * Only used in mock mode — real gateway uses webhook/IPN instead.
 *
 * @param {string} transactionId
 * @param {'success' | 'failure'} outcome
 * @param {string} accessToken
 * @returns {Promise<{ success: boolean, outcome: string }>}
 */
export async function confirmMockPayment(transactionId, outcome, accessToken) {
  if (PAYMENT_MODE !== 'mock') {
    throw new Error('confirmMockPayment only available in mock mode');
  }

  const response = await fetch(`${BACKEND_URL}/api/payments/mock/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ transactionId, outcome }),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Payment confirmation failed');
  return result;
}

// ── Mock implementation ──
async function mockInitPayment(tierId, accessToken) {
  const response = await fetch(`${BACKEND_URL}/api/payments/mock/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ tierId }),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Payment initialization failed');
  return result;
}

// ── Future: SSLCommerz implementation ──
// async function sslcommerzInitPayment(tierId, accessToken) {
//   const response = await fetch(`${BACKEND_URL}/api/payments/sslcommerz/init`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${accessToken}`,
//     },
//     body: JSON.stringify({ tierId }),
//   });
//
//   const result = await response.json();
//   if (!result.success) throw new Error(result.error || 'Payment initialization failed');
//   return result; // { paymentUrl, tranId }
// }
