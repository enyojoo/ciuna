import { supabase } from "./supabase"

export interface SecuritySettings {
  sessionTimeout: number
  passwordMinLength: number
  maxLoginAttempts: number
  accountLockoutDuration: number
}

let cachedSettings: SecuritySettings | null = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const now = Date.now()

  if (cachedSettings && now - lastFetch < CACHE_DURATION) {
    return cachedSettings
  }

  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", [
        "session_timeout",
        "password_min_length",
        "max_login_attempts",
        "account_lockout_duration",
      ])

    if (error) {
      console.error("Error loading security settings:", error)
      return getDefaultSecuritySettings()
    }

    const settings =
      data?.reduce(
        (acc, setting) => {
          acc[setting.key] = Number.parseInt(setting.value, 10) || 0
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    const securitySettings: SecuritySettings = {
      sessionTimeout: settings.session_timeout || 30,
      passwordMinLength: settings.password_min_length || 8,
      maxLoginAttempts: settings.max_login_attempts || 5,
      accountLockoutDuration: settings.account_lockout_duration || 15,
    }

    cachedSettings = securitySettings
    lastFetch = now

    return securitySettings
  } catch (error) {
    console.error("Error loading security settings:", error)
    return getDefaultSecuritySettings()
  }
}

export function getDefaultSecuritySettings(): SecuritySettings {
  return {
    sessionTimeout: 30,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15,
  }
}

export function clearSecuritySettingsCache() {
  cachedSettings = null
  lastFetch = 0
}
