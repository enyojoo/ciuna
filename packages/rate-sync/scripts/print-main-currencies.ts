/**
 * One-off / ops: print model legs and sample crosses for main currencies (live fetch).
 * Run: npx tsx scripts/print-main-currencies.ts
 */
import { buildCiunaLegs, crossRate } from "../src/build-legs"

const codes = ["USD", "EUR", "RUB", "NGN", "KES", "GHS", "GBP"]

async function main() {
  const legs = await buildCiunaLegs(codes)

  const rows = codes.map((ccy) => {
    const L = legs[ccy]
    const mid = (L.ciuna_buy + L.ciuna_sell) / 2
    return {
      CCY: ccy,
      tier: L.tier,
      source: L.source,
      supplier_BUY: L.BUY,
      supplier_SELL: L.SELL,
      ciuna_buy: L.ciuna_buy,
      ciuna_sell: L.ciuna_sell,
      retail_wedge_pct_vs_mid_c: mid ? ((L.ciuna_buy - L.ciuna_sell) / mid) * 100 : 0,
    }
  })

  console.log(JSON.stringify({ asOf: new Date().toISOString(), legs: rows }, null, 2))

  const pairs: [string, string][] = [
    ["USD", "EUR"],
    ["USD", "NGN"],
    ["EUR", "NGN"],
    ["USD", "RUB"],
    ["RUB", "NGN"],
    ["NGN", "KES"],
    ["EUR", "RUB"],
    ["GBP", "USD"],
  ]
  const crosses: Record<string, number | null> = {}
  for (const [f, t] of pairs) {
    crosses[`${f}→${t}`] = crossRate(f, t, legs)
  }

  const naiveCross = (from: string, to: string) => {
    const a = legs[from]
    const b = legs[to]
    if (!a || !b) return null
    return b.mid / a.mid
  }
  const vsMid: Record<string, string | null> = {}
  for (const [f, t] of pairs) {
    const c = crosses[`${f}→${t}`]
    const n = naiveCross(f, t)
    vsMid[`${f}→${t}`] = c != null && n != null ? `${(((c / n - 1) * 100).toFixed(2))}% vs naive mid` : null
  }
  console.log(JSON.stringify({ crosses, vsMid }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
