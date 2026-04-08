-- Cash-by-hand transfers use delivery snapshot only; bank recipient is optional.
ALTER TABLE public.transactions
  ALTER COLUMN recipient_id DROP NOT NULL;

COMMENT ON COLUMN public.transactions.recipient_id IS 'Bank recipient for bank_transfer; NULL for cash_hand when no bank recipient is used.';
