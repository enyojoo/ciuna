import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - Ciuna",
  description: "Reset your Ciuna account password to regain access to your money transfer account.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
