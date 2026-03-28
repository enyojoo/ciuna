-- Optional: completion timestamp for sends (used by some app code when present).
-- Run if you want `completed_at` on transactions; PostgREST must see the column (reload schema if needed).
-- The referral payout complete API works without this column by using `updated_at` only.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS completed_at timestamptz NULL;

COMMENT ON COLUMN public.transactions.completed_at IS
  'When the transfer reached completed status; may be null if only updated_at is used.';
