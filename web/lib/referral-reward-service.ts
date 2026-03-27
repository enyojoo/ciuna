import { createServerClient } from "@/lib/supabase"
import type { Transaction } from "@/types"
import { getReferralProgramSettingsServer } from "@/lib/referral-program"
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
      .select("id, referred_by_user_id")
      .eq("id", transaction.user_id)
      .single()

    if (refereeErr || !referee?.referred_by_user_id) return
    const referrerId = referee.referred_by_user_id as string
    if (referrerId === transaction.user_id) return

    const { data: referrer } = await supabase.from("users").select("id, base_currency").eq("id", referrerId).single()

    if (!referrer) return
    const referrerBase = (referrer.base_currency as string) || "USD"
    const policy = program.policy_currency

    if (program.mode === "percent") {
      const sendInPolicy = convertWithRateMap(
        Number(transaction.send_amount),
        transaction.send_currency,
        policy,
        rateMap,
      )
      if (sendInPolicy <= 0) return
      const rewardPolicy = sendInPolicy * program.percent_of_send
      if (rewardPolicy <= 0) return

      const display = policyToDisplayAmount(rewardPolicy, policy, referrerBase, rateMap)

      const { error: insErr } = await supabase.from("referral_rewards").insert({
        referrer_user_id: referrerId,
        referee_user_id: transaction.user_id,
        source_transaction_id: transaction.transaction_id,
        reward_type: "percent_of_send",
        amount_policy_currency: rewardPolicy,
        policy_currency: policy,
        amount_display: display.amount,
        display_currency: display.currency,
      })
      if (insErr && insErr.code !== "23505") {
        console.error("referral_rewards insert (percent):", insErr)
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
