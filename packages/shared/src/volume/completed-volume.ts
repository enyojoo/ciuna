/** Matches `REFERRAL_PAYOUT:` mirror rows in `transactions`; not counted as customer send/hub volume. */
export const REFERRAL_PAYOUT_REFERENCE_PREFIX = "REFERRAL_PAYOUT:"

export function isReferralPayoutMirrorReference(reference: string | null | undefined): boolean {
  return typeof reference === "string" && reference.startsWith(REFERRAL_PAYOUT_REFERENCE_PREFIX)
}

export type CompletedVolumeExchangeRate = {
  from_currency: string
  to_currency: string
  rate: number
  status?: string | null
}

export type CompletedVolumeTransaction = {
  status?: string | null
  /** Optional UI-derived type */
  type?: string | null
  transaction_source?: string | null
  send_amount?: number | string | null
  send_currency?: string | null
  total_amount?: number | string | null
  reference?: string | null
}

function buildActiveRateMap(rates: CompletedVolumeExchangeRate[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of rates) {
    if (!r) continue
    if (r.status != null && r.status !== "active") continue
    const from = r.from_currency
    const to = r.to_currency
    if (typeof from !== "string" || typeof to !== "string") continue
    const rate = Number(r.rate)
    if (!Number.isFinite(rate) || rate <= 0) continue
    m.set(`${from}_${to}`, rate)
  }
  return m
}

function convertWithMap(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rateMap: Map<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount
  const directKey = `${fromCurrency}_${toCurrency}`
  const direct = rateMap.get(directKey)
  if (direct != null) return amount * direct
  const revKey = `${toCurrency}_${fromCurrency}`
  const rev = rateMap.get(revKey)
  if (rev != null && rev > 0) return amount / rev
  return 0
}

/**
 * Completed send + hub volume in `baseCurrency` using active exchange rates only.
 * Hub: `total_amount` (else `send_amount`) in `send_currency`. Send: `send_amount`.
 * Excludes referral payout mirror rows (`reference` prefix).
 */
export function sumCompletedVolumeInBaseCurrency(
  transactions: CompletedVolumeTransaction[] | null | undefined,
  baseCurrency: string,
  exchangeRates: CompletedVolumeExchangeRate[] | null | undefined,
): number {
  const base = (baseCurrency || "NGN").trim() || "NGN"
  const rateMap = buildActiveRateMap(exchangeRates || [])
  let total = 0

  for (const tx of transactions || []) {
    if (!tx || tx.status !== "completed") continue
    if (isReferralPayoutMirrorReference(tx.reference)) continue

    const isHub = tx.type === "hub" || tx.transaction_source === "hub"
    let amount = 0

    if (isHub) {
      amount = Number(tx.total_amount) || Number(tx.send_amount) || 0
    } else {
      const inferredType = tx.type || (Number(tx.send_amount) > 0 ? "send" : null)
      if (inferredType !== "send") continue
      amount = Number(tx.send_amount) || 0
    }

    if (amount <= 0) continue
    const currency = (typeof tx.send_currency === "string" && tx.send_currency.trim()
      ? tx.send_currency
      : base) as string
    total += convertWithMap(amount, currency, base, rateMap)
  }

  return total
}
