/** Aligned with docs/ciuna-p2p-pricing-model.md */

export type TierName = "A" | "B" | "C" | "B-other"

export interface TierParams {
  /** Step A: pull band as fraction of mid; `0` = use raw p2p BUY/SELL as B′/S′ (no compression). */
  b: number
  m: number
  cap_buy: number
  cap_sell: number
  name: TierName
  /** Step B: ciuna_buy_raw = B′ × buyMult */
  buyMult: number
  /** Step B: ciuna_sell_raw = S′ × sellMult */
  sellMult: number
}

/** Step B: symmetric ~3% retail skew on each side vs B′/S′ (`ciuna_buy_raw = B′×1.03`, `ciuna_sell_raw = S′×0.97`). */
const STEP_B = { buyMult: 1.03, sellMult: 0.97 }

/**
 * Step D caps (vs `mid_c`): must be large enough that they do NOT erase Step B after the configured skew.
 * Previously ~1–0.6% caps dominated the pipeline and collapsed published rates toward mid_c.
 */
const CAP_WIDE = { cap_buy: 0.08, cap_sell: 0.08 }

export function tierForCurrency(ccy: string): TierParams {
  if (ccy === "RUB") {
    return {
      b: 0,
      m: 0.01,
      name: "A",
      ...STEP_B,
      ...CAP_WIDE,
    }
  }
  if (ccy === "NGN" || ccy === "KES" || ccy === "GHS") {
    return {
      b: 0,
      m: 0.005,
      name: "B",
      ...STEP_B,
      ...CAP_WIDE,
    }
  }
  if (ccy === "USD" || ccy === "EUR") {
    return {
      b: 0,
      m: 0.002,
      name: "C",
      ...STEP_B,
      ...CAP_WIDE,
    }
  }
  return {
    b: 0,
    m: 0.005,
    name: "B-other",
    ...STEP_B,
    ...CAP_WIDE,
  }
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
  let cbr = Bp * t.buyMult
  let csr = Sp * t.sellMult
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
