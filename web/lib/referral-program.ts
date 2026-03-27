import { createServerClient } from "@/lib/supabase"

export type ReferralProgramMode = "threshold" | "percent"

export interface ReferralProgramSettings {
  program_active: boolean
  mode: ReferralProgramMode
  policy_currency: string
  reward_amount: number
  threshold_send_amount: number
  /** Decimal fraction, e.g. 0.005 = 0.5% */
  percent_of_send: number
}

const DEFAULT_SETTINGS: ReferralProgramSettings = {
  program_active: true,
  mode: "threshold",
  policy_currency: "USD",
  reward_amount: 5,
  threshold_send_amount: 500,
  percent_of_send: 0.005,
}

function parseSettings(raw: unknown): ReferralProgramSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS
  const o = raw as Record<string, unknown>
  return {
    program_active: Boolean(o.program_active ?? DEFAULT_SETTINGS.program_active),
    mode: o.mode === "percent" ? "percent" : "threshold",
    policy_currency: typeof o.policy_currency === "string" ? o.policy_currency : DEFAULT_SETTINGS.policy_currency,
    reward_amount: Number(o.reward_amount ?? DEFAULT_SETTINGS.reward_amount),
    threshold_send_amount: Number(o.threshold_send_amount ?? DEFAULT_SETTINGS.threshold_send_amount),
    percent_of_send: Number(o.percent_of_send ?? DEFAULT_SETTINGS.percent_of_send),
  }
}

/** Server-side (service role): program rules */
export async function getReferralProgramSettingsServer(): Promise<ReferralProgramSettings> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("system_settings").select("value, data_type").eq("key", "referral_program").maybeSingle()
    if (error || data?.value == null) return DEFAULT_SETTINGS
    let raw: unknown = data.value
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw)
      } catch {
        return DEFAULT_SETTINGS
      }
    }
    return parseSettings(raw)
  } catch {
    return DEFAULT_SETTINGS
  }
}
