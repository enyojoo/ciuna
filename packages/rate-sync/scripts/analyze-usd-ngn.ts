/**
 * Compare USD→NGN: naive USDT-bridge mid vs Ciuna pipeline (for competitiveness checks).
 * Run: npx tsx scripts/analyze-usd-ngn.ts
 */
import { fetchBuySellForCurrency } from "../src/p2p-fetch"
import { pipeline, tierForCurrency } from "../src/pricing-model"

async function main() {
  const usd = await fetchBuySellForCurrency("USD")
  const ngn = await fetchBuySellForCurrency("NGN")
  const mid = (b: number, s: number) => (b + s) / 2

  const usdMid = mid(usd.buy, usd.sell)
  const ngnMid = mid(ngn.buy, ngn.sell)
  /** Both legs as “fiat per 1 USDT”; bridge mid NGN per USD */
  const naiveMidCross = ngnMid / usdMid

  const tU = tierForCurrency("USD")
  const tN = tierForCurrency("NGN")
  const u = pipeline(usd.buy, usd.sell, tU)
  const n = pipeline(ngn.buy, ngn.sell, tN)
  const ciunaCross = n.ciuna_sell / u.ciuna_buy

  console.log(
    JSON.stringify(
      {
        asOf: new Date().toISOString(),
        USD: { ...usd, mid: usdMid },
        NGN: { ...ngn, mid: ngnMid },
        naive_mid_USDT_bridge_NGN_per_USD: naiveMidCross,
        ciuna_model_NGN_per_USD: ciunaCross,
        pct_below_naive_mid: ((1 - ciunaCross / naiveMidCross) * 100).toFixed(3) + "% (positive → customer gets fewer NGN vs naive mid)",
        note:
          "USD/EUR use Step B ×1. EM tiers use √1.03/√0.97 per leg so EM↔EM crosses get ~one ~3% layer vs naive mid. USD→NGN uses √ only on the NGN leg.",
      },
      null,
      2,
    ),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
