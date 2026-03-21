import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Exchange Rates - Ciuna",
  description: "Manage currency exchange rates and update rate configurations for the Ciuna platform.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function AdminRatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
