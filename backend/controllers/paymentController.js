const supabase = require('../config/supabaseClient');
const crypto = require('crypto');

// SSLCommerz sandbox/production config
const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const SSLCOMMERZ_STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
const SSLCOMMERZ_IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === 'true';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

function getSSLCommerzUrl() {
  return SSLCOMMERZ_IS_LIVE
    ? 'https://secure.pay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
}

function getValidationUrl() {
  return SSLCOMMERZ_IS_LIVE
    ? 'https://secure.pay.sslcommerz.com/validator/api/validationserverAPI.php'
    : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
}

// POST /api/payments/sslcommerz/init
async function initPayment(req, res) {
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
    const tranId = `jolshaa_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
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
      console.error('[payment init] Transaction create failed:', txnError);
      return res.status(500).json({ success: false, error: 'Failed to create transaction' });
    }

    // Build SSLCommerz session payload
    const successUrl = `${FRONTEND_URL}/payment/success?tran_id=${tranId}`;
    const failUrl = `${FRONTEND_URL}/payment/fail?tran_id=${tranId}`;
    const cancelUrl = `${FRONTEND_URL}/payment/cancel?tran_id=${tranId}`;
    const ipnUrl = `${BACKEND_URL}/api/payments/sslcommerz/webhook`;

    const payload = {
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASSWORD,
      total_amount: tier.price_bdt,
      currency: 'BDT',
      tran_id: tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: ipnUrl,
      product_name: `${tier.name} Subscription`,
      product_category: 'Subscription',
      product_profile: 'non-explicable',
      cus_name: req.user.name || 'Customer',
      cus_email: req.user.email || '',
      cus_phone: req.user.phone || '',
      ship_method: 'NO',
    };

    // Send to SSLCommerz
    const response = await fetch(getSSLCommerzUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload).toString(),
    });

    const result = await response.json();

    if (result.status === 'SUCCESS' && result.SessionKey) {
      return res.json({
        success: true,
        paymentUrl: `${getSSLCommerzUrl()}/gatewaypayment?SessionKey=${result.SessionKey}`,
        tranId,
      });
    }

    console.error('[payment init] SSLCommerz error:', result);
    return res.status(500).json({ success: false, error: 'Payment gateway initialization failed' });
  } catch (err) {
    console.error('[payment init] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

// POST /api/payments/sslcommerz/webhook (IPN)
async function handleWebhook(req, res) {
  try {
    const {
      tran_id,
      status,
      amount,
      val_id,
    } = req.body;

    console.log('[webhook] Received:', { tran_id, status, amount, val_id });

    if (!tran_id || !status || !val_id) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate with SSLCommerz validation API (never trust webhook alone)
    {
      const validatePayload = {
        store_id: SSLCOMMERZ_STORE_ID,
        store_passwd: SSLCOMMERZ_STORE_PASSWORD,
        val_id: val_id,
      };

      const validationRes = await fetch(getValidationUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(validatePayload).toString(),
      });

      const validationResult = await validationRes.json();

      if (validationResult.status !== 'VALID' && validationResult.status !== 'VALIDATED') {
        console.error('[webhook] Validation failed:', validationResult);
        return res.status(400).json({ success: false, error: 'Validation failed' });
      }

      // Use validated amount from SSLCommerz, not from webhook payload
      if (String(validationResult.amount) !== String(amount)) {
        console.error('[webhook] Amount mismatch:', { webhook: amount, validated: validationResult.amount });
        return res.status(400).json({ success: false, error: 'Amount mismatch' });
      }
    }

    // Find the transaction (don't filter by status — handle duplicates idempotently)
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('id, creator_id, subscriber_id, tier_id, amount_bdt, status, related_subscription_id')
      .eq('gateway_transaction_id', tran_id)
      .single();

    if (findError || !transaction) {
      console.error('[webhook] Transaction not found:', tran_id);
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Idempotent: if already completed, return 200 to stop SSLCommerz retries
    if (transaction.status === 'completed') {
      console.log('[webhook] Transaction already completed, skipping:', tran_id);
      return res.json({ success: true });
    }

    if (transaction.status !== 'pending') {
      console.log('[webhook] Transaction is', transaction.status, tran_id);
      return res.json({ success: true });
    }

    if (status === 'VALID' || status === 'VALIDATED') {
      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('[webhook] Transaction update failed:', updateError);
        return res.status(500).json({ success: false, error: 'Failed to update transaction' });
      }

      // Create/activate subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Find which tier this payment was for
      let tier = null;
      if (transaction.tier_id) {
        const { data: foundTier } = await supabase
          .from('subscription_tiers')
          .select('id')
          .eq('id', transaction.tier_id)
          .eq('is_active', true)
          .maybeSingle();
        tier = foundTier;
      } else {
        // Fallback for legacy transactions without tier_id
        const { data: foundTier } = await supabase
          .from('subscription_tiers')
          .select('id')
          .eq('creator_id', transaction.creator_id)
          .eq('price_bdt', transaction.amount_bdt)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        tier = foundTier;
      }

      if (tier) {
        if (!transaction.subscriber_id) {
          console.error('[webhook] Transaction missing subscriber_id:', transaction.id);
          return res.status(400).json({ success: false, error: 'Transaction missing subscriber_id' });
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
          console.log('[webhook] Active subscription already exists, skipping insert:', existingSub.id);
        } else {
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              subscriber_id: transaction.subscriber_id,
              tier_id: tier.id,
              creator_id: transaction.creator_id,
              status: 'active',
              expires_at: expiresAt.toISOString(),
            });

          if (subError) {
            console.error('[webhook] Subscription create failed:', subError);
          }
        }
      }

      console.log('[webhook] Payment confirmed:', tran_id);
    } else {
      // Payment failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      console.log('[webhook] Payment failed:', tran_id, status);
    }

    // Always return 200 to SSLCommerz
    return res.json({ success: true });
  } catch (err) {
    console.error('[webhook] Unexpected error:', err);
    return res.status(200).json({ success: true }); // Still return 200 to avoid retries
  }
}

module.exports = { initPayment, handleWebhook };
