-- Logistics fee semantics (cash_hand): percentage and fixed amounts apply to the **receive**
-- (to_currency) side; the app converts to send currency using the corridor rate for total_to_pay.
COMMENT ON COLUMN public.exchange_rates.logistics_fee_type IS 'Cash_hand only: free | fixed (amount in to_currency) | percentage (% of receive amount in to_currency).';
COMMENT ON COLUMN public.exchange_rates.logistics_fee_amount IS 'Interpretation depends on logistics_fee_type: % of receive, or fixed in to_currency (receiver currency).';
