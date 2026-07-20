import { supabase } from '../config/supabaseClient';

const USERS_PER_PAGE = 10;

// =============================================
// ADMIN ROLE VERIFICATION
// =============================================

/**
 * Verify the current user has admin role before performing admin actions.
 * Defense-in-depth: supplements RLS policies with client-side check.
 */
export async function verifyAdminRole() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('অনুগ্রহ করে লগইন করুন');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    throw new Error('এই কাজটি করার অনুমতি নেই');
  }

  return user;
}

// =============================================
// USER MANAGEMENT
// =============================================

/**
 * Fetch users with pagination and optional search/status filter.
 * Uses server-side filtering via Supabase.
 */
export async function fetchAllUsers({ search = '', statusFilter = 'all', page = 0, pageSize = USERS_PER_PAGE } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('account_status', statusFilter);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], total: count || 0 };
}

/**
 * Suspend a user account.
 */
export async function suspendUser(userId, reason = '') {
  await verifyAdminRole();

  const { error } = await supabase
    .from('profiles')
    .update({
      account_status: 'suspended',
      suspended_reason: reason,
      suspended_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Ban a user account.
 */
export async function banUser(userId, reason = '') {
  await verifyAdminRole();

  const { error } = await supabase
    .from('profiles')
    .update({
      account_status: 'banned',
      suspended_reason: reason,
      suspended_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Reactivate a suspended/banned user.
 */
export async function reactivateUser(userId) {
  await verifyAdminRole();

  const { error } = await supabase
    .from('profiles')
    .update({
      account_status: 'active',
      suspended_reason: null,
      suspended_at: null,
    })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Soft-delete a user by banning them.
 * We don't hard-delete profiles because foreign keys reference them.
 * Banning effectively disables the account while preserving data integrity.
 */
export async function deleteUser(userId) {
  return banUser(userId, 'Account deleted by admin');
}

// =============================================
// REPORTS
// =============================================

/**
 * Fetch reports with optional status/priority filter.
 * Joins reporter profile info for display.
 */
export async function fetchReports({ statusFilter = 'pending', priorityFilter = null } = {}) {
  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, name, email, profile_photo_url)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (priorityFilter && priorityFilter !== 'all') {
    query = query.eq('priority', priorityFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}

/**
 * Mark a report as reviewed.
 */
export async function reviewReport(reportId, adminNote = '') {
  await verifyAdminRole();

  const { error } = await supabase
    .from('reports')
    .update({ status: 'reviewed', admin_note: adminNote })
    .eq('id', reportId);

  if (error) throw error;
}

/**
 * Dismiss a report.
 */
export async function dismissReport(reportId) {
  await verifyAdminRole();

  const { error } = await supabase
    .from('reports')
    .update({ status: 'dismissed' })
    .eq('id', reportId);

  if (error) throw error;
}

// =============================================
// ADMIN STATS
// =============================================

/**
 * Fetch dashboard stats: total users, active today, pending reports, revenue.
 * Revenue is placeholder until payment system is live.
 */
export async function fetchAdminStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [usersResult, reportsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (reportsResult.error) throw reportsResult.error;

  // Active today: users whose last_sign_in_at or created_at is today
  // Using created_at as proxy since we don't have last_active_at
  const { count: activeToday, error: activeError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayStart);

  if (activeError) throw activeError;

  return {
    totalUsers: usersResult.count || 0,
    activeToday: activeToday || 0,
    pendingReports: reportsResult.count || 0,
    monthlyRevenue: 0, // TODO: replace when payment system is live
  };
}

/**
 * Fetch user signup growth for the chart.
 * Groups profiles by date (last N days).
 * Using signup growth because it's always available and doesn't require
 * additional activity tracking infrastructure.
 */
export async function fetchDailyActiveUsers(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', cutoffStr)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Group by day
  const grouped = {};
  (data || []).forEach((row) => {
    const day = row.created_at.slice(0, 10); // YYYY-MM-DD
    grouped[day] = (grouped[day] || 0) + 1;
  });

  // Fill in missing days with 0 (use local date strings to avoid timezone shift)
  const result = [];
  const d = new Date(cutoff);
  const today = new Date();
  while (d <= today) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    result.push({ day: key, count: grouped[key] || 0 });
    d.setDate(d.getDate() + 1);
  }

  return result;
}

// =============================================
// AUDIT LOGS
// =============================================

/**
 * Log an admin action to the audit_logs table.
 */
export async function logAdminAction({ adminId, action, targetType = null, targetId = null, details = {} }) {
  await verifyAdminRole();

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });

  if (error) throw error;
}

/**
 * Fetch audit logs with optional action filter.
 */
export async function fetchAuditLogs({ actionFilter = null, page = 0, pageSize = 20 } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      admin:profiles!audit_logs_admin_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (actionFilter && actionFilter !== 'all') {
    query = query.eq('action', actionFilter);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], total: count || 0 };
}

// =============================================
// ADS REVIEW
// =============================================

/**
 * Fetch ads with optional status filter.
 */
export async function fetchAds({ statusFilter = 'pending', page = 0, pageSize = 20 } = {}) {
  await verifyAdminRole();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('ads')
    .select(`
      *,
      advertiser:profiles!ads_advertiser_id_fkey(id, name, email, profile_photo_url)
    `)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], total: count || 0 };
}

/**
 * Approve an ad via RPC.
 */
export async function approveAd(adId) {
  const user = await verifyAdminRole();
  const { error } = await supabase.rpc('admin_approve_ad', {
    p_ad_id: adId,
    p_admin_id: user.id,
  });
  if (error) throw error;

  await logAdminAction({
    adminId: user.id,
    action: 'ad_approved',
    targetType: 'ad',
    targetId: adId,
  });
}

/**
 * Reject an ad with reason via RPC.
 */
export async function rejectAd(adId, reason) {
  const user = await verifyAdminRole();
  const { error } = await supabase.rpc('admin_reject_ad', {
    p_ad_id: adId,
    p_admin_id: user.id,
    p_reason: reason,
  });
  if (error) throw error;

  await logAdminAction({
    adminId: user.id,
    action: 'ad_rejected',
    targetType: 'ad',
    targetId: adId,
    details: { reason },
  });
}

// =============================================
// PAYOUT PROCESSING
// =============================================

/**
 * Fetch payout requests with optional status filter.
 */
export async function fetchPayouts({ statusFilter = 'pending', page = 0, pageSize = 20 } = {}) {
  await verifyAdminRole();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('payout_requests')
    .select(`
      *,
      creator:profiles!payout_requests_creator_id_fkey(id, name, email, profile_photo_url)
    `)
    .order('requested_at', { ascending: true })
    .range(from, to);

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], total: count || 0 };
}

/**
 * Mark payout as processing (admin acknowledged, will send manually).
 */
export async function startPayout(payoutId) {
  const user = await verifyAdminRole();
  const { error } = await supabase.rpc('admin_start_payout', {
    p_payout_id: payoutId,
    p_admin_id: user.id,
  });
  if (error) throw error;

  await logAdminAction({
    adminId: user.id,
    action: 'payout_processing',
    targetType: 'payout',
    targetId: payoutId,
  });
}

/**
 * Mark payout as completed with transaction reference via RPC.
 */
export async function completePayout(payoutId, transactionRef, adminNote = '') {
  const user = await verifyAdminRole();
  const { error } = await supabase.rpc('admin_complete_payout', {
    p_payout_id: payoutId,
    p_admin_id: user.id,
    p_transaction_ref: transactionRef,
    p_admin_note: adminNote,
  });
  if (error) throw error;

  await logAdminAction({
    adminId: user.id,
    action: 'payout_completed',
    targetType: 'payout',
    targetId: payoutId,
    details: { transaction_ref: transactionRef, admin_note: adminNote },
  });
}

/**
 * Fetch security summary: recent suspensions, bans, and suspicious activity.
 */
export async function fetchSecuritySummary() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString();

  const [suspendedResult, bannedResult, recentLogsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('account_status', 'suspended'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('account_status', 'banned'),
    supabase.from('audit_logs')
      .select('action, created_at')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (suspendedResult.error) throw suspendedResult.error;
  if (bannedResult.error) throw bannedResult.error;
  if (recentLogsResult.error) throw recentLogsResult.error;

  // Count actions by type in last 30 days
  const actionCounts = {};
  (recentLogsResult.data || []).forEach((log) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  return {
    suspendedCount: suspendedResult.count || 0,
    bannedCount: bannedResult.count || 0,
    totalActions30d: (recentLogsResult.data || []).length,
    actionCounts,
  };
}
