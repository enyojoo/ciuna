import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Open App",
}

export default function AccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
