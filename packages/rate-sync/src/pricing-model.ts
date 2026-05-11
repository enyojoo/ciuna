/** Aligned with docs/ciuna-p2p-pricing-model.md */

export type TierName = "A" | "B" | "C" | "B-other"

export interface TierParams {
  b: number
  m: number
  cap_buy: number
  cap_sell: number
  name: TierName
}

export function tierForCurrency(ccy: string): TierParams {
  if (ccy === "RUB") {
    return { b: 0.01, m: 0.0075, cap_buy: 0.0125, cap_sell: 0.0175, name: "A" }
  }
  if (ccy === "NGN" || ccy === "KES" || ccy === "GHS") {
    return { b: 0.015, m: 0.005, cap_buy: 0.015, cap_sell: 0.02, name: "B" }
  }
  if (ccy === "USD" || ccy === "EUR") {
    return { b: 0.0025, m: 0.002, cap_buy: 0.004, cap_sell: 0.006, name: "C" }
  }
  return { b: 0.015, m: 0.005, cap_buy: 0.015, cap_sell: 0.02, name: "B-other" }
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(Math.max(x, lo), hi)
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
  const bandLo = -t.b * mid
  const bandHi = t.b * mid
  const Bp = mid + clamp(buy - mid, bandLo, bandHi)
  const Sp = mid + clamp(sell - mid, bandLo, bandHi)
  let cbr = Bp * 1.05
  let csr = Sp * 0.95
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
