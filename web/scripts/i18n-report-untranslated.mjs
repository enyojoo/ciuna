#!/usr/bin/env node
/**
 * Reports leaf keys where a locale string still matches English (copy-paste debt).
 * Usage: node scripts/i18n-report-untranslated.mjs [ru|fr|es]
 */

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesRoot = join(__dirname, "..", "locales")

function flatten(obj, prefix = "") {
  /** @type {Record<string, string>} */
  const out = {}
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k
      Object.assign(out, flatten(v, p))
    }
  } else {
    out[prefix] = String(obj)
  }
  return out
}

const en = flatten(JSON.parse(readFileSync(join(localesRoot, "en", "app.json"), "utf8")))
const target = process.argv[2] || "ru"
if (!["ru", "fr", "es"].includes(target)) {
  console.error("Usage: node scripts/i18n-report-untranslated.mjs [ru|fr|es]")
  process.exit(1)
}

const loc = flatten(JSON.parse(readFileSync(join(localesRoot, target, "app.json"), "utf8")))
const identical = []
for (const key of Object.keys(en)) {
  if (!(key in loc)) {
    identical.push(`${key} (MISSING)`)
    continue
  }
  if (loc[key] === en[key]) identical.push(key)
}

console.log(`Locale: ${target} — ${identical.length} keys identical to en/${Object.keys(en).length} (${((identical.length / Object.keys(en).length) * 100).toFixed(1)}%)`)
for (const line of identical) console.log(line)
