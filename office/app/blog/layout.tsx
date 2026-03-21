import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Ciuna Office",
  description: "Manage blog posts for the Ciuna website.",
  robots: { index: false, noindex: true },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
