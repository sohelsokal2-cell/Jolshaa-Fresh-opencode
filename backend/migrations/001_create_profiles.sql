-- ============================================================
-- Jolshaa — Migration 001: Create profiles table
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Step 1: Create the profiles table
-- id is a foreign key to auth.users — Supabase Auth manages that table.
-- When a user signs up via Supabase Auth, their UUID lands in auth.users.id.
-- We store the same UUID here so profiles are 1-to-1 with auth users.

CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  email               TEXT        UNIQUE NOT NULL,
  phone               TEXT,
  profile_photo_url   TEXT        DEFAULT 'https://ui-avatars.com/api/?name=User&background=1B6B5A&color=fff',
  cover_photo_url     TEXT,
  bio                 TEXT        DEFAULT '',
  date_of_birth       DATE,
  gender              TEXT,
  is_admin            BOOLEAN     DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policy — anyone can read any profile (public SELECT)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (TRUE);

-- Step 4: RLS Policy — a user can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Step 5: RLS Policy — a user can insert their own profile row (needed for signup)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Verification query — run after the above to confirm success:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;
-- ============================================================
