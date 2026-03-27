-- Allow tier_percent_of_send in referral_rewards and unique per source transaction (like percent_of_send).
-- Run in Supabase SQL editor after referrals_schema.sql.

ALTER TABLE public.referral_rewards DROP CONSTRAINT IF EXISTS referral_rewards_reward_type_check;

ALTER TABLE public.referral_rewards
  ADD CONSTRAINT referral_rewards_reward_type_check
  CHECK (reward_type IN ('threshold_unlock', 'percent_of_send', 'tier_percent_of_send'));

COMMENT ON COLUMN public.referral_rewards.reward_type IS
  'threshold_unlock | percent_of_send | tier_percent_of_send';

CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_rewards_tier_percent_txn
  ON public.referral_rewards (source_transaction_id)
  WHERE reward_type = 'tier_percent_of_send' AND source_transaction_id IS NOT NULL;
