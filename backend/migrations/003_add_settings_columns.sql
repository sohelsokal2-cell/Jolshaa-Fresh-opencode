-- Migration 003: Settings page — new profile columns
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ADD NEW COLUMNS TO PROFILES TABLE
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_active_status BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_post_privacy TEXT DEFAULT 'public' CHECK (default_post_privacy IN ('public', 'friends', 'only_me'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'bn';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN DEFAULT FALSE;

-- =============================================
-- 2. VERIFY RLS POLICIES ON PROFILES
-- =============================================
-- The existing UPDATE policy should only allow auth.uid() = id
-- Run this to check (read the output):
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- If the existing policy is correct (auth.uid() = id), no change needed.
-- If not, drop and recreate:
-- DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
-- CREATE POLICY "profiles_update_own"
--   ON public.profiles FOR UPDATE
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);
