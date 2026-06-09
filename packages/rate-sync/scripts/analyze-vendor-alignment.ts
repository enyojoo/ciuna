/**
 * Compare published crosses vs vendor p2p legs and example targets.
 * Run: npx tsx scripts/analyze-vendor-alignment.ts
 */
import { fetchBuySellForCurrency } from "../src/p2p-fetch"
import { crossRate } from "../src/build-legs"
import { pipeline, tierForCurrency } from "../src/pricing-model"

async function main() {
  const rub = await fetchBuySellForCurrency("RUB")
  const ngn = await fetchBuySellForCurrency("NGN")
  const usd = await fetchBuySellForCurrency("USD")
  const legs = {
    RUB: { ...pipeline(rub.buy, rub.sell, tierForCurrency("RUB")), source: rub.source },
    NGN: { ...pipeline(ngn.buy, ngn.sell, tierForCurrency("NGN")), source: ngn.source },
    USD: { ...pipeline(usd.buy, usd.sell, tierForCurrency("USD")), source: usd.source },
  }

  console.log(
    JSON.stringify(
      {
        asOf: new Date().toISOString(),
        supplier: { RUB: rub, NGN: ngn, USD: usd },
        targets: { RUB_NGN: 16.51, USD_NGN: 1352.86 },
        vendorRaw: {
          NGN_SELL_div_RUB_BUY: ngn.sell / rub.buy,
          NGN_SELL_div_USD: ngn.sell / usd.buy,
        },
        model: {
          RUB_NGN: crossRate("RUB", "NGN", legs),
          USD_NGN: crossRate("USD", "NGN", legs),
          send_5200_RUB_to_NGN: 5200 * (crossRate("RUB", "NGN", legs) ?? 0),
          rub_ciuna_buy: legs.RUB.ciuna_buy,
          ngn_ciuna_sell: legs.NGN.ciuna_sell,
          ngn_ciuna_sell_vs_supplier: legs.NGN.ciuna_sell / ngn.sell,
        },
        note:
          "Model: ciuna_buy = BUY×(1+s) [Step C may bind inverted books to SELL×(1+m)]; ciuna_sell = vendor SELL; no Step D caps.",
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
