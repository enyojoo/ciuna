import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Users - Ciuna",
  description: "Manage user accounts, view user activity, and handle user-related operations on the Ciuna platform.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
