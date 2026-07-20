-- ========================================
-- JOLSHAA: Friends + Notifications System
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- ========================================

-- 1. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Users can insert own requests" ON public.friendships;
CREATE POLICY "Users can insert own requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Addressee can update status" ON public.friendships;
CREATE POLICY "Addressee can update status"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Requester can delete own requests" ON public.friendships;
CREATE POLICY "Requester can delete own requests"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('friend_request','friend_accept','reaction','comment','friend_suggestion')),
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable realtime updates for friend requests and notifications.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'friendships'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipient can view own notifications" ON public.notifications;
CREATE POLICY "Recipient can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Recipient can update own notifications" ON public.notifications;
CREATE POLICY "Recipient can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Recipient can delete own notifications" ON public.notifications;
CREATE POLICY "Recipient can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = recipient_id);

-- 3. TRIGGER: New pending friendship → notify addressee
CREATE OR REPLACE FUNCTION public.handle_friendship_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
    VALUES (NEW.addressee_id, NEW.requester_id, 'friend_request', NEW.id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
    VALUES (NEW.requester_id, NEW.addressee_id, 'friend_accept', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_friendship_change ON public.friendships;
CREATE TRIGGER on_friendship_change
  AFTER INSERT OR UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friendship_notification();

-- 4. TRIGGER: New reaction → notify post author (exclude self)
CREATE OR REPLACE FUNCTION public.handle_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
BEGIN
  SELECT author_id INTO post_owner FROM public.posts WHERE id = NEW.post_id;
  IF post_owner IS NOT NULL AND post_owner != NEW.user_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
    VALUES (post_owner, NEW.user_id, 'reaction', NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reaction_insert ON public.reactions;
CREATE TRIGGER on_reaction_insert
  AFTER INSERT ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reaction_notification();

-- 5. TRIGGER: New comment → notify post author (exclude self)
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
BEGIN
  SELECT author_id INTO post_owner FROM public.posts WHERE id = NEW.post_id;
  IF post_owner IS NOT NULL AND post_owner != NEW.author_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
    VALUES (post_owner, NEW.author_id, 'comment', NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_insert ON public.comments;
CREATE TRIGGER on_comment_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_notification();

-- Done!
