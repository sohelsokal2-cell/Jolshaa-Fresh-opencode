-- ========================================
-- JOLSHAA: Fact-Check (Sotti Naki Gujob) System
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- ========================================

-- 1. FACTCHECK_VOTES TABLE
CREATE TABLE IF NOT EXISTS public.factcheck_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('true','false','mislead')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, voter_id)
);

ALTER TABLE public.factcheck_votes ENABLE ROW LEVEL SECURITY;

-- RLS: Only the voter themselves can see their own vote row (voter identity + reason)
DROP POLICY IF EXISTS "Voter can view own factcheck vote" ON public.factcheck_votes;
CREATE POLICY "Voter can view own factcheck vote"
  ON public.factcheck_votes FOR SELECT
  USING (auth.uid() = voter_id);

-- RLS: Admins can see all vote rows (for admin queue review)
DROP POLICY IF EXISTS "Admins can view all factcheck votes" ON public.factcheck_votes;
CREATE POLICY "Admins can view all factcheck votes"
  ON public.factcheck_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- RLS: Authenticated users can insert their own vote
DROP POLICY IF EXISTS "Users can insert own factcheck vote" ON public.factcheck_votes;
CREATE POLICY "Users can insert own factcheck vote"
  ON public.factcheck_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- RLS: Authenticated users can update their own vote
DROP POLICY IF EXISTS "Users can update own factcheck vote" ON public.factcheck_votes;
CREATE POLICY "Users can update own factcheck vote"
  ON public.factcheck_votes FOR UPDATE
  USING (auth.uid() = voter_id)
  WITH CHECK (auth.uid() = voter_id);

-- 2. ADD COLUMNS TO posts TABLE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'factcheck_status'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN factcheck_status TEXT NOT NULL DEFAULT 'unverified'
      CHECK (factcheck_status IN ('unverified','true','false','mislead'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'factcheck_flagged'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN factcheck_flagged BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'admin_note'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN admin_note TEXT;
  END IF;
END
$$;

-- 3. FUNCTION: Get vote distribution for a post (PUBLIC — anyone can call)
-- SECURITY DEFINER bypasses RLS so it works even with restricted SELECT policies
CREATE OR REPLACE FUNCTION public.get_vote_distribution(p_post_id UUID)
RETURNS TABLE (
  true_count BIGINT,
  false_count BIGINT,
  mislead_count BIGINT,
  total BIGINT,
  pct_true NUMERIC,
  pct_false NUMERIC,
  pct_mislead NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE vote = 'true') AS true_count,
    COUNT(*) FILTER (WHERE vote = 'false') AS false_count,
    COUNT(*) FILTER (WHERE vote = 'mislead') AS mislead_count,
    COUNT(*) AS total,
    CASE WHEN COUNT(*) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE vote = 'true')::NUMERIC / COUNT(*) * 100)
      ELSE 0 END AS pct_true,
    CASE WHEN COUNT(*) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE vote = 'false')::NUMERIC / COUNT(*) * 100)
      ELSE 0 END AS pct_false,
    CASE WHEN COUNT(*) > 0
      THEN 100 - ROUND(COUNT(*) FILTER (WHERE vote = 'true')::NUMERIC / COUNT(*) * 100)
           - ROUND(COUNT(*) FILTER (WHERE vote = 'false')::NUMERIC / COUNT(*) * 100)
      ELSE 0 END AS pct_mislead
  FROM public.factcheck_votes
  WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. FUNCTION: Get current user's own vote for a post
-- SECURITY DEFINER so voter can read their own row even with restrictive RLS
CREATE OR REPLACE FUNCTION public.get_my_factcheck_vote(p_post_id UUID, p_voter_id UUID)
RETURNS TABLE (vote TEXT, reason TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT fv.vote, fv.reason
  FROM public.factcheck_votes fv
  WHERE fv.post_id = p_post_id AND fv.voter_id = p_voter_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. FUNCTION: Get aggregate summary grouped by vote type (for admin/analytics)
CREATE OR REPLACE FUNCTION public.get_fact_check_summary(p_post_id UUID)
RETURNS TABLE(vote_type TEXT, vote_count INTEGER) AS $$
  SELECT vote, COUNT(*)::INTEGER
  FROM public.factcheck_votes
  WHERE post_id = p_post_id
  GROUP BY vote;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 6. FUNCTION: Auto-flag posts based on vote thresholds
-- Duplicate-fire prevention: only flags when threshold is first crossed
-- (UPDATE ... WHERE factcheck_flagged = false prevents re-triggering)
CREATE OR REPLACE FUNCTION public.handle_factcheck_auto_flag()
RETURNS TRIGGER AS $$
DECLARE
  v_total BIGINT;
  v_negative BIGINT;
  v_negative_pct NUMERIC;
BEGIN
  -- Count total and negative (false+mislead) votes for this post
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE vote IN ('false', 'mislead'))
  INTO v_total, v_negative
  FROM public.factcheck_votes
  WHERE post_id = NEW.post_id;

  -- Calculate negative percentage
  IF v_total > 0 THEN
    v_negative_pct := (v_negative::NUMERIC / v_total) * 100;
  ELSE
    v_negative_pct := 0;
  END IF;

  -- Auto-flag: 5+ total votes AND 60%+ negative
  -- WHERE factcheck_flagged = false prevents duplicate-fire (only triggers on threshold cross)
  IF v_total >= 5 AND v_negative_pct >= 60 THEN
    UPDATE public.posts
    SET factcheck_flagged = true
    WHERE id = NEW.post_id AND factcheck_flagged = false;
  END IF;

  -- Auto-unflag: if negative drops below 50%
  IF v_negative_pct < 50 THEN
    UPDATE public.posts
    SET factcheck_flagged = false
    WHERE id = NEW.post_id AND factcheck_flagged = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_factcheck_vote_change ON public.factcheck_votes;
CREATE TRIGGER on_factcheck_vote_change
  AFTER INSERT OR UPDATE ON public.factcheck_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_factcheck_auto_flag();

-- 7. Enable Realtime for factcheck_votes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'factcheck_votes'
      AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.factcheck_votes;
  END IF;
END
$$;

-- Done!
