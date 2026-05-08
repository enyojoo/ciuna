import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Hub - Ciuna Office",
  description: "Manage Ciuna Hub marketplace products.",
  robots: { index: false, noindex: true, follow: false, nofollow: true },
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>{children}</Suspense>
}
