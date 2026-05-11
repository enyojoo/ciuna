/**
 * EUR corridor sanity: naive USDT-bridge mid vs Ciuna model (catch under-margined EUR legs).
 * Run: npx tsx scripts/analyze-eur-crosses.ts
 */
import { fetchBuySellForCurrency } from "../src/p2p-fetch"
import { pipeline, tierForCurrency } from "../src/pricing-model"
import { crossRate, type LegMap } from "../src/build-legs"

function mid(buy: number, sell: number): number {
  return (buy + sell) / 2
}

/** `to` per one `from` via naive mids (fiat/USDT legs). */
function naiveCross(fromBuy: number, fromSell: number, toBuy: number, toSell: number): number {
  return mid(toBuy, toSell) / mid(fromBuy, fromSell)
}

function pctCiunaVsNaive(ciuna: number, naive: number): string {
  // positive → Ciuna quote is higher → customer gets more `to` per `from` vs naive mid → more generous
  return ((ciuna / naive - 1) * 100).toFixed(3) + "%"
}

async function legsFor(ccy: string): Promise<LegMap[string]> {
  const { buy, sell, source } = await fetchBuySellForCurrency(ccy)
  const t = tierForCurrency(ccy)
  return { ...pipeline(buy, sell, t), source }
}

async function main() {
  const codes = ["EUR", "RUB", "USD", "NGN", "KES", "GHS"] as const
  const legs: LegMap = {} as LegMap
  for (const c of codes) {
    legs[c] = await legsFor(c)
  }

  const e = legs.EUR
  const rows: Record<string, unknown>[] = []
  for (const c of codes) {
    if (c === "EUR") continue
    const o = legs[c]
    const n = naiveCross(e.BUY, e.SELL, o.BUY, o.SELL)
    const ciuna = crossRate("EUR", c, legs)!
    const nRev = naiveCross(o.BUY, o.SELL, e.BUY, e.SELL)
    const ciRev = crossRate(c, "EUR", legs)!
    rows.push({
      pair: `EUR→${c}`,
      tier_EUR: tierForCurrency("EUR").name,
      tier_to: tierForCurrency(c).name,
      naive_mid_to_per_from: n,
      ciuna_model_to_per_from: ciuna,
      pct_ciuna_vs_naive_customer_favor: pctCiunaVsNaive(ciuna, n),
      pair_rev: `${c}→EUR`,
      pct_ciuna_vs_naive_rev: pctCiunaVsNaive(ciRev, nRev),
    })
  }

  console.log(
    JSON.stringify(
      {
        asOf: new Date().toISOString(),
        EUR: {
          BUY: e.BUY,
          SELL: e.SELL,
          mid: mid(e.BUY, e.SELL),
          tier: tierForCurrency("EUR").name,
          buyMult: tierForCurrency("EUR").buyMult,
          sellMult: tierForCurrency("EUR").sellMult,
          m: tierForCurrency("EUR").m,
          source: e.source,
        },
        crosses: rows,
        note:
          "pct_ciuna_vs_naive: positive ⇒ model quote gives customer MORE destination per source vs naive mid (more generous). EUR is tier B (√) like other non-USD fiats.",
      },
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
