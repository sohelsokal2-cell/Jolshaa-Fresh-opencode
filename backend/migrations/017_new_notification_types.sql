-- Migration 017: New notification types + title/body columns + triggers
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. UPDATE NOTIFICATION TYPE CHECK CONSTRAINT
-- =============================================
-- Current types from 002: friend_request, friend_accept, reaction, comment, friend_suggestion
-- Added by 004: help_offer, help_accepted
-- New types: help_request, rumor_flag, message, group_invite, call_missed
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'friend_request','friend_accept','reaction','comment','friend_suggestion',
    'help_offer','help_accepted',
    'help_request','rumor_flag','message','group_invite','call_missed'
  ));

-- =============================================
-- 2. ADD TITLE AND BODY COLUMNS
-- =============================================
DO $$ BEGIN
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS body TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- =============================================
-- 3. TRIGGER: New help request → notify nearby users (or all if no location match)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_help_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower RECORD;
BEGIN
  -- Notify all users about new help requests (broad discovery)
  -- Exclude the requester themselves
  FOR follower IN
    SELECT id FROM public.profiles WHERE id != NEW.requester_id LIMIT 100
  LOOP
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
    VALUES (
      follower.id,
      NEW.requester_id,
      'help_request',
      NEW.id,
      'নতুন সাহায্যের অনুরোধ',
      NEW.title
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_help_request_insert ON public.help_requests;
CREATE TRIGGER on_help_request_insert
  AFTER INSERT ON public.help_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_help_request_notification();

-- =============================================
-- 4. TRIGGER: Fact-check vote flagged → notify post author
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_rumor_flag_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner UUID;
BEGIN
  -- Only notify when a post gets flagged (transitions to flagged state)
  IF NEW.factcheck_flagged = true AND (OLD.factcheck_flagged IS NULL OR OLD.factcheck_flagged = false) THEN
    SELECT author_id INTO post_owner FROM public.posts WHERE id = NEW.id;
    IF post_owner IS NOT NULL THEN
      INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
      VALUES (
        post_owner,
        NULL,
        'rumor_flag',
        NEW.id,
        'পোস্ট ফ্ল্যাগ করা হয়েছে',
        'আপনার পোস্টটি তথ্য-যাচাইকরণের জন্য ফ্ল্যাগ করা হয়েছে।'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_rumor_flag ON public.posts;
CREATE TRIGGER on_post_rumor_flag
  AFTER UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_rumor_flag_notification();

-- =============================================
-- 5. TRIGGER: New message in conversation → notify other participants
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  participant RECORD;
BEGIN
  -- Notify all other participants in the conversation
  FOR participant IN
    SELECT user_id FROM public.conversation_participants
    WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id
  LOOP
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
    VALUES (
      participant.user_id,
      NEW.sender_id,
      'message',
      NEW.conversation_id,
      'নতুন বার্তা',
      'আপনাকে একটি নতুন বার্তা পাঠিয়েছে।'
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_notify ON public.messages;
CREATE TRIGGER on_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_notification();

-- =============================================
-- 6. TRIGGER: New group member → notify other group members (for group_invite feel)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_group_member_notification()
RETURNS TRIGGER AS $$
DECLARE
  member RECORD;
  group_name TEXT;
BEGIN
  SELECT name INTO group_name FROM public.groups WHERE id = NEW.group_id;

  -- Notify existing members about new member joining
  FOR member IN
    SELECT user_id FROM public.group_members
    WHERE group_id = NEW.group_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
    VALUES (
      member.user_id,
      NEW.user_id,
      'group_invite',
      NEW.group_id,
      'গ্রুপে নতুন সদস্য',
      COALESCE(group_name, 'গ্রুপ') || '-এ একজন নতুন সদস্য যোগ দিয়েছে।'
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_group_member_insert ON public.group_members;
CREATE TRIGGER on_group_member_insert
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_member_notification();

-- =============================================
-- 7. TRIGGER: Call missed → notify caller
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_missed_call_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'missed'
  IF NEW.status = 'missed' AND (OLD.status IS NULL OR OLD.status != 'missed') THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id, title, body)
    VALUES (
      NEW.caller_id,
      NEW.callee_id,
      'call_missed',
      NEW.id,
      'মিস্ড কল',
      'আপনার একটি কল মিস হয়েছে।'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_call_missed ON public.call_sessions;
CREATE TRIGGER on_call_missed
  AFTER UPDATE ON public.call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_missed_call_notification();

-- =============================================
-- 8. ENABLE REALTIME for posts table (for rumor_flag trigger)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  END IF;
END $$;

-- Done!
