import { addMonths, parseISO } from "date-fns"
import { createServerClient } from "@/lib/supabase"
import type { Transaction } from "@/types"
import {
  getReferralProgramSettingsServer,
  getUtcQuarterBoundsForDate,
  resolveTierPercent,
} from "@/lib/referral-program"
import { buildRateMap, convertWithRateMap } from "@/lib/referral-currency"

export const REFERRAL_PAYOUT_PREFIX = "REFERRAL_PAYOUT:"

function policyToDisplayAmount(
  amountPolicy: number,
  policyCurrency: string,
  displayCurrency: string,
  rateMap: Map<string, number>,
): { amount: number; currency: string } {
  const converted = convertWithRateMap(amountPolicy, policyCurrency, displayCurrency, rateMap)
  if (converted > 0) return { amount: converted, currency: displayCurrency }
  return { amount: amountPolicy, currency: policyCurrency }
}

function transactionCompletedAtIso(tx: Transaction): string {
  const raw = tx.completed_at || tx.updated_at || tx.created_at
  return raw
}

async function minQualifyingCompletedAt(
  supabase: ReturnType<typeof createServerClient>,
  refereeUserId: string,
  fallbackIso: string,
): Promise<Date> {
  const { data: rows } = await supabase
    .from("transactions")
    .select("completed_at, reference")
    .eq("user_id", refereeUserId)
    .eq("status", "completed")

  let minMs = Infinity
  for (const row of rows || []) {
    const ref = row.reference as string | undefined
    if (ref?.startsWith(REFERRAL_PAYOUT_PREFIX)) continue
    const ca = row.completed_at as string | undefined
    if (!ca) continue
    const t = parseISO(ca).getTime()
    if (!Number.isNaN(t) && t < minMs) minMs = t
  }
  if (minMs === Infinity) return parseISO(fallbackIso)
  return new Date(minMs)
}

async function countQualifiedRefereesInQuarter(
  supabase: ReturnType<typeof createServerClient>,
  referrerId: string,
  quarterStartIso: string,
  quarterEndIso: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_user_id", referrerId)
    .gte("referral_first_qualifying_completed_at", quarterStartIso)
    .lte("referral_first_qualifying_completed_at", quarterEndIso)

  if (error) {
    console.error("countQualifiedRefereesInQuarter:", error)
    return 0
  }
  return count ?? 0
}

/**
 * Called when a normal send transaction reaches `completed`. Credits referrer per program rules.
 */
export async function processReferralRewardsOnCompletedSend(transaction: Transaction): Promise<void> {
  try {
    if (transaction.status !== "completed") return
    if (transaction.reference?.startsWith(REFERRAL_PAYOUT_PREFIX)) return

    const program = await getReferralProgramSettingsServer()
    if (!program.program_active) return

    const supabase = createServerClient()
    const { data: exchangeRates } = await supabase.from("exchange_rates").select("*").eq("status", "active")
    const rateMap = buildRateMap(exchangeRates || [])

    const { data: referee, error: refereeErr } = await supabase
      .from("users")
      .select("id, referred_by_user_id, referral_percent_window_ends_at, referral_first_qualifying_completed_at")
      .eq("id", transaction.user_id)
      .single()

    if (refereeErr || !referee?.referred_by_user_id) return
    const referrerId = referee.referred_by_user_id as string
    if (referrerId === transaction.user_id) return

    const { data: referrer } = await supabase.from("users").select("id, base_currency").eq("id", referrerId).single()

    if (!referrer) return
    const referrerBase = (referrer.base_currency as string) || "USD"
    const policy = program.policy_currency

    if (program.mode === "percent" || program.mode === "tier") {
      const completedAtIso = transactionCompletedAtIso(transaction)
      let windowEndsAtIso = referee.referral_percent_window_ends_at as string | null | undefined
      const firstQualMissing = !referee.referral_first_qualifying_completed_at

      const minAt = await minQualifyingCompletedAt(supabase, transaction.user_id, completedAtIso)
      const minIso = minAt.toISOString()

      if (firstQualMissing) {
        await supabase
          .from("users")
          .update({ referral_first_qualifying_completed_at: minIso })
          .eq("id", transaction.user_id)
          .is("referral_first_qualifying_completed_at", null)
      }

      if (!windowEndsAtIso) {
        const endsAt = addMonths(minAt, program.percent_reward_duration_months)
        windowEndsAtIso = endsAt.toISOString()
        await supabase
          .from("users")
          .update({ referral_percent_window_ends_at: windowEndsAtIso })
          .eq("id", transaction.user_id)
          .is("referral_percent_window_ends_at", null)
        const { data: refetchW } = await supabase
          .from("users")
          .select("referral_percent_window_ends_at")
          .eq("id", transaction.user_id)
          .maybeSingle()
        if (refetchW?.referral_percent_window_ends_at) {
          windowEndsAtIso = refetchW.referral_percent_window_ends_at as string
        }
      }

      const txTime = parseISO(completedAtIso)
      const endTime = parseISO(windowEndsAtIso)
      if (Number.isNaN(txTime.getTime()) || Number.isNaN(endTime.getTime())) return
      if (txTime > endTime) return

      const sendInPolicy = convertWithRateMap(
        Number(transaction.send_amount),
        transaction.send_currency,
        policy,
        rateMap,
      )
      if (sendInPolicy <= 0) return

      let effectiveFraction = program.percent_of_send
      let rewardType: "percent_of_send" | "tier_percent_of_send" = "percent_of_send"

      if (program.mode === "tier") {
        const txDate = parseISO(completedAtIso)
        const { start, end } = getUtcQuarterBoundsForDate(txDate)
        const count = await countQualifiedRefereesInQuarter(
          supabase,
          referrerId,
          start.toISOString(),
          end.toISOString(),
        )
        effectiveFraction = resolveTierPercent(program.percent_tiers, count)
        rewardType = "tier_percent_of_send"
      }

      if (effectiveFraction <= 0) return
      const rewardPolicy = sendInPolicy * effectiveFraction
      if (rewardPolicy <= 0) return

      const display = policyToDisplayAmount(rewardPolicy, policy, referrerBase, rateMap)

      const { error: insErr } = await supabase.from("referral_rewards").insert({
        referrer_user_id: referrerId,
        referee_user_id: transaction.user_id,
        source_transaction_id: transaction.transaction_id,
        reward_type: rewardType,
        amount_policy_currency: rewardPolicy,
        policy_currency: policy,
        amount_display: display.amount,
        display_currency: display.currency,
      })
      if (insErr && insErr.code !== "23505") {
        console.error("referral_rewards insert (percent/tier):", insErr)
      }
      return
    }

    // threshold
    const { data: txs } = await supabase
      .from("transactions")
      .select("send_amount, send_currency, reference, status")
      .eq("user_id", transaction.user_id)
      .eq("status", "completed")

    let sumPolicy = 0
    for (const tx of txs || []) {
      const ref = tx.reference as string | undefined
      if (ref?.startsWith(REFERRAL_PAYOUT_PREFIX)) continue
      sumPolicy += convertWithRateMap(Number(tx.send_amount), tx.send_currency as string, policy, rateMap)
    }

    if (sumPolicy < program.threshold_send_amount) return

    const { data: existingThreshold } = await supabase
      .from("referral_rewards")
      .select("id")
      .eq("referee_user_id", transaction.user_id)
      .eq("reward_type", "threshold_unlock")
      .maybeSingle()

    if (existingThreshold) return

    const rewardPolicy = program.reward_amount
    const display = policyToDisplayAmount(rewardPolicy, policy, referrerBase, rateMap)

    const { error: insErr } = await supabase.from("referral_rewards").insert({
      referrer_user_id: referrerId,
      referee_user_id: transaction.user_id,
      source_transaction_id: null,
      reward_type: "threshold_unlock",
      amount_policy_currency: rewardPolicy,
      policy_currency: policy,
      amount_display: display.amount,
      display_currency: display.currency,
    })
    if (insErr && insErr.code !== "23505") {
      console.error("referral_rewards insert (threshold):", insErr)
    }
  } catch (e) {
    console.error("processReferralRewardsOnCompletedSend:", e)
  }
}
