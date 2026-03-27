"use client"

import { useLayoutEffect } from "react"
import { persistReferralSlugFromSearchParam } from "@/lib/referral-client"

/**
 * No visible UI — server still returns 200 + OG for the referral URL.
 * Use a full navigation (not App Router client replace) so we reliably hit
 * `/auth/register?ref=...` for signup + sessionStorage; avoids edge cases that
 * sent users to `/auth/login` or dropped the ref.
 */
export function ReferralClientRedirect({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    persistReferralSlugFromSearchParam(slug)
    const url = `${window.location.origin}/auth/register?ref=${encodeURIComponent(slug)}`
    window.location.replace(url)
  }, [slug])

  return null
}
