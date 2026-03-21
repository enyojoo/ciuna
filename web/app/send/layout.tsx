import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Send Money - Ciuna",
  description: "Send money internationally with zero fees using Ciuna. Transfer money to family and friends worldwide instantly.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function SendMoneyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
