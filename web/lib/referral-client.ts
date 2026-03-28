import { fetchWithAuth } from "./fetch-with-auth"

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

export async function claimReferralIfNeeded(): Promise<void> {
  const slug = getStoredReferralSlug()
  if (!slug) return
  try {
    const res = await fetchWithAuth("/api/referrals/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralSlug: slug }),
    })
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        attributed?: boolean
        alreadySet?: boolean
        ineligible?: boolean
      }
      if (data.attributed || data.alreadySet || data.ineligible) {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
  } catch (e) {
    console.warn("claimReferralIfNeeded:", e)
  }
}

/**
 * OAuth callback: profile row may not exist on first claim attempt — retry briefly.
 * Does not run on login; signup-only rules are enforced server-side.
 */
export async function claimReferralWithRetryForOAuthCallback(): Promise<void> {
  const slug = getStoredReferralSlug()
  if (!slug) return
  try {
    for (let attempt = 0; attempt < 12; attempt++) {
      await claimReferralIfNeeded()
      if (!getStoredReferralSlug()) return
      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)))
    }
  } catch (e) {
    console.warn("claimReferralWithRetryForOAuthCallback:", e)
  }
}
