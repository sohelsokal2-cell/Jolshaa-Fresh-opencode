ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS feeling TEXT,
  ADD COLUMN IF NOT EXISTS location_name TEXT,
  ADD COLUMN IF NOT EXISTS life_update TEXT,
  ADD COLUMN IF NOT EXISTS gif_url TEXT;

CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_tags_select_authenticated" ON public.post_tags;
CREATE POLICY "post_tags_select_authenticated" ON public.post_tags FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "post_tags_insert_post_author" ON public.post_tags;
CREATE POLICY "post_tags_insert_post_author" ON public.post_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
);
DROP POLICY IF EXISTS "post_tags_delete_post_author" ON public.post_tags;
CREATE POLICY "post_tags_delete_post_author" ON public.post_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
);
