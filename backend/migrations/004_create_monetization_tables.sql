-- Migration 004: Monetization / Creator Dashboard tables
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CREATOR_STATUS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.creator_status (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_monetization_enabled BOOLEAN DEFAULT FALSE,
  is_verified             BOOLEAN DEFAULT FALSE,
  enabled_at              TIMESTAMPTZ
);

ALTER TABLE public.creator_status ENABLE ROW LEVEL SECURITY;

-- User can read own status
CREATE POLICY "creator_status_select_own"
  ON public.creator_status FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can read all
CREATE POLICY "creator_status_select_admin"
  ON public.creator_status FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admin can update all
CREATE POLICY "creator_status_update_admin"
  ON public.creator_status FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admin can insert
CREATE POLICY "creator_status_insert_admin"
  ON public.creator_status FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- =============================================
-- 2. SUBSCRIPTION_TIERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  price_bdt         INTEGER NOT NULL CHECK (price_bdt > 0),
  badge_tier        TEXT NOT NULL DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold')),
  perks_description TEXT DEFAULT '',
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Everyone can read active tiers
CREATE POLICY "tiers_select_public"
  ON public.subscription_tiers FOR SELECT
  USING (is_active = true);

-- Creator can read own tiers (including inactive)
CREATE POLICY "tiers_select_own"
  ON public.subscription_tiers FOR SELECT
  USING (auth.uid() = creator_id);

-- Creator can insert own tiers
CREATE POLICY "tiers_insert_own"
  ON public.subscription_tiers FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creator can update own tiers
CREATE POLICY "tiers_update_own"
  ON public.subscription_tiers FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creator can delete own tiers
CREATE POLICY "tiers_delete_own"
  ON public.subscription_tiers FOR DELETE
  USING (auth.uid() = creator_id);

-- =============================================
-- 3. SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier_id       UUID NOT NULL REFERENCES public.subscription_tiers(id) ON DELETE CASCADE,
  creator_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriber can read own subscriptions
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = subscriber_id);

-- Creator can read own subscriber count via RPC (not individual rows)
-- No direct SELECT policy for creators on individual subscriber rows

-- =============================================
-- 4. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                     TEXT NOT NULL CHECK (type IN ('subscription', 'gift', 'ad_revenue', 'payout')),
  amount_bdt               INTEGER NOT NULL,
  related_subscription_id  UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  gateway_transaction_id   TEXT,
  status                   TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Creator can read own transactions
CREATE POLICY "transactions_select_own"
  ON public.transactions FOR SELECT
  USING (auth.uid() = creator_id);

-- NO insert/update policy for clients — only backend service role can write
-- This ensures clients cannot manipulate transaction amounts or status

-- =============================================
-- 5. PAYOUT_REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_bdt            INTEGER NOT NULL CHECK (amount_bdt > 0),
  payout_method         TEXT NOT NULL CHECK (payout_method IN ('bkash', 'nagad', 'bank')),
  payout_account_details TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Creator can read own payout requests
CREATE POLICY "payout_requests_select_own"
  ON public.payout_requests FOR SELECT
  USING (auth.uid() = creator_id);

-- Creator can insert own payout requests
CREATE POLICY "payout_requests_insert_own"
  ON public.payout_requests FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Admin can update payout requests (approve/reject)
CREATE POLICY "payout_requests_update_admin"
  ON public.payout_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admin can read all payout requests
CREATE POLICY "payout_requests_select_admin"
  ON public.payout_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- =============================================
-- 6. RPC FUNCTIONS
-- =============================================

-- Get subscriber count for a creator's tier
CREATE OR REPLACE FUNCTION public.get_tier_subscriber_count(p_tier_id UUID)
RETURNS BIGINT
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*) FROM public.subscriptions
  WHERE tier_id = p_tier_id AND status = 'active';
$$;

-- Get total subscriber count for a creator
CREATE OR REPLACE FUNCTION public.get_creator_subscriber_count(p_creator_id UUID)
RETURNS BIGINT
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*) FROM public.subscriptions
  WHERE creator_id = p_creator_id AND status = 'active';
$$;

-- Get earnings summary for a creator
CREATE OR REPLACE FUNCTION public.get_creator_earnings(p_creator_id UUID)
RETURNS TABLE(
  total_earnings BIGINT,
  available_balance BIGINT,
  pending_balance BIGINT,
  this_month_earnings BIGINT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COALESCE(SUM(amount_bdt) FILTER (WHERE type != 'payout' AND status = 'completed'), 0) AS total_earnings,
    COALESCE(SUM(amount_bdt) FILTER (WHERE type != 'payout' AND status = 'completed'), 0)
      - COALESCE(SUM(ABS(amount_bdt)) FILTER (WHERE type = 'payout' AND status = 'completed'), 0) AS available_balance,
    COALESCE(SUM(amount_bdt) FILTER (WHERE type != 'payout' AND status = 'pending'), 0) AS pending_balance,
    COALESCE(SUM(amount_bdt) FILTER (WHERE type != 'payout' AND status = 'completed'
      AND created_at >= date_trunc('month', NOW())), 0) AS this_month_earnings
  FROM public.transactions
  WHERE creator_id = p_creator_id;
$$;

-- Get revenue breakdown by type for a creator
CREATE OR REPLACE FUNCTION public.get_revenue_breakdown(p_creator_id UUID)
RETURNS TABLE(type TEXT, amount BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT
    type,
    COALESCE(SUM(amount_bdt), 0) AS amount
  FROM public.transactions
  WHERE creator_id = p_creator_id
    AND status = 'completed'
    AND type != 'payout'
  GROUP BY type;
$$;

-- Get monthly earnings for chart (last N days grouped by day)
CREATE OR REPLACE FUNCTION public.get_earnings_chart(p_creator_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE(day DATE, amount BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT
    created_at::date AS day,
    COALESCE(SUM(amount_bdt), 0) AS amount
  FROM public.transactions
  WHERE creator_id = p_creator_id
    AND status = 'completed'
    AND type != 'payout'
    AND created_at >= NOW() - (p_days || ' days')::interval
  GROUP BY day
  ORDER BY day;
$$;
