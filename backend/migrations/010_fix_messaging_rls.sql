-- Fix messaging RLS for direct conversation creation.
-- Run after 008_create_messaging_tables.sql.

DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "conversations_insert_authenticated" ON public.conversations;
CREATE POLICY "conversations_insert_authenticated"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "participants_insert_own" ON public.conversation_participants;
CREATE POLICY "participants_insert_own"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.conversation_participants existing
      WHERE existing.conversation_id = conversation_participants.conversation_id
        AND existing.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
END $$;
