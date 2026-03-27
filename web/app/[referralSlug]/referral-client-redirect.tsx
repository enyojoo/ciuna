"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** No visible UI — keeps a 200 HTML response so OG/meta apply to the referral URL; redirect after mount. */
export function ReferralClientRedirect({ slug }: { slug: string }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/auth/register?ref=${encodeURIComponent(slug)}`)
  }, [router, slug])

  return null
}
