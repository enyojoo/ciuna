-- Referral percent reward window (per referee). Run in Supabase SQL editor.
-- Immutable end time is set when the first percent window is computed for a referred user.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_percent_window_ends_at timestamptz NULL;

COMMENT ON COLUMN public.users.referral_percent_window_ends_at IS
  'When set: percent- and tier-mode referral rewards for this user as referee only apply to completed sends with completed_at <= this instant. Set once from first qualifying send min(completed_at) + duration at snapshot.';

-- Optional one-time backfill for legacy referees who already have percent_of_send rewards.
-- Uses min(completed_at) from qualifying transactions; duration from current referral_program in system_settings (adjust N manually if needed).
/*
WITH program AS (
  SELECT (value::jsonb->>'percent_reward_duration_months')::int AS months
  FROM public.system_settings
  WHERE key = 'referral_program'
  LIMIT 1
),
qualifying AS (
  SELECT
    t.user_id,
    MIN(t.completed_at::timestamptz) AS first_at
  FROM public.transactions t
  WHERE t.status = 'completed'
    AND (t.reference IS NULL OR t.reference NOT LIKE 'REFERRAL_PAYOUT:%')
  GROUP BY t.user_id
)
UPDATE public.users u
SET referral_percent_window_ends_at = q.first_at
  + (COALESCE((SELECT months FROM program), 6) || ' months')::interval
FROM qualifying q
WHERE u.id = q.user_id
  AND u.referred_by_user_id IS NOT NULL
  AND u.referral_percent_window_ends_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.referral_rewards rr
    WHERE rr.referee_user_id = u.id AND rr.reward_type = 'percent_of_send'
  );
*/
