-- Multi-media posts while preserving the legacy posts.image_url column.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'text';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_post_type_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_post_type_check CHECK (post_type IN ('text', 'photo', 'video'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_media_post_order ON public.post_media(post_id, order_index);
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_media_select_public" ON public.post_media;
CREATE POLICY "post_media_select_public"
  ON public.post_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "post_media_insert_author" ON public.post_media;
CREATE POLICY "post_media_insert_author"
  ON public.post_media FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
  );

DROP POLICY IF EXISTS "post_media_delete_author" ON public.post_media;
CREATE POLICY "post_media_delete_author"
  ON public.post_media FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "post_videos_public_read" ON storage.objects;
CREATE POLICY "post_videos_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'post-videos');

DROP POLICY IF EXISTS "post_videos_authenticated_upload" ON storage.objects;
CREATE POLICY "post_videos_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-videos' AND auth.role() = 'authenticated');
