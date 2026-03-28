import { fetchWithAuth } from "./fetch-with-auth"
import { supabase } from "./supabase"

const STORAGE_KEY = "ciuna_ref_slug"

/**
 * Referral slug from register URL query. Canonical param is `ref`; `via` still accepted for older links.
 */
export function getReferralSlugFromSearchParams(searchParams: { get: (key: string) => string | null }) {
  return searchParams.get("ref")?.trim() || searchParams.get("via")?.trim() || null
}

export function persistReferralSlugFromSearchParam(ref: string | null | undefined) {
  if (typeof window === "undefined") return
  const s = ref?.trim()
  if (s) sessionStorage.setItem(STORAGE_KEY, s)
}

export function getStoredReferralSlug(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(STORAGE_KEY)
}

/**
 * @param preferredSlug Slug from the current URL (`?ref=`) — use when sessionStorage is empty or unreliable.
 * @returns true when no further retries are useful (success, terminal ineligible, or no session to call API).
 */
export async function claimReferralIfNeeded(
  preferredSlug?: string | null,
  opts?: { accessToken?: string | null }
): Promise<boolean> {
  const slug = (preferredSlug?.trim() || getStoredReferralSlug())?.trim()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const accessToken = opts?.accessToken ?? session?.access_token ?? null
  if (!accessToken) {
    return true
  }

  try {
    const res = await fetchWithAuth(
      "/api/referrals/claim",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slug ? { referralSlug: slug } : {}),
      },
      { accessToken }
    )
    if (!res.ok) return false

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean
      attributed?: boolean
      alreadySet?: boolean
      ineligible?: boolean
    }

    if (data.attributed || data.alreadySet || data.ineligible) {
      sessionStorage.removeItem(STORAGE_KEY)
      return true
    }

    if (data.success && data.attributed === false && !data.ineligible) {
      sessionStorage.removeItem(STORAGE_KEY)
      return true
    }

    return false
  } catch (e) {
    console.warn("claimReferralIfNeeded:", e)
    return false
  }
}

/**
 * After login or OAuth: `public.users` row may lag auth — retry claim briefly.
 */
export async function claimReferralWithRetry(opts?: {
  maxAttempts?: number
  slug?: string | null
  accessToken?: string | null
}): Promise<void> {
  const maxAttempts = opts?.maxAttempts ?? 12
  const pinned = opts?.slug?.trim() || null
  const accessToken = opts?.accessToken ?? null

  if (!pinned && !getStoredReferralSlug()) {
    await claimReferralIfNeeded(undefined, { accessToken })
    return
  }
  try {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const done = await claimReferralIfNeeded(pinned || undefined, { accessToken })
      if (done) return
      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)))
    }
  } catch (e) {
    console.warn("claimReferralWithRetry:", e)
  }
}

export async function claimReferralWithRetryForOAuthCallback(): Promise<void> {
  return claimReferralWithRetry()
}
