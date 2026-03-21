import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support - Ciuna",
  description: "Get help with your money transfers and find answers to common questions about Ciuna's services.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
