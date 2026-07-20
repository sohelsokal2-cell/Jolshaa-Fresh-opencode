-- Migration 002: Watch (Videos) & Events tables
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.videos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT,
  video_url       TEXT        NOT NULL,
  thumbnail_url   TEXT,
  duration_seconds INTEGER,
  view_count      INTEGER     DEFAULT 0,
  is_live         BOOLEAN     DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Everyone can read videos
CREATE POLICY "videos_select_public"
  ON public.videos FOR SELECT
  USING (true);

-- Only uploader can insert their own videos
CREATE POLICY "videos_insert_own"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = uploader_id);

-- Only uploader can update their own videos
CREATE POLICY "videos_update_own"
  ON public.videos FOR UPDATE
  USING (auth.uid() = uploader_id);

-- Only uploader can delete their own videos
CREATE POLICY "videos_delete_own"
  ON public.videos FOR DELETE
  USING (auth.uid() = uploader_id);

-- =============================================
-- 2. VIDEO_VIEWS TABLE (for unique view counting)
-- =============================================
CREATE TABLE IF NOT EXISTS public.video_views (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id    UUID        NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  viewer_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, viewer_id)
);

ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view log (anonymous views allowed via viewer_id = null)
CREATE POLICY "video_views_insert_public"
  ON public.video_views FOR INSERT
  WITH CHECK (true);

-- Only the video uploader can read views for their videos
CREATE POLICY "video_views_select_uploader"
  ON public.video_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.videos
      WHERE videos.id = video_views.video_id
        AND videos.uploader_id = auth.uid()
    )
  );

-- =============================================
-- 3. EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  cover_image_url TEXT,
  category        TEXT        NOT NULL DEFAULT 'community',
  location_type   TEXT        NOT NULL DEFAULT 'physical' CHECK (location_type IN ('physical', 'online')),
  location_text   TEXT,
  event_date      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Everyone can read events
CREATE POLICY "events_select_public"
  ON public.events FOR SELECT
  USING (true);

-- Only host can insert their own events
CREATE POLICY "events_insert_own"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- Only host can update their own events
CREATE POLICY "events_update_own"
  ON public.events FOR UPDATE
  USING (auth.uid() = host_id);

-- Only host can delete their own events
CREATE POLICY "events_delete_own"
  ON public.events FOR DELETE
  USING (auth.uid() = host_id);

-- =============================================
-- 4. EVENT_RSVPs TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  responded_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Users can read all RSVPs (for aggregate counts)
CREATE POLICY "event_rsvps_select_public"
  ON public.event_rsvps FOR SELECT
  USING (true);

-- Users can insert their own RSVP
CREATE POLICY "event_rsvps_insert_own"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVP
CREATE POLICY "event_rsvps_update_own"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own RSVP
CREATE POLICY "event_rsvps_delete_own"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. SAVED VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.saved_videos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id    UUID        NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_videos_select_own"
  ON public.saved_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_videos_insert_own"
  ON public.saved_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_videos_delete_own"
  ON public.saved_videos FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. RPC FUNCTIONS
-- =============================================

-- Get RSVP counts for an event (aggregate, no individual data exposed)
CREATE OR REPLACE FUNCTION public.get_event_rsvp_counts(p_event_id UUID)
RETURNS TABLE(going_count BIGINT, interested_count BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE status = 'going') AS going_count,
    COUNT(*) FILTER (WHERE status = 'interested') AS interested_count
  FROM public.event_rsvps
  WHERE event_id = p_event_id;
$$;

-- Get limited public guest info for avatar stack (first 5 going users)
CREATE OR REPLACE FUNCTION public.get_event_guest_avatars(p_event_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(user_name TEXT, profile_photo_url TEXT)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.name AS user_name,
    p.profile_photo_url
  FROM public.event_rsvps r
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.event_id = p_event_id
    AND r.status = 'going'
  ORDER BY r.responded_at ASC
  LIMIT p_limit;
$$;

-- Increment video view count (called after inserting into video_views)
CREATE OR REPLACE FUNCTION public.increment_video_view(p_video_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.videos
  SET view_count = view_count + 1
  WHERE id = p_video_id;
END;
$$;
