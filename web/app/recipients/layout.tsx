import type { Metadata } from "next"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.recipients,
  description: SEO_PAGE_DESCRIPTIONS.recipients,
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function RecipientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
