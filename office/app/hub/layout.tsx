import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hub - Ciuna Office",
  description: "Manage Ciuna Hub marketplace products.",
  robots: { index: false, noindex: true, follow: false, nofollow: true },
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
