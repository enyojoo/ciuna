"use client"

import { useLayoutEffect } from "react"
import { persistReferralSlugFromSearchParam } from "@/lib/referral-client"

/**
 * No visible UI — server still returns 200 + OG for the referral URL.
 * Use a full navigation (not App Router client replace) so we reliably hit
 * `/auth/register?via=...` for signup + sessionStorage (`ref` is avoided — it can
 * conflict with auth URL handling and bounce to `/auth/login`).
 */
export function ReferralClientRedirect({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    persistReferralSlugFromSearchParam(slug)
    const url = `${window.location.origin}/auth/register?via=${encodeURIComponent(slug)}`
    window.location.replace(url)
  }, [slug])

  return null
}
