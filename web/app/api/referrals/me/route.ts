import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireUser, withErrorHandling } from "@/lib/auth-utils"
import { ensureUserReferralSlug } from "@/lib/referral-user"
import { computeReferralBalances } from "@/lib/referral-balances"
import { getReferralProgramSettingsServer } from "@/lib/referral-program"
import { buildRateMap, convertWithRateMap } from "@/lib/referral-currency"
import { REFERRAL_PAYOUT_PREFIX } from "@/lib/referral-reward-service"
import { APP_URLS } from "@ciuna/shared"
import {
  SEO_REFERRAL_SHARE_DESCRIPTION,
  SEO_REFERRAL_SHARE_MESSAGE_PREFIX,
  SEO_REFERRAL_SHARE_TITLE,
} from "@/lib/seo"

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const supabase = createServerClient()

  const slug = await ensureUserReferralSlug(supabase, user.id)
  const shareUrl = `${APP_URLS.app}/${slug}`
  const shareMessage = `${SEO_REFERRAL_SHARE_MESSAGE_PREFIX} ${shareUrl}`

  const program = await getReferralProgramSettingsServer()
  const balances = await computeReferralBalances(supabase, user.id)

  const { data: exchangeRates } = await supabase.from("exchange_rates").select("*").eq("status", "active")
  const rateMap = buildRateMap(exchangeRates || [])

  const { data: profile } = await supabase.from("users").select("base_currency").eq("id", user.id).single()
  const base = profile?.base_currency || "USD"
  const policy = balances.policyCurrency

  const availableDisplay = convertWithRateMap(balances.availablePolicy, policy, base, rateMap)
  const lifetimeDisplay = convertWithRateMap(balances.totalEarnedPolicy, policy, base, rateMap)

  let programSummary = ""
  if (!program.program_active) {
    programSummary = "The referral program is paused. Check back later."
  } else if (program.mode === "percent") {
    const pct = program.percent_of_send * 100
    programSummary = `Earn ${pct.toFixed(2)}% on every completed send your referrals make.`
  } else {
    programSummary = `Earn ${formatMoney(program.reward_amount, policy)} when each referral sends a combined ${formatMoney(program.threshold_send_amount, policy)} or more.`
  }

  const { data: referees } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .eq("referred_by_user_id", user.id)

  const { data: rewardRows } = await supabase
    .from("referral_rewards")
    .select("referee_user_id, amount_policy_currency, amount_display, display_currency")
    .eq("referrer_user_id", user.id)

  const earnByReferee = new Map<string, number>()
  for (const r of rewardRows || []) {
    const id = r.referee_user_id as string
    earnByReferee.set(id, (earnByReferee.get(id) || 0) + Number(r.amount_policy_currency || 0))
  }

  const referralsList = []
  for (const ref of referees || []) {
    const { data: txs } = await supabase
      .from("transactions")
      .select("reference")
      .eq("user_id", ref.id)
      .eq("status", "completed")

    const txCount =
      (txs || []).filter((t) => !(t.reference as string | undefined)?.startsWith(REFERRAL_PAYOUT_PREFIX)).length

    const earnedPolicy = earnByReferee.get(ref.id) || 0
    const earnedDisplay = convertWithRateMap(earnedPolicy, policy, base, rateMap)

    referralsList.push({
      id: ref.id,
      name: `${ref.first_name || ""} ${ref.last_name || ""}`.trim() || "User",
      transactionCount: txCount,
      earningsDisplay: formatMoney(earnedDisplay > 0 ? earnedDisplay : earnedPolicy, base),
    })
  }

  const { data: pendingRows } = await supabase
    .from("referral_payout_requests")
    .select("id, amount, currency, status, created_at, payout_transaction_id, linked_transaction_id")
    .eq("user_id", user.id)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })

  return NextResponse.json({
    slug,
    shareUrl,
    shareMessage,
    shareTitle: SEO_REFERRAL_SHARE_TITLE,
    shareDescription: SEO_REFERRAL_SHARE_DESCRIPTION,
    programSummary,
    program,
    balances: {
      availablePolicy: balances.availablePolicy,
      totalEarnedPolicy: balances.totalEarnedPolicy,
      /** Numeric available in user base currency (for client payout validation) */
      availableAmountBase: availableDisplay > 0 ? availableDisplay : balances.availablePolicy,
      availableDisplay: formatMoney(availableDisplay > 0 ? availableDisplay : balances.availablePolicy, base),
      lifetimeDisplay: formatMoney(lifetimeDisplay > 0 ? lifetimeDisplay : balances.totalEarnedPolicy, base),
      displayCurrency: base,
    },
    referrals: referralsList,
    pendingPayouts: pendingRows || [],
  })
})
