ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS extended_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS visible_sections JSONB NOT NULL DEFAULT '{"about":true,"reels":true,"photos":true,"groups":true,"events":true,"checkins":true,"friends":true}'::jsonb;

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  location_area TEXT,
  visited_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON public.check_ins(user_id, visited_at DESC);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "check_ins_read_authenticated" ON public.check_ins;
CREATE POLICY "check_ins_read_authenticated" ON public.check_ins FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "check_ins_insert_own" ON public.check_ins;
CREATE POLICY "check_ins_insert_own" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "check_ins_delete_own" ON public.check_ins;
CREATE POLICY "check_ins_delete_own" ON public.check_ins FOR DELETE USING (auth.uid() = user_id);
