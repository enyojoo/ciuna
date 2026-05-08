import type { Metadata } from "next"
import { Suspense } from "react"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

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

export default function ExpertsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>{children}</Suspense>
}
