-- ========================================
-- JOLSHAA: Profile page — new columns + storage buckets
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS)
-- ========================================

-- 1. Add profile columns (only if not already present)
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- 2. Index for fetching posts by author
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);

-- 3. Index for friendship lookups
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);

-- 4. Create profile-avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create profile-covers storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-covers', 'profile-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS for profile-avatars
DROP POLICY IF EXISTS "Public read access for profile-avatars" ON storage.objects;
CREATE POLICY "Public read access for profile-avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-avatars' AND name LIKE auth.uid() || '%');

-- 7. Storage RLS for profile-covers
DROP POLICY IF EXISTS "Public read access for profile-covers" ON storage.objects;
CREATE POLICY "Public read access for profile-covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-covers');

DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own covers" ON storage.objects;
CREATE POLICY "Users can delete own covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-covers' AND name LIKE auth.uid() || '%');

-- Done!
