-- Migration 005: Admin Panel — user management, reports, RLS
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. is_admin() HELPER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND is_admin = true
  );
$$;

-- =============================================
-- 2. ALTER profiles TABLE — add admin columns
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- =============================================
-- 3. reports TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_content_type TEXT NOT NULL CHECK (reported_content_type IN ('post', 'user', 'comment')),
  reported_content_id   UUID NOT NULL,
  reason                TEXT NOT NULL,
  priority              TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  admin_note            TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert a report
CREATE POLICY "reports_insert_auth"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Only admins can read reports
CREATE POLICY "reports_select_admin"
  ON public.reports FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can update reports (review/dismiss)
CREATE POLICY "reports_update_admin"
  ON public.reports FOR UPDATE
  USING (is_admin(auth.uid()));

-- =============================================
-- 4. PROFILES RLS — admin-only UPDATE for account_status
-- =============================================
-- Drop the original update policy (name from migration 001)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can update their own profile (safe columns only — enforced by app, not RLS)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile (all columns including account_status, is_admin)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- =============================================
-- 5. SEED: Make first user admin (optional, for testing)
-- =============================================
-- Uncomment to make a specific user admin:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_USER_UUID';
