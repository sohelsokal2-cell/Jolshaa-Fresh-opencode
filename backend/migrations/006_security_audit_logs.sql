-- Migration 006: Security & Audit Logs
-- Run in Supabase SQL Editor

-- =============================================
-- 1. audit_logs TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  details     JSONB DEFAULT '{}',
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can insert audit logs (via service role or admin session)
CREATE POLICY "audit_logs_insert_admin"
  ON public.audit_logs FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- No UPDATE or DELETE — audit logs are append-only
