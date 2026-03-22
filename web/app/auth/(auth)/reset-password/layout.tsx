import type { Metadata } from "next"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.resetPassword,
  description: SEO_PAGE_DESCRIPTIONS.resetPassword,
  robots: {
    index: true,
    follow: true,
  },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
