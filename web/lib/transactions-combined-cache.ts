/**
 * Client cache for `/api/transactions?type=all` combined rows (send + hub + referral payouts).
 * Persisted to localStorage so `/transactions` and cold navigations match /send-style instant paint.
 */

export const COMBINED_TX_CACHE_TTL_MS = 5 * 60 * 1000

export function combinedTransactionsStorageKey(userId: string): string {
  return `ciuna_combined_transactions_${userId}`
}

export function readStaleCombinedTransactionsCache(userId: string): unknown[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(combinedTransactionsStorageKey(userId))
    if (!raw) return null
    const { value } = JSON.parse(raw) as { value?: unknown }
    return Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

export function isCombinedTransactionsCacheFresh(userId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(combinedTransactionsStorageKey(userId))
    if (!raw) return false
    const { timestamp } = JSON.parse(raw) as { timestamp?: number }
    return typeof timestamp === "number" && Date.now() - timestamp < COMBINED_TX_CACHE_TTL_MS
  } catch {
    return false
  }
}

export function writeCombinedTransactionsCache(userId: string, value: unknown[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      combinedTransactionsStorageKey(userId),
      JSON.stringify({
        value,
        timestamp: Date.now(),
      }),
    )
  } catch {
    /* quota / private mode */
  }
}
