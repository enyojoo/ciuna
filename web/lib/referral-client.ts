import { fetchWithAuth } from "./fetch-with-auth"

const STORAGE_KEY = "ciuna_ref_slug"

/**
 * Referral slug in register URL: prefer `via` (avoids `ref`, which clashes with some
 * auth/URL tooling and could bounce users to `/` → `/auth/login`). `ref` still read for old links.
 */
export function getReferralSlugFromSearchParams(searchParams: { get: (key: string) => string | null }) {
  return searchParams.get("via")?.trim() || searchParams.get("ref")?.trim() || null
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
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch (e) {
    console.warn("claimReferralIfNeeded:", e)
  }
}
