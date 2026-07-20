-- Migration 016: Full-featured Messenger (matches messenger.html design)
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CONVERSATIONS: add group name/avatar/creator
-- =============================================
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS name       TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =============================================
-- 2. CONVERSATION_PARTICIPANTS: mute + admin flags
-- =============================================
ALTER TABLE public.conversation_participants
  ADD COLUMN IF NOT EXISTS is_muted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- =============================================
-- 3. MESSAGES: reply, type, voice, location
-- =============================================
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reply_to_id  UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','image','voice','location')),
  ADD COLUMN IF NOT EXISTS audio_url    TEXT,
  ADD COLUMN IF NOT EXISTS audio_duration_sec INTEGER,
  ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_label TEXT;

-- Loosen the old CHECK so voice/location-only rows (no content/image_url) are valid
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_content_check CHECK (
  content IS NOT NULL OR image_url IS NOT NULL OR audio_url IS NOT NULL
  OR (location_lat IS NOT NULL AND location_lng IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id);

-- =============================================
-- 4. MESSAGE_REACTIONS TABLE (emoji reactions)
-- =============================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select_participant" ON public.message_reactions;
CREATE POLICY "reactions_select_participant"
  ON public.message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "reactions_insert_own" ON public.message_reactions;
CREATE POLICY "reactions_insert_own"
  ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reactions_delete_own" ON public.message_reactions;
CREATE POLICY "reactions_delete_own"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON public.message_reactions(message_id);

-- =============================================
-- 5. PINNED_MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id      UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  pinned_by       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conversation_id, message_id)
);

ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pinned_select_participant" ON public.pinned_messages;
CREATE POLICY "pinned_select_participant"
  ON public.pinned_messages FOR SELECT
  USING (is_conversation_participant(pinned_messages.conversation_id, auth.uid()));

DROP POLICY IF EXISTS "pinned_insert_participant" ON public.pinned_messages;
CREATE POLICY "pinned_insert_participant"
  ON public.pinned_messages FOR INSERT
  WITH CHECK (is_conversation_participant(pinned_messages.conversation_id, auth.uid()));

DROP POLICY IF EXISTS "pinned_delete_participant" ON public.pinned_messages;
CREATE POLICY "pinned_delete_participant"
  ON public.pinned_messages FOR DELETE
  USING (is_conversation_participant(pinned_messages.conversation_id, auth.uid()));

CREATE INDEX IF NOT EXISTS idx_pinned_conversation_id ON public.pinned_messages(conversation_id);

-- =============================================
-- 6. USER_BLOCKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_select_own" ON public.user_blocks;
CREATE POLICY "blocks_select_own"
  ON public.user_blocks FOR SELECT
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

DROP POLICY IF EXISTS "blocks_insert_own" ON public.user_blocks;
CREATE POLICY "blocks_insert_own"
  ON public.user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_delete_own" ON public.user_blocks;
CREATE POLICY "blocks_delete_own"
  ON public.user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- =============================================
-- 7. PROFILES: last_seen_at for presence/last-seen text
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- 8. STORAGE BUCKET for voice notes
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-voice', 'chat-voice', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "chat_voice_select" ON storage.objects;
CREATE POLICY "chat_voice_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-voice');

DROP POLICY IF EXISTS "chat_voice_insert" ON storage.objects;
CREATE POLICY "chat_voice_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-voice' AND auth.role() = 'authenticated');

-- =============================================
-- 9. GROUP CONVERSATION CREATE HELPER (RPC)
-- Creates a group conversation + inserts creator as admin + members as participants
-- in one atomic call (avoids RLS chicken-and-egg on first participant insert).
-- =============================================
CREATE OR REPLACE FUNCTION public.create_group_conversation(
  group_name TEXT,
  creator_id UUID,
  member_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
  new_conv_id UUID;
  member_id UUID;
BEGIN
  INSERT INTO public.conversations (type, name, created_by)
  VALUES ('group', group_name, creator_id)
  RETURNING id INTO new_conv_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id, is_admin)
  VALUES (new_conv_id, creator_id, TRUE);

  FOREACH member_id IN ARRAY member_ids LOOP
    IF member_id <> creator_id THEN
      INSERT INTO public.conversation_participants (conversation_id, user_id, is_admin)
      VALUES (new_conv_id, member_id, FALSE)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN new_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. ENABLE REALTIME on new tables
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'message_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pinned_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
  END IF;
END $$;
