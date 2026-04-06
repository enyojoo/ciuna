-- Stablecoin fields (no-op if already present).
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS crypto_asset text,
  ADD COLUMN IF NOT EXISTS crypto_network text,
  ADD COLUMN IF NOT EXISTS wallet_address text;

-- Allow stablecoin and mobile_money payment method types (replace legacy type check).
ALTER TABLE public.payment_methods
  DROP CONSTRAINT IF EXISTS payment_methods_type_check;

ALTER TABLE public.payment_methods
  ADD CONSTRAINT payment_methods_type_check
  CHECK (
    type IN ('bank_account', 'qr_code', 'stablecoin', 'mobile_money')
  );
