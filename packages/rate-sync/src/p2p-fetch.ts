/** Fetch supplier BUY/SELL (fiat per USDT) from p2p.army or fallbacks. */

const P2P_BASE = "https://p2p.army/en/p2p/fiats"

export async function fetchText(url: string, timeoutMs = 55_000): Promise<string> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 CiunaRateSync/1.0" },
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return await res.text()
  } finally {
    clearTimeout(t)
  }
}

export function parseP2pArmyBuySell(html: string): { buy: number | null; sell: number | null } {
  const buyH = /<h4[^>]*>\s*BUY\s+Section/i.exec(html)
  const sellH = /<h4[^>]*>\s*SELL\s+section/i.exec(html)
  if (!buyH || !sellH) return { buy: null, sell: null }
  const buyBlock = html.slice(buyH.index + buyH[0].length, sellH.index)
  const sellBlock = html.slice(sellH.index + sellH[0].length, sellH.index + sellH[0].length + 90_000)

  const meanUsdt = (block: string): number | null => {
    const re = /asset=USDT" class="mono _price">([^<]+)<\/a>/g
    const prices: number[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(block)) !== null) {
      const s = m[1].replace(/\xa0/g, "").replace(/\s/g, "").replace(",", ".")
      const v = parseFloat(s)
      if (!Number.isNaN(v)) prices.push(v)
    }
    if (!prices.length) return null
    return prices.reduce((a, b) => a + b, 0) / prices.length
  }

  return { buy: meanUsdt(buyBlock), sell: meanUsdt(sellBlock) }
}

export async function fetchErRate(usdPerUnit: string): Promise<number> {
  const j = (await fetchText(`https://open.er-api.com/v6/latest/USD`, 25_000)) as string
  const data = JSON.parse(j) as { rates?: Record<string, number> }
  const r = data.rates?.[usdPerUnit]
  if (typeof r !== "number") throw new Error(`ER-API missing ${usdPerUnit}`)
  return r
}

export async function fetchUsdtUsdLast(): Promise<number> {
  const j = await fetchText("https://api.bybit.com/v5/market/tickers?category=spot&symbol=USDTUSD", 20_000)
  const data = JSON.parse(j) as { result?: { list?: { lastPrice?: string }[] } }
  const last = data.result?.list?.[0]?.lastPrice
  if (last != null) return parseFloat(last)
  return 1
}

export async function fetchBuySellForCurrency(
  ccy: string,
): Promise<{ buy: number; sell: number; source: string }> {
  if (ccy === "USD") {
    const last = await fetchUsdtUsdLast()
    return { buy: last, sell: last, source: "Bybit USDTUSD last" }
  }

  try {
    const html = await fetchText(`${P2P_BASE}/${ccy}`, 55_000)
    const { buy, sell } = parseP2pArmyBuySell(html)
    if (buy != null && sell != null) {
      return { buy, sell, source: "p2p.army" }
    }
  } catch {
    /* fall through */
  }

  const v = await fetchErRate(ccy)
  return { buy: v, sell: v, source: "open.er-api fallback" }
}
