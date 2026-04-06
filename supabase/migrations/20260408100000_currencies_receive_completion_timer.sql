-- SLA window for transfers where this currency is the receive side (used by web/office timers and /send "Arrives in").
ALTER TABLE public.currencies
  ADD COLUMN IF NOT EXISTS receive_completion_timer_seconds integer NOT NULL DEFAULT 3600;

-- Payment method forms no longer set this; ensure inserts that omit the column still succeed.
ALTER TABLE public.payment_methods
  ALTER COLUMN completion_timer_seconds SET DEFAULT 3600;
