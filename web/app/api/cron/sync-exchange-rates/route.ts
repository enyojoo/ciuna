import { NextResponse, type NextRequest } from "next/server"
import { syncExchangeRatesFromModel } from "@ciuna/rate-sync"

/**
 * Scheduled FX refresh: P2P.army / model in docs/ciuna-p2p-pricing-model.md → Supabase exchange_rates.rate
 *
 * Vercel Cron: GET this path. Set CRON_SECRET in project env; Vercel sends Authorization: Bearer <CRON_SECRET>.
 * vercel.json schedule is once daily (06:00 UTC) — Hobby plans allow at most one cron run per day.
 * Manual: GET/POST with same header for ops or run `npm run sync:rates` locally/CI.
 */
export async function GET(request: NextRequest) {
  return handleCron(request)
}

export async function POST(request: NextRequest) {
  return handleCron(request)
}

function handleCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error("CRON_SECRET is not configured")
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 })
  }

  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 })
  }

  return runSync(url, key)
}

async function runSync(url: string, key: string) {
  try {
    const result = await syncExchangeRatesFromModel({
      supabaseUrl: url,
      serviceRoleKey: key,
      dryRun: false,
    })
    return NextResponse.json({
      ok: true,
      updated: result.updated,
      skipped: result.skipped,
      skippedSample: result.skippedPairs.slice(0, 15),
    })
  } catch (e) {
    console.error("sync-exchange-rates:", e)
    const message = e instanceof Error ? e.message : "Sync failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
