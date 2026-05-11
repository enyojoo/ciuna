/** Aligned with docs/ciuna-p2p-pricing-model.md — raw BUY/SELL feed Step B+ (no pull-to-mid). */

export type TierName = "A" | "B" | "C" | "B-other"

export interface TierParams {
  m: number
  cap_buy: number
  cap_sell: number
  name: TierName
}

export function tierForCurrency(ccy: string): TierParams {
  if (ccy === "RUB") {
    return { m: 0.0075, cap_buy: 0.0125, cap_sell: 0.0175, name: "A" }
  }
  if (ccy === "NGN" || ccy === "KES" || ccy === "GHS") {
    return { m: 0.005, cap_buy: 0.015, cap_sell: 0.02, name: "B" }
  }
  if (ccy === "USD" || ccy === "EUR") {
    return { m: 0.002, cap_buy: 0.004, cap_sell: 0.006, name: "C" }
  }
  return { m: 0.005, cap_buy: 0.015, cap_sell: 0.02, name: "B-other" }
}

export interface CiunaLegs {
  BUY: number
  SELL: number
  mid: number
  Bprime: number
  Sprime: number
  ciuna_buy: number
  ciuna_sell: number
  tier: TierName
}

export function pipeline(buy: number, sell: number, t: TierParams): CiunaLegs {
  const mid = (buy + sell) / 2
  const Bp = buy
  const Sp = sell
  let cbr = Bp * 1.03
  let csr = Sp * 0.97
  if (cbr < csr * (1 + t.m)) {
    cbr = csr * (1 + t.m)
  }
  let cb = cbr
  let cs = csr
  const mid_c = (cb + cs) / 2
  cb = Math.min(cb, mid_c * (1 + t.cap_buy))
  cs = Math.max(cs, mid_c * (1 - t.cap_sell))
  return {
    BUY: buy,
    SELL: sell,
    mid,
    Bprime: Bp,
    Sprime: Sp,
    ciuna_buy: cb,
    ciuna_sell: cs,
    tier: t.name,
  }
}
