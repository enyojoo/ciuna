/**
 * Regression: Step A with b=0 must preserve raw p2p BUY/SELL (not collapse to mid).
 * Run: npx tsx scripts/verify-step-a.ts
 */
import assert from "node:assert/strict"
import { pipeline, tierForCurrency } from "../src/pricing-model"

const t = tierForCurrency("RUB")
const buy = 75.736
const sell = 81.264
const legs = pipeline(buy, sell, t)

assert.equal(legs.Bprime, buy, "Bprime should equal supplier BUY when b=0")
assert.equal(legs.Sprime, sell, "Sprime should equal supplier SELL when b=0")
assert.notEqual(legs.Bprime, legs.mid, "Bprime must not collapse to mid when BUY != mid")

console.log("OK — Step A preserves raw BUY/SELL when b=0")
