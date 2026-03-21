import type React from "react"
import type { Metadata } from "next"
import { Unbounded } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { PostHogProvider } from "@/components/posthog-provider"
import "./globals.css"

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
})

export const metadata: Metadata = {
  title: {
    default: "Stablecoin Business Banking | Accounts, Cards & Invoicing - Ciuna",
    template: "%s - Ciuna",
  },
  description:
    "Stablecoin banking for global businesses. API-first cross-border payment infrastructure with built-in KYC/AML. For individuals and businesses.",
  keywords:
    "stablecoin banking, cross-border payments, instant money transfer, bank to bank transfer, international money transfer, US fintech, business banking, global payments",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://www.ciuna.com"),
  alternates: { canonical: "/" },
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20Favicon.svg",
    shortcut: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20Favicon.svg",
    apple: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20Favicon.svg",
  },
  openGraph: {
    title: "Stablecoin Business Banking | Accounts, Cards & Invoicing - Ciuna",
    description: "API-first cross-border payment infrastructure for US and EU businesses.",
    url: "https://www.ciuna.com",
    siteName: "Ciuna",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/ciuna%20seo%20cover.png",
        width: 1200,
        height: 630,
        alt: "Ciuna - Global Money Transfer Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stablecoin Business Banking | Accounts, Cards & Invoicing - Ciuna",
    description: "API-first cross-border payment infrastructure for US and EU businesses.",
    creator: "@ciunabanking",
    images: ["https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/ciuna%20seo%20cover.png"],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${unbounded.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans`} suppressHydrationWarning>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
