import { fetchBuySellForCurrency } from "./p2p-fetch"
import { pipeline, tierForCurrency, type CiunaLegs } from "./pricing-model"

export type LegMap = Record<string, CiunaLegs & { source: string }>

/** Build final Ciuna legs for every currency code we need. */
export async function buildCiunaLegs(codes: string[]): Promise<LegMap> {
  const unique = [...new Set(codes)]
  const out: LegMap = {}
  for (const ccy of unique) {
    const { buy, sell, source: src } = await fetchBuySellForCurrency(ccy)
    const t = tierForCurrency(ccy)
    const legs = pipeline(buy, sell, t)
    out[ccy] = { ...legs, source: src }
  }
  return out
}

/** Cross rate: 1 from = rate × to (USDT bridge). */
export function crossRate(from: string, to: string, legs: LegMap): number | null {
  const a = legs[from]
  const b = legs[to]
  if (!a || !b) return null
  if (!a.ciuna_buy || !b.ciuna_sell) return null
  return b.ciuna_sell / a.ciuna_buy
}
