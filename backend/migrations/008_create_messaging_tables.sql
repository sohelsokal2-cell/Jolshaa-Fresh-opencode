-- Migration 008: Messaging (Chat) tables
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_insert_authenticated" ON public.conversations;
CREATE POLICY "conversations_insert_authenticated"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 2. CONVERSATION_PARTICIPANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- 3. HELPER FUNCTION: is_conversation_participant
-- =============================================
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid, uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id AND user_id = uid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- 4. HELPER FUNCTION: get_unread_count
-- =============================================
CREATE OR REPLACE FUNCTION public.get_unread_count(conv_id uuid, uid uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM public.messages m
  WHERE m.conversation_id = conv_id
    AND m.sender_id != uid
    AND m.created_at > COALESCE(
      (SELECT last_read_at FROM public.conversation_participants
       WHERE conversation_id = conv_id AND user_id = uid),
      '1970-01-01'::timestamptz
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS: Participants can read their own participation rows
CREATE POLICY "participants_select_own"
  ON public.conversation_participants FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Participants can read other participants in same conversation
CREATE POLICY "participants_select_same_conversation"
  ON public.conversation_participants FOR SELECT
  USING (
    is_conversation_participant(conversation_participants.conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "participants_insert_own" ON public.conversation_participants;
CREATE POLICY "participants_insert_own"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants existing
      WHERE existing.conversation_id = conversation_participants.conversation_id
        AND existing.user_id = auth.uid()
    )
  );

-- RLS: Users can update their own last_read_at
CREATE POLICY "participants_update_own"
  ON public.conversation_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT,
  image_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CHECK (content IS NOT NULL OR image_url IS NOT NULL)
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS: Participants can read messages in their conversations
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- RLS: Participants can insert messages into their conversations
CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- =============================================
-- 6. TRIGGER: Update conversations.last_message_at on new message
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();

-- =============================================
-- 7. INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- =============================================
-- 8. STORAGE BUCKET for chat images
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can read chat images
CREATE POLICY "chat_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');

-- Storage policy: Authenticated users can upload chat images
CREATE POLICY "chat_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

-- =============================================
-- 9. ENABLE REALTIME on messages table
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
END $$;
