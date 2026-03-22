import type { Metadata } from "next"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.morePassword,
  description: SEO_PAGE_DESCRIPTIONS.morePassword,
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
  },
}

export default function MorePasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
