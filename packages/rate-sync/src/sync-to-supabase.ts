import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { buildCiunaLegs, crossRate, type LegMap } from "./build-legs"

export interface SyncResult {
  /** Rows with a computed rate (candidate upsert). Equals DB rows written when dryRun is false and upsert succeeds. */
  updated: number
  skipped: number
  pairs: Array<{ from_currency: string; to_currency: string; rate: number }>
  skippedPairs: Array<{ from_currency: string; to_currency: string; reason: string }>
  legs: LegMap
}

/**
 * Loads all exchange_rates rows, recomputes rate from P2P model where both legs exist.
 * Upserts only from_currency, to_currency, rate, updated_at (preserves fees etc. on existing rows).
 */
export async function syncExchangeRatesFromModel(options: {
  supabaseUrl: string
  serviceRoleKey: string
  dryRun?: boolean
}): Promise<SyncResult> {
  const { supabaseUrl, serviceRoleKey, dryRun } = options
  const supabase: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: rows, error: loadError } = await supabase
    .from("exchange_rates")
    .select("from_currency, to_currency")

  if (loadError) throw loadError
  if (!rows?.length) {
    return { updated: 0, skipped: 0, pairs: [], skippedPairs: [], legs: {} }
  }

  const codes = new Set<string>()
  for (const r of rows) {
    codes.add(r.from_currency as string)
    codes.add(r.to_currency as string)
  }

  const legs = await buildCiunaLegs([...codes])

  const updates: Array<{ from_currency: string; to_currency: string; rate: number; updated_at: string }> =
    []
  const skippedPairs: Array<{ from_currency: string; to_currency: string; reason: string }> = []

  for (const r of rows) {
    const from = r.from_currency as string
    const to = r.to_currency as string
    if (from === to) {
      skippedPairs.push({ from_currency: from, to_currency: to, reason: "same currency" })
      continue
    }
    const fromLeg = legs[from]
    const toLeg = legs[to]
    const legSourceOk = (ccy: string, leg: (typeof legs)[string] | undefined) => {
      if (!leg) return false
      if (ccy === "USD") return !leg.source.includes("fallback")
      return leg.source === "p2p.army"
    }
    if (!legSourceOk(from, fromLeg) || !legSourceOk(to, toLeg)) {
      skippedPairs.push({
        from_currency: from,
        to_currency: to,
        reason: `supplier leg unavailable (${from}:${fromLeg?.source ?? "missing"}, ${to}:${toLeg?.source ?? "missing"})`,
      })
      continue
    }
    const rate = crossRate(from, to, legs)
    if (rate == null || !Number.isFinite(rate) || rate <= 0) {
      skippedPairs.push({ from_currency: from, to_currency: to, reason: "missing leg or invalid rate" })
      continue
    }
    updates.push({
      from_currency: from,
      to_currency: to,
      rate: Number(rate.toPrecision(14)),
      updated_at: new Date().toISOString(),
    })
  }

  if (!dryRun && updates.length > 0) {
    const { error: upErr } = await supabase.from("exchange_rates").upsert(updates, {
      onConflict: "from_currency,to_currency",
    })
    if (upErr) throw upErr
  }

  return {
    updated: updates.length,
    skipped: skippedPairs.length,
    pairs: updates.map((u) => ({
      from_currency: u.from_currency,
      to_currency: u.to_currency,
      rate: u.rate,
    })),
    skippedPairs,
    legs,
  }
}
