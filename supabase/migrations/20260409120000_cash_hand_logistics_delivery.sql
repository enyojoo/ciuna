-- Cash-by-hand corridors: receive windows, configurable logistics fee; delivery addresses; txn fulfillment snapshot.

-- exchange_rates: optional receive-currency windows + logistics (same semantics as fee_type/fee_amount; applies only to cash_hand fulfillment in app logic)
ALTER TABLE public.exchange_rates
  ADD COLUMN IF NOT EXISTS bank_receive_min numeric,
  ADD COLUMN IF NOT EXISTS bank_receive_max numeric,
  ADD COLUMN IF NOT EXISTS cash_receive_min numeric,
  ADD COLUMN IF NOT EXISTS cash_receive_max numeric,
  ADD COLUMN IF NOT EXISTS logistics_fee_type text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS logistics_fee_amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.exchange_rates DROP CONSTRAINT IF EXISTS exchange_rates_logistics_fee_type_check;
ALTER TABLE public.exchange_rates
  ADD CONSTRAINT exchange_rates_logistics_fee_type_check
  CHECK (logistics_fee_type IN ('free', 'fixed', 'percentage'));

COMMENT ON COLUMN public.exchange_rates.bank_receive_min IS 'Min they receive (to_currency); window active only when both min and max set.';
COMMENT ON COLUMN public.exchange_rates.logistics_fee_type IS 'Logistics for cash_hand only; free|fixed|percentage on you-send principal like fee_type.';

-- Saved delivery locations (single line + phone)
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  address_line text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS delivery_addresses_user_id_idx ON public.delivery_addresses (user_id);

ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users manage own delivery addresses" ON public.delivery_addresses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- transactions: fulfillment + resolved logistics + delivery snapshot
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS fulfillment_type text NOT NULL DEFAULT 'bank_transfer',
  ADD COLUMN IF NOT EXISTS logistics_fee_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS logistics_fee_type_snapshot text,
  ADD COLUMN IF NOT EXISTS delivery_address_line text,
  ADD COLUMN IF NOT EXISTS delivery_phone text,
  ADD COLUMN IF NOT EXISTS delivery_address_id uuid REFERENCES public.delivery_addresses (id) ON DELETE SET NULL;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_fulfillment_type_check;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_fulfillment_type_check
  CHECK (fulfillment_type IN ('bank_transfer', 'cash_hand'));

COMMENT ON COLUMN public.transactions.logistics_fee_amount IS 'Resolved logistics charge in send_currency included in total_amount (0 for bank_transfer).';
