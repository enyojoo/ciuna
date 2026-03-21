import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings - Ciuna",
  description: "Configure platform settings, payment methods, and system parameters for the Ciuna platform.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
