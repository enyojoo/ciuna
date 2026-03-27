-- Payment/admin reference (e.g. REFERRAL_PAYOUT:<uuid> for referral withdrawals).
-- Run in Supabase SQL editor if API errors: "Could not find the 'reference' column of 'transactions'".
-- Afterward: Settings → API → Reload schema (if the API still caches the old shape).
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS reference text;
