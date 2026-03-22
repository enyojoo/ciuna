import type { Metadata } from "next"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.dashboard,
  description: SEO_PAGE_DESCRIPTIONS.dashboard,
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
  },
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
