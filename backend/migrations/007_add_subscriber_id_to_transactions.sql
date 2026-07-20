-- Migration 007: Add subscriber_id to transactions table
-- This fixes the bug where subscriptions were created with wrong subscriber_id

-- Add subscriber_id column to transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS subscriber_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update RLS policy to allow subscribers to read their own transactions
CREATE POLICY "transactions_select_subscriber"
  ON public.transactions FOR SELECT
  USING (auth.uid() = subscriber_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_subscriber_id ON public.transactions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_id ON public.transactions(gateway_transaction_id);
