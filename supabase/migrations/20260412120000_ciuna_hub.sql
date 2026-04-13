-- Ciuna Hub: marketplace products + hub transaction metadata
-- Apply in Supabase SQL editor or via supabase db push.

-- ---------------------------------------------------------------------------
-- hub_products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hub_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text,
  long_description text,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),
  pricing_type text NOT NULL CHECK (pricing_type IN ('fixed', 'user_input')),
  fixed_amount numeric,
  fixed_currency text,
  default_input_currency text DEFAULT 'USD',
  fee_percent numeric,
  funded_min numeric,
  funded_max numeric,
  billing_context text CHECK (billing_context IS NULL OR billing_context IN ('one_time', 'recurring')),
  sla_text text,
  internal_notes text,
  image_url text,
  form_schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_products_status ON public.hub_products (status);
CREATE INDEX IF NOT EXISTS idx_hub_products_category ON public.hub_products (category);
CREATE INDEX IF NOT EXISTS idx_hub_products_sort ON public.hub_products (sort_order, created_at DESC);

ALTER TABLE public.hub_products
  ADD COLUMN IF NOT EXISTS image_url text;

-- ---------------------------------------------------------------------------
-- transactions: hub columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS transaction_source text NOT NULL DEFAULT 'send';

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS hub_product_id uuid REFERENCES public.hub_products (id) ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS hub_snapshot jsonb;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS hub_fee_amount numeric NOT NULL DEFAULT 0;

UPDATE public.transactions
SET transaction_source = 'send'
WHERE transaction_source IS NULL;

COMMENT ON COLUMN public.transactions.transaction_source IS 'send | hub';
COMMENT ON COLUMN public.transactions.hub_snapshot IS 'Immutable Hub order snapshot for UI/support';

CREATE INDEX IF NOT EXISTS idx_transactions_transaction_source ON public.transactions (transaction_source);
CREATE INDEX IF NOT EXISTS idx_transactions_hub_product_id ON public.transactions (hub_product_id);

-- Idempotent Hub checkout: one row per user + HUB:idempotencyKey
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_user_hub_idempotency
  ON public.transactions (user_id, reference)
  WHERE reference IS NOT NULL AND reference LIKE 'HUB:%';

-- ---------------------------------------------------------------------------
-- RLS: catalog readable for live products (anon + authenticated)
-- ---------------------------------------------------------------------------
ALTER TABLE public.hub_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hub_products_select_live_anon" ON public.hub_products;
CREATE POLICY "hub_products_select_live_anon"
  ON public.hub_products FOR SELECT TO anon
  USING (status = 'live');

DROP POLICY IF EXISTS "hub_products_select_live_authenticated" ON public.hub_products;
CREATE POLICY "hub_products_select_live_authenticated"
  ON public.hub_products FOR SELECT TO authenticated
  USING (status = 'live');

-- Writes go through service role (admin API) — no insert/update policies for end users.
