-- ========================================
-- JOLSHAA: Groups + Pages System
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- ========================================

-- 1. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public','private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
CREATE POLICY "Anyone can view groups"
  ON public.groups FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Creator can insert groups" ON public.groups;
CREATE POLICY "Creator can insert groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- FIX: allow creator OR admin member to update group
DROP POLICY IF EXISTS "Creator or admin can update groups" ON public.groups;
CREATE POLICY "Creator or admin can update groups"
  ON public.groups FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Creator can delete own groups" ON public.groups;
CREATE POLICY "Creator can delete own groups"
  ON public.groups FOR DELETE
  USING (auth.uid() = creator_id);

-- 2. GROUP_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
CREATE POLICY "Anyone can view group members"
  ON public.group_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "User can join group" ON public.group_members;
CREATE POLICY "User can join group"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  -- TODO: private groups should require admin approval before join is confirmed

DROP POLICY IF EXISTS "User can leave group" ON public.group_members;
CREATE POLICY "User can leave group"
  ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

-- 3. PAGES TABLE
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view pages" ON public.pages;
CREATE POLICY "Anyone can view pages"
  ON public.pages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Creator can insert pages" ON public.pages;
CREATE POLICY "Creator can insert pages"
  ON public.pages FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Pages: only creator can update
DROP POLICY IF EXISTS "Creator can update own pages" ON public.pages;
CREATE POLICY "Creator can update own pages"
  ON public.pages FOR UPDATE
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creator can delete own pages" ON public.pages;
CREATE POLICY "Creator can delete own pages"
  ON public.pages FOR DELETE
  USING (auth.uid() = creator_id);

-- 4. PAGE_FOLLOWERS TABLE
CREATE TABLE IF NOT EXISTS public.page_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, user_id)
);

ALTER TABLE public.page_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view page followers" ON public.page_followers;
CREATE POLICY "Anyone can view page followers"
  ON public.page_followers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "User can follow page" ON public.page_followers;
CREATE POLICY "User can follow page"
  ON public.page_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can unfollow page" ON public.page_followers;
CREATE POLICY "User can unfollow page"
  ON public.page_followers FOR DELETE
  USING (auth.uid() = user_id);

-- 5. ALTER POSTS TABLE — add group_id and page_id nullable columns
DO $$ BEGIN
  ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- 6. INDEXES for group/page post queries
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_page_id ON public.posts(page_id);

-- 7. RLS for group posts (private groups: only members can read)
DROP POLICY IF EXISTS "Group members can read private group posts" ON public.posts;
CREATE POLICY "Group members can read private group posts"
  ON public.posts FOR SELECT
  USING (
    group_id IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = posts.group_id AND groups.privacy = 'public'
    )
    OR EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = posts.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- 8. Page creator can insert posts with page_id
DROP POLICY IF EXISTS "Page creator can insert page posts" ON public.posts;
CREATE POLICY "Page creator can insert page posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    page_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = posts.page_id AND pages.creator_id = auth.uid()
    )
  );

-- Done! Tables, RLS, indexes, and columns are ready.
