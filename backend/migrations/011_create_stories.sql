-- Stories: active for 24 hours, readable by authenticated users.
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  background TEXT NOT NULL DEFAULT 'linear-gradient(145deg,#1B6B5A,#2a9678)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT stories_content_or_media CHECK (length(trim(content)) > 0 OR media_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories (expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_user_created ON public.stories (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.story_views (
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, viewer_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "story_views_select_own" ON public.story_views;
CREATE POLICY "story_views_select_own"
  ON public.story_views FOR SELECT
  USING (auth.uid() = viewer_id OR auth.uid() IN (SELECT user_id FROM public.stories WHERE id = story_id));

DROP POLICY IF EXISTS "story_views_insert_own" ON public.story_views;
CREATE POLICY "story_views_insert_own"
  ON public.story_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

DROP POLICY IF EXISTS "story_views_update_own" ON public.story_views;
CREATE POLICY "story_views_update_own"
  ON public.story_views FOR UPDATE
  USING (auth.uid() = viewer_id)
  WITH CHECK (auth.uid() = viewer_id);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_select_active" ON public.stories;
CREATE POLICY "stories_select_active"
  ON public.stories FOR SELECT
  USING (auth.uid() IS NOT NULL AND expires_at > now());

DROP POLICY IF EXISTS "stories_insert_own" ON public.stories;
CREATE POLICY "stories_insert_own"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_delete_own" ON public.stories;
CREATE POLICY "stories_delete_own"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);
