-- Migration 019: Ads Review + Payout Processing + Admin Extensions
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.ads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  target_url      TEXT,
  budget          NUMERIC(12,2) NOT NULL CHECK (budget > 0),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','active','paused','completed')),
  rejection_reason TEXT,
  reviewed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Admin can read all ads
DROP POLICY IF EXISTS "ads_select_admin" ON public.ads;
CREATE POLICY "ads_select_admin"
  ON public.ads FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Advertiser can read own ads
DROP POLICY IF EXISTS "ads_select_own" ON public.ads;
CREATE POLICY "ads_select_own"
  ON public.ads FOR SELECT
  USING (auth.uid() = advertiser_id);

-- Advertiser can insert own ads
DROP POLICY IF EXISTS "ads_insert_own" ON public.ads;
CREATE POLICY "ads_insert_own"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() = advertiser_id);

-- Admin can update ads (approve/reject)
DROP POLICY IF EXISTS "ads_update_admin" ON public.ads;
CREATE POLICY "ads_update_admin"
  ON public.ads FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_advertiser_id ON public.ads(advertiser_id);

-- =============================================
-- 2. EXTEND PAYOUT_REQUESTS TABLE
-- =============================================
DO $$ BEGIN
  ALTER TABLE public.payout_requests ADD COLUMN transaction_ref TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.payout_requests ADD COLUMN admin_note TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.payout_requests ADD COLUMN processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.payout_requests ADD COLUMN processed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.payout_requests ADD COLUMN currency TEXT NOT NULL DEFAULT 'BDT';
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- =============================================
-- 3. UPDATE NOTIFICATION TYPES
-- =============================================
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'friend_request','friend_accept','reaction','comment','friend_suggestion',
    'help_offer','help_accepted',
    'help_request','rumor_flag','message','group_invite','call_missed',
    'ad_approved','ad_rejected','payout_completed'
  ));

-- =============================================
-- 4. ADMIN ADS REVIEW RPC: Approve ad
-- =============================================
CREATE OR REPLACE FUNCTION public.admin_approve_ad(
  p_ad_id UUID,
  p_admin_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.ads
  SET status = 'approved',
      reviewed_by = p_admin_id,
      reviewed_at = NOW()
  WHERE id = p_ad_id AND status = 'pending';

  INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
  SELECT
    ads.advertiser_id,
    p_admin_id,
    'ad_approved',
    ads.id,
    'বিজ্ঞাপন অনুমোদিত হয়েছে',
    'আপনার বিজ্ঞাপন "' || ads.title || '" অনুমোদন করা হয়েছে।'
  FROM public.ads
  WHERE ads.id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. ADMIN ADS REVIEW RPC: Reject ad
-- =============================================
CREATE OR REPLACE FUNCTION public.admin_reject_ad(
  p_ad_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.ads
  SET status = 'rejected',
      rejection_reason = p_reason,
      reviewed_by = p_admin_id,
      reviewed_at = NOW()
  WHERE id = p_ad_id AND status = 'pending';

  INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
  SELECT
    ads.advertiser_id,
    p_admin_id,
    'ad_rejected',
    ads.id,
    'বিজ্ঞাপন প্রত্যাখ্যাত হয়েছে',
    'আপনার বিজ্ঞাপন "' || ads.title || '" প্রত্যাখ্যাত করা হয়েছে। কারণ: ' || COALESCE(p_reason, 'নেই')
  FROM public.ads
  WHERE ads.id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. ADMIN PAYOUT RPC: Mark payout completed
-- =============================================
CREATE OR REPLACE FUNCTION public.admin_complete_payout(
  p_payout_id UUID,
  p_admin_id UUID,
  p_transaction_ref TEXT,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.payout_requests
  SET status = 'completed',
      transaction_ref = p_transaction_ref,
      admin_note = p_admin_note,
      processed_by = p_admin_id,
      processed_at = NOW()
  WHERE id = p_payout_id AND status IN ('pending', 'processing');

  INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
  SELECT
    pr.creator_id,
    p_admin_id,
    'payout_completed',
    pr.id,
    'পেআউট সম্পন্ন হয়েছে',
    'আপনার ' || pr.amount_bdt || ' টাকা পেআউট সম্পন্ন হয়েছে। রেফারেন্স: ' || COALESCE(p_transaction_ref, 'N/A')
  FROM public.payout_requests pr
  WHERE pr.id = p_payout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. ADMIN PAYOUT RPC: Mark payout as processing
-- =============================================
CREATE OR REPLACE FUNCTION public.admin_start_payout(
  p_payout_id UUID,
  p_admin_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.payout_requests
  SET status = 'processing',
      processed_by = p_admin_id
  WHERE id = p_payout_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done!
