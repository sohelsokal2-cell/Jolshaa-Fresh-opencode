-- ========================================
-- Migration 007: Add is_fact_check_enabled to posts
-- Only flagged posts show the fact-check badge
-- ========================================

-- 1. Add the column
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_fact_check_enabled BOOLEAN NOT NULL DEFAULT false;

-- 2. RLS policies for is_fact_check_enabled updates
-- Policy: Any logged-in user can flag a post (set is_fact_check_enabled = true)
-- USING: must be authenticated
-- WITH CHECK: new value must be true (flagging only)
CREATE POLICY "Authenticated users can flag posts for fact-check"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (is_fact_check_enabled = true);

-- Policy: Author or admin can unflag (set is_fact_check_enabled = false)
-- USING: must be author or admin
-- WITH CHECK: new value must be false (unflagging only)
CREATE POLICY "Authors and admins can unflag fact-check"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (is_fact_check_enabled = false);
