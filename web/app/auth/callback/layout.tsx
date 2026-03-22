import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

import { SEO_PAGE_DESCRIPTIONS, SEO_PAGE_TITLES } from "@/lib/seo"

export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.authCallback,
  description: SEO_PAGE_DESCRIPTIONS.authCallback,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
