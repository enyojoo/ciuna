/** Aligned with docs/ciuna-p2p-pricing-model.md */

/** **A** = USD anchor (pass-through Step B). **B** = every other fiat (EM-style **√** stack). */
export type TierName = "A" | "B"

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

/**
 * **Single ops knob** — symmetric retail spread around the USDT bridge (before Step C/D).
 *
 * - **Tier B** fiats: each leg uses **√(1 + s)** / **√(1 − s)** so a two-leg cross has roughly **one**
 *   effective layer vs naive mid (~**s**), where **s** = **`CIUNA_BRIDGE_MARGIN`**.
 * - **Tier A (USD only):** Step B **×1 / ×1** (USDT is dollar-denominated); margin sits on the other leg.
 * - **Step D caps** are **`CIUNA_BRIDGE_MARGIN + CAP_BUFFER`** (default **`CAP_BUFFER = 0`** → **4.5%** at default margin).
 *
 * Raise → wider vs market; lower → closer (do not go ≤ 0).
 *
 * Value is a **decimal fraction** (e.g. **4.5% → `4.5 / 100`**).
 */
export const CIUNA_BRIDGE_MARGIN = 4.5 / 100

const STEP_B_FULL_BUY = 1 + CIUNA_BRIDGE_MARGIN
const STEP_B_FULL_SELL = 1 - CIUNA_BRIDGE_MARGIN

const STEP_B_EM = {
  buyMult: Math.sqrt(STEP_B_FULL_BUY),
  sellMult: Math.sqrt(STEP_B_FULL_SELL),
}

/** Tier A (USD): no Step B stack on the ~USDT peg. */
const STEP_B_BRIDGE_CCY = { buyMult: 1, sellMult: 1 }

/** Step D caps vs `mid_c` — `CIUNA_BRIDGE_MARGIN + CAP_BUFFER` (buffer **0** → caps match margin, **4.5%** at default). */
const CAP_BUFFER = 0
const CAP_WIDE = {
  cap_buy: CIUNA_BRIDGE_MARGIN + CAP_BUFFER,
  cap_sell: CIUNA_BRIDGE_MARGIN + CAP_BUFFER,
}

export function tierForCurrency(ccy: string): TierParams {
  if (ccy === "USD") {
    return {
      b: 0,
      m: 0.002,
      name: "A",
      ...STEP_B_BRIDGE_CCY,
      ...CAP_WIDE,
    }
  }
  return {
    b: 0,
    m: 0.005,
    name: "B",
    ...STEP_B_EM,
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
