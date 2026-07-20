-- Migration 009: Voice/Video Call tables
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CALL_SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  caller_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  callee_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_type       TEXT NOT NULL CHECK (call_type IN ('voice', 'video')),
  status          TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'accepted', 'declined', 'ended', 'missed')),
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

-- RLS: Caller or callee can read their own call sessions
CREATE POLICY "call_sessions_select_participant"
  ON public.call_sessions FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- RLS: Caller can insert new call sessions
CREATE POLICY "call_sessions_insert_caller"
  ON public.call_sessions FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

-- RLS: Callee can update status (accept/decline), either party can end
CREATE POLICY "call_sessions_update_participant"
  ON public.call_sessions FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- =============================================
-- 2. INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_call_sessions_conversation_id ON public.call_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_callee_id ON public.call_sessions(callee_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON public.call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_created_at ON public.call_sessions(created_at DESC);

-- =============================================
-- 3. ENABLE REALTIME on call_sessions table
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_sessions;
