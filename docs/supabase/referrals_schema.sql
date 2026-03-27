-- Referrals & affiliates — run in Supabase SQL editor (or migrate via CLI).
-- Adjust if `users` / `transactions` already have conflicting column names.

-- 1) users: referral slug + attribution
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_user_id uuid REFERENCES public.users (id);

CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users (referred_by_user_id);

COMMENT ON COLUMN public.users.referral_slug IS 'Opaque public slug for referral URLs; set once.';
COMMENT ON COLUMN public.users.referred_by_user_id IS 'User who referred this account; set once at signup.';

-- 2) Credit ledger (referrer rewards)
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  referrer_user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  referee_user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  source_transaction_id text REFERENCES public.transactions (transaction_id) ON DELETE SET NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('threshold_unlock', 'percent_of_send')),
  amount_policy_currency numeric NOT NULL,
  policy_currency text NOT NULL DEFAULT 'USD',
  amount_display numeric NOT NULL,
  display_currency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON public.referral_rewards (referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referee ON public.referral_rewards (referee_user_id);

-- One threshold unlock per referee (enforced in app + partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_rewards_threshold_once
  ON public.referral_rewards (referee_user_id)
  WHERE reward_type = 'threshold_unlock';

-- One percent reward per source txn
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_rewards_percent_txn
  ON public.referral_rewards (source_transaction_id)
  WHERE reward_type = 'percent_of_send' AND source_transaction_id IS NOT NULL;

-- 3) Payout / withdrawal requests
CREATE TABLE IF NOT EXISTS public.referral_payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.recipients (id) ON DELETE RESTRICT,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'cancelled', 'failed')
  ),
  linked_transaction_id text REFERENCES public.transactions (transaction_id) ON DELETE SET NULL,
  -- Reserved at request time (ETID format); used when inserting the completed send row.
  payout_transaction_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now (),
  updated_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX IF NOT EXISTS idx_referral_payout_user ON public.referral_payout_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_referral_payout_status ON public.referral_payout_requests (status);

-- RLS
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_payout_requests ENABLE ROW LEVEL SECURITY;

-- referral_rewards: referrers can read their credits
DROP POLICY IF EXISTS "referral_rewards_select_own" ON public.referral_rewards;
CREATE POLICY "referral_rewards_select_own" ON public.referral_rewards
  FOR SELECT USING (auth.uid () = referrer_user_id);

-- referral_payout_requests: users see own rows
DROP POLICY IF EXISTS "referral_payout_select_own" ON public.referral_payout_requests;
CREATE POLICY "referral_payout_select_own" ON public.referral_payout_requests
  FOR SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "referral_payout_insert_own" ON public.referral_payout_requests;
CREATE POLICY "referral_payout_insert_own" ON public.referral_payout_requests
  FOR INSERT WITH CHECK (auth.uid () = user_id);

-- No client UPDATE/DELETE on payouts (Office uses service role)

-- Admin users (Office): manage payout queue
DROP POLICY IF EXISTS "admin_all_referral_payouts" ON public.referral_payout_requests;
CREATE POLICY "admin_all_referral_payouts" ON public.referral_payout_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid ())
  );

DROP POLICY IF EXISTS "admin_select_referral_rewards" ON public.referral_rewards;
CREATE POLICY "admin_select_referral_rewards" ON public.referral_rewards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid ())
  );

-- Seed default referral_program via Office Settings → Referrals, or insert manually into system_settings (key=referral_program, data_type=json).

-- If `referral_payout_requests` already existed without payout_transaction_id:
ALTER TABLE public.referral_payout_requests
  ADD COLUMN IF NOT EXISTS payout_transaction_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_payout_reserved_etid
  ON public.referral_payout_requests (payout_transaction_id)
  WHERE payout_transaction_id IS NOT NULL;
