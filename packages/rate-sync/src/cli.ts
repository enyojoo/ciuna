#!/usr/bin/env npx tsx
/**
 * Usage:
 *   npm run sync:rates -- --dry-run
 *   RATE_SYNC_DEBUG=1 npm run sync:rates   # stderr JSON per currency (tiers, B′, legs)
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadDotenv } from "dotenv"
import { syncExchangeRatesFromModel } from "./sync-to-supabase"

function pathDepth(filePath: string): number {
  return filePath.split(path.sep).filter(Boolean).length
}

/** Load .env / .env.local from repo root outward (local overrides). */
function loadEnvFiles(): void {
  const roots = new Set<string>()
  const starts = [
    process.cwd(),
    path.dirname(fileURLToPath(import.meta.url)),
  ]
  for (const start of starts) {
    let dir = path.resolve(start)
    const seen = new Set<string>()
    for (let i = 0; i < 12; i++) {
      if (seen.has(dir)) break
      seen.add(dir)
      for (const name of [".env.local", ".env"]) {
        const p = path.join(dir, name)
        if (fs.existsSync(p)) roots.add(p)
      }
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }
  const ordered = [...roots].sort((a, b) => pathDepth(a) - pathDepth(b))
  for (const p of ordered) {
    loadDotenv({ path: p, override: true, quiet: true })
  }
}

loadEnvFiles()

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
