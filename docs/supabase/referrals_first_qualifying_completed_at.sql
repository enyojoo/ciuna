-- First qualifying completed send time per referred user (for tier quarterly counts). Run in Supabase SQL editor.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_first_qualifying_completed_at timestamptz NULL;

COMMENT ON COLUMN public.users.referral_first_qualifying_completed_at IS
  'Chronologically first qualifying completed send for this user as referee (non-payout reference). Set once when first computed.';

CREATE INDEX IF NOT EXISTS idx_users_referral_first_qualifying_at
  ON public.users (referred_by_user_id, referral_first_qualifying_completed_at)
  WHERE referred_by_user_id IS NOT NULL AND referral_first_qualifying_completed_at IS NOT NULL;

-- Optional backfill: set from min(completed_at) over qualifying transactions for referred users.
/*
WITH q AS (
  SELECT
    t.user_id,
    MIN(t.completed_at::timestamptz) AS first_at
  FROM public.transactions t
  WHERE t.status = 'completed'
    AND (t.reference IS NULL OR t.reference NOT LIKE 'REFERRAL_PAYOUT:%')
  GROUP BY t.user_id
)
UPDATE public.users u
SET referral_first_qualifying_completed_at = q.first_at
FROM q
WHERE u.id = q.user_id
  AND u.referred_by_user_id IS NOT NULL
  AND u.referral_first_qualifying_completed_at IS NULL;
*/
