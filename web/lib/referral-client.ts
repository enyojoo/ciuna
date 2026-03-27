import { fetchWithAuth } from "./fetch-with-auth"

const STORAGE_KEY = "ciuna_ref_slug"

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
