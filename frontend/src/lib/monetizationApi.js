import { supabase } from '../config/supabaseClient';

const TRANSACTIONS_PER_PAGE = 10;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '')
  || 'http://localhost:5000';

// =============================================
// CREATOR STATUS
// =============================================
export async function getCreatorStatus(userId) {
  const { data, error } = await supabase
    .from('creator_status')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// =============================================
// SUBSCRIPTION TIERS
// =============================================
export async function fetchTiers(creatorId) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('is_active', true)
    .order('price_bdt', { ascending: true });

  if (error) throw error;

  // Attach subscriber counts
  const tiersWithCounts = await Promise.all(
    data.map(async (tier) => {
      const { data: count } = await supabase.rpc('get_tier_subscriber_count', { p_tier_id: tier.id });
      return { ...tier, subscriberCount: count || 0 };
    })
  );

  return tiersWithCounts;
}

export async function fetchAllTiers(creatorId) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTier(creatorId, { name, priceBdt, badgeTier = 'bronze', perksDescription = '' }) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .insert({
      creator_id: creatorId,
      name,
      price_bdt: priceBdt,
      badge_tier: badgeTier,
      perks_description: perksDescription,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateTier(tierId, updates) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .update(updates)
    .eq('id', tierId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTier(tierId) {
  const { error } = await supabase
    .from('subscription_tiers')
    .update({ is_active: false })
    .eq('id', tierId);

  if (error) throw error;
}

// =============================================
// EARNINGS & REVENUE
// =============================================
export async function getCreatorEarnings(creatorId) {
  const { data, error } = await supabase.rpc('get_creator_earnings', { p_creator_id: creatorId });
  if (error) throw error;
  return data?.[0] || { total_earnings: 0, available_balance: 0, pending_balance: 0, this_month_earnings: 0 };
}

export async function getRevenueBreakdown(creatorId) {
  const { data, error } = await supabase.rpc('get_revenue_breakdown', { p_creator_id: creatorId });
  if (error) throw error;
  return data || [];
}

export async function getEarningsChart(creatorId, days = 30) {
  const { data, error } = await supabase.rpc('get_earnings_chart', {
    p_creator_id: creatorId,
    p_days: days,
  });
  if (error) throw error;
  return data || [];
}

export async function getCreatorSubscriberCount(creatorId) {
  const { data, error } = await supabase.rpc('get_creator_subscriber_count', { p_creator_id: creatorId });
  if (error) throw error;
  return data || 0;
}

// =============================================
// TRANSACTIONS
// =============================================
export async function getTransactions(creatorId, page = 0) {
  const from = page * TRANSACTIONS_PER_PAGE;
  const to = from + TRANSACTIONS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function getRecentTransactions(creatorId, limit = 5) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// =============================================
// SUBSCRIPTIONS
// =============================================
export async function getMySubscriptions(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      tier:subscription_tiers(name, badge_tier, perks_description),
      creator:profiles(id, name, profile_photo_url)
    `)
    .eq('subscriber_id', userId)
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

// =============================================
// PAYMENT — moved to paymentGateway.js
// =============================================
// Use initiatePayment() from './paymentGateway.js' instead.
// That file abstracts mock vs real SSLCommerz — no component changes needed.

// =============================================
// PAYOUTS
// =============================================
export async function requestPayout(creatorId, { amountBdt, payoutMethod, payoutAccountDetails }) {
  const { data, error } = await supabase
    .from('payout_requests')
    .insert({
      creator_id: creatorId,
      amount_bdt: amountBdt,
      payout_method: payoutMethod,
      payout_account_details: payoutAccountDetails,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getMyPayoutRequests(creatorId) {
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('creator_id', creatorId)
    .order('requested_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
