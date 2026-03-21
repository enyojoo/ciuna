import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Ciuna",
  description: "Admin dashboard for managing Ciuna platform operations, users, and transactions.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function OfficeDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
