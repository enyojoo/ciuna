"use client"

import { useLayoutEffect } from "react"
import { persistReferralSlugFromSearchParam } from "@/lib/referral-client"

/**
 * No visible UI — server still returns 200 + OG for the referral URL.
 * Full navigation to `/auth/register?ref=...` so signup + sessionStorage stay in sync.
 */
export function ReferralClientRedirect({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    persistReferralSlugFromSearchParam(slug)
    const url = `${window.location.origin}/auth/register?ref=${encodeURIComponent(slug)}`
    window.location.replace(url)
  }, [slug])

  return null
}
