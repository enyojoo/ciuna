import type { Metadata } from "next"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.hub,
  description: SEO_PAGE_DESCRIPTIONS.hub,
  robots: {
    index: false,
    follow: false,
  },
}

/** Same pattern as `/send` and `/transactions`: no `Suspense` wrapper — avoids an empty fallback flash on every `/hub/*` navigation (e.g. order detail). */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
