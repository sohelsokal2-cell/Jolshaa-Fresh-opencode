const supabase = require('../config/supabaseClient');
const crypto = require('crypto');

// =============================================
// Shared: activate subscription after payment
// (used by both mock confirm and future real webhook)
// =============================================
async function activateSubscription(transaction) {
  // Find which tier this payment was for
  let tier = null;
  if (transaction.tier_id) {
    const { data: foundTier } = await supabase
      .from('subscription_tiers')
      .select('id, creator_id')
      .eq('id', transaction.tier_id)
      .eq('is_active', true)
      .maybeSingle();
    tier = foundTier;
  } else {
    // Fallback for legacy transactions without tier_id
    const { data: foundTier } = await supabase
      .from('subscription_tiers')
      .select('id, creator_id')
      .eq('creator_id', transaction.creator_id)
      .eq('price_bdt', transaction.amount_bdt)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    tier = foundTier;
  }

  if (!tier) {
    console.error('[payment] No matching active tier found for transaction:', transaction.id);
    return null;
  }

  if (!transaction.subscriber_id) {
    console.error('[payment] Transaction missing subscriber_id:', transaction.id);
    return null;
  }

  // Check for existing active subscription to prevent duplicates
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('subscriber_id', transaction.subscriber_id)
    .eq('tier_id', tier.id)
    .eq('status', 'active')
    .maybeSingle();

  if (existingSub) {
    console.log('[payment] Active subscription already exists, skipping insert:', existingSub.id);
    return existingSub;
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      subscriber_id: transaction.subscriber_id,
      tier_id: tier.id,
      creator_id: transaction.creator_id,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single();

  if (subError) {
    console.error('[payment] Subscription create failed:', subError);
    return null;
  }

  return subscription;
}

// =============================================
// POST /api/payments/mock/init
// Authenticated: creates pending transaction, returns mock checkout URL
// =============================================
async function mockInitPayment(req, res) {
  try {
    const { tierId } = req.body;
    const userId = req.user.id;

    if (!tierId) {
      return res.status(400).json({ success: false, error: 'tierId is required' });
    }

    // Lookup tier price from DB (never trust client-sent amount)
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('id, creator_id, name, price_bdt, badge_tier')
      .eq('id', tierId)
      .eq('is_active', true)
      .single();

    if (tierError || !tier) {
      return res.status(404).json({ success: false, error: 'Tier not found or inactive' });
    }

    // Cannot subscribe to own tier
    if (tier.creator_id === userId) {
      return res.status(400).json({ success: false, error: 'Cannot subscribe to your own tier' });
    }

    // Create pending transaction
    const tranId = `mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        creator_id: tier.creator_id,
        subscriber_id: userId,
        tier_id: tier.id,
        type: 'subscription',
        amount_bdt: tier.price_bdt,
        gateway_transaction_id: tranId,
        status: 'pending',
      })
      .select('id')
      .single();

    if (txnError) {
      console.error('[mock init] Transaction create failed:', txnError);
      return res.status(500).json({ success: false, error: 'Failed to create transaction' });
    }

    // Return mock checkout URL (frontend will render a simple page)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const checkoutUrl = `${frontendUrl}/payment/mock/${transaction.id}`;

    return res.json({
      success: true,
      checkoutUrl,
      transactionId: transaction.id,
      tier: { name: tier.name, price: tier.price_bdt, badge: tier.badge_tier },
    });
  } catch (err) {
    console.error('[mock init] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

// =============================================
// POST /api/payments/mock/confirm
// body: { transactionId, outcome: 'success' | 'failure' }
// Simulates payment result — same logic as real webhook
// =============================================
async function mockConfirmPayment(req, res) {
  try {
    const { transactionId, outcome } = req.body;

    if (!transactionId || !['success', 'failure'].includes(outcome)) {
      return res.status(400).json({
        success: false,
        error: 'transactionId and outcome (success|failure) are required',
      });
    }

    // Find the pending transaction
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('id, creator_id, subscriber_id, tier_id, amount_bdt, status')
      .eq('id', transactionId)
      .eq('subscriber_id', req.user.id)
      .single();

    if (findError || !transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Idempotent: if already completed, return success without re-processing
    if (transaction.status === 'completed') {
      return res.json({ success: true, outcome: 'success' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Transaction is ${transaction.status}` });
    }

    if (outcome === 'success') {
      // Mark transaction completed
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('[mock confirm] Transaction update failed:', updateError);
        return res.status(500).json({ success: false, error: 'Failed to update transaction' });
      }

      // Activate subscription (shared logic with real webhook)
      await activateSubscription(transaction);

      console.log('[mock confirm] Payment confirmed:', transactionId);
      return res.json({ success: true, outcome: 'success' });
    } else {
      // Mark transaction failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      console.log('[mock confirm] Payment failed:', transactionId);
      return res.json({ success: true, outcome: 'failure' });
    }
  } catch (err) {
    console.error('[mock confirm] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

module.exports = { mockInitPayment, mockConfirmPayment, activateSubscription };
