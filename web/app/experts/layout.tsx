import type { Metadata } from "next"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

/** Discovery + booking depend on live slots and session; do not statically cache route output. */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.hub,
  description: SEO_PAGE_DESCRIPTIONS.hub,
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

/**
 * No layout-level Suspense — `/experts/*` pages that use `useSearchParams` already wrap
 * their own trees in Suspense. A layout fallback here duplicated that and caused a blink
 * when navigating from `/hub`.
 */
export default function ExpertsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
