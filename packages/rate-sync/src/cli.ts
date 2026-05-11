#!/usr/bin/env npx tsx
/**
 * Usage:
 *   npm run sync:rates -- --dry-run
 */
import { syncExchangeRatesFromModel } from "./sync-to-supabase"

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }
  console.log(dryRun ? "DRY RUN — no DB writes" : "Writing to Supabase...")
  const res = await syncExchangeRatesFromModel({ supabaseUrl: url, serviceRoleKey: key, dryRun })
  console.log(
    JSON.stringify(
      {
        wouldUpdate: res.updated,
        rowsWritten: dryRun ? 0 : res.updated,
        skipped: res.skipped,
      },
      null,
      2,
    ),
  )
  if (res.skippedPairs.length && res.skippedPairs.length <= 20) {
    console.log("skipped:", res.skippedPairs)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
