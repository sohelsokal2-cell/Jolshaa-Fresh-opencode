-- ========================================
-- JOLSHAA: Sahajjo Chai (Help Request) System
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- ========================================

-- 1. HELP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('medical','flood','fire','lost_person','food','shelter')),
  urgency TEXT NOT NULL CHECK (urgency IN ('immediate','hours','days')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  location_district TEXT NOT NULL,
  location_upazila TEXT,
  deadline TIMESTAMPTZ,  -- deadline calculated CLIENT-SIDE from created_at + urgency
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Everyone can read help requests
DROP POLICY IF EXISTS "Anyone can view help requests" ON public.help_requests;
CREATE POLICY "Anyone can view help requests"
  ON public.help_requests FOR SELECT
  USING (true);

-- Authenticated users can insert their own requests
DROP POLICY IF EXISTS "Users can create own help requests" ON public.help_requests;
CREATE POLICY "Users can create own help requests"
  ON public.help_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Requester can update own request (including resolve)
DROP POLICY IF EXISTS "Users can update own help requests" ON public.help_requests;
CREATE POLICY "Users can update own help requests"
  ON public.help_requests FOR UPDATE
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

-- 2. HELP OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.help_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered','accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, helper_id)
);

ALTER TABLE public.help_offers ENABLE ROW LEVEL SECURITY;

-- FIX: Only requester (on their own request) and the helper themselves can read help_offers rows.
-- Individual offer rows expose helper identity and message — NOT public.
DROP POLICY IF EXISTS "Requester or helper can view help offers" ON public.help_offers;
CREATE POLICY "Requester or helper can view help offers"
  ON public.help_offers FOR SELECT
  USING (
    auth.uid() = helper_id
    OR EXISTS (
      SELECT 1 FROM public.help_requests
      WHERE help_requests.id = help_offers.request_id
        AND help_requests.requester_id = auth.uid()
    )
  );

-- Authenticated users can insert own offer
DROP POLICY IF EXISTS "Users can create own help offers" ON public.help_offers;
CREATE POLICY "Users can create own help offers"
  ON public.help_offers FOR INSERT
  WITH CHECK (auth.uid() = helper_id);

-- Only the request's requester can accept an offer
DROP POLICY IF EXISTS "Requester can update help offers" ON public.help_offers;
CREATE POLICY "Requester can update help offers"
  ON public.help_offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.help_requests
      WHERE help_requests.id = help_offers.request_id
        AND help_requests.requester_id = auth.uid()
    )
  );

-- 3. get_help_offer_count() — RPC for public helper count (no row exposure)
CREATE OR REPLACE FUNCTION public.get_help_offer_count(req_id uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer FROM public.help_offers WHERE request_id = req_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Update notifications type CHECK constraint to include help types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('friend_request','friend_accept','reaction','comment','friend_suggestion','help_offer','help_accepted'));

-- 5. TRIGGER: New help offer → notify request requester
CREATE OR REPLACE FUNCTION public.handle_help_offer_notification()
RETURNS TRIGGER AS $$
DECLARE
  request_owner UUID;
BEGIN
  SELECT requester_id INTO request_owner
  FROM public.help_requests
  WHERE id = NEW.request_id;

  IF request_owner IS NOT NULL AND request_owner != NEW.helper_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
    VALUES (request_owner, NEW.helper_id, 'help_offer', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_help_offer_insert ON public.help_offers;
CREATE TRIGGER on_help_offer_insert
  AFTER INSERT ON public.help_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_help_offer_notification();

-- 6. TRIGGER: Offer accepted → notify helper (with duplicate-fire guard)
CREATE OR REPLACE FUNCTION public.handle_help_accepted_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status = 'accepted' THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
    VALUES (
      NEW.helper_id,
      (SELECT requester_id FROM public.help_requests WHERE id = NEW.request_id),
      'help_accepted',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_help_offer_update ON public.help_offers;
CREATE TRIGGER on_help_offer_update
  AFTER UPDATE ON public.help_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_help_accepted_notification();

-- 7. Enable Realtime for both tables (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'help_requests'
      AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'help_offers'
      AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.help_offers;
  END IF;
END
$$;

-- 8. Create 'help-request-images' storage bucket (separate from post-images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('help-request-images', 'help-request-images', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Storage RLS policies for 'help-request-images' bucket
DROP POLICY IF EXISTS "Public read access for help-request-images" ON storage.objects;
CREATE POLICY "Public read access for help-request-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'help-request-images');

DROP POLICY IF EXISTS "Authenticated users can upload to help-request-images" ON storage.objects;
CREATE POLICY "Authenticated users can upload to help-request-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'help-request-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own help-request-images" ON storage.objects;
CREATE POLICY "Users can delete own help-request-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'help-request-images' AND name LIKE auth.uid() || '%');

-- Done!
