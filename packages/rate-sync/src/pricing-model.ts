/** Aligned with docs/ciuna-p2p-pricing-model.md */

/** **A** = USD anchor (pass-through Step B). **B** = every other fiat (buy-side margin + vendor SELL). */
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
 * **Single ops knob** — retail spread on the USDT bridge (before Step C).
 *
 * - **Tier B** fiats: **`buyMult = 1 + s`** on the leg where the customer **buys USDT** (pays more fiat).
 *   **`sellMult = 1`** — publish **`ciuna_sell` at vendor SELL** (fiat per USDT when disposing USDT),
 *   matching desk / p2p reality on the exit leg (e.g. USD→NGN ≈ NGN SELL).
 * - **Tier A (USD only):** Step B **×1 / ×1** (USDT peg leg).
 * - **Step D caps removed** — they pulled `ciuna_sell` toward `mid_c` on wide books (NGN, GBP, …),
 *   inflating crosses vs vendor SELL.
 *
 * Value is a **decimal fraction** (e.g. **5% → `5 / 100`**).
 */
export const CIUNA_BRIDGE_MARGIN = 5 / 100

const STEP_B_FULL_BUY = 1 + CIUNA_BRIDGE_MARGIN

/** Tier B: full margin acquiring USDT; pass through supplier SELL on USDT disposal. */
const STEP_B_EM = {
  buyMult: STEP_B_FULL_BUY,
  sellMult: 1,
}

/** Tier A (USD): no Step B stack on the ~USDT peg. */
const STEP_B_BRIDGE_CCY = { buyMult: 1, sellMult: 1 }

export function tierForCurrency(ccy: string): TierParams {
  if (ccy === "USD") {
    return {
      b: 0,
      m: 0.002,
      name: "A",
      ...STEP_B_BRIDGE_CCY,
      cap_buy: 0,
      cap_sell: 0,
    }
  }
  return {
    b: 0,
    /** Inverted P2P books (RUB): Step C binds `ciuna_buy` to `SELL × (1+m)` — tune for corridor targets. */
    m: 0.015,
    name: "B",
    ...STEP_B_EM,
    cap_buy: 0,
    cap_sell: 0,
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
  // b = 0 → pass through raw p2p BUY/SELL (clamp(..., 0, 0) would collapse both legs to mid).
  const Bp =
    t.b === 0 ? buy : mid + clamp(buy - mid, -t.b * mid, t.b * mid)
  const Sp =
    t.b === 0 ? sell : mid + clamp(sell - mid, -t.b * mid, t.b * mid)
  let cbr = Bp * t.buyMult
  let csr = Sp * t.sellMult
  if (cbr < csr * (1 + t.m)) {
    cbr = csr * (1 + t.m)
  }
  let cb = cbr
  let cs = csr
  if (t.cap_buy > 0 || t.cap_sell > 0) {
    const mid_c = (cb + cs) / 2
    cb = Math.min(cb, mid_c * (1 + t.cap_buy))
    cs = Math.max(cs, mid_c * (1 - t.cap_sell))
  }
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
