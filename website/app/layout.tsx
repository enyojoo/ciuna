import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { PostHogProvider } from "@/components/posthog-provider"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: {
    default: "Ciuna - Send Money Across Borders",
    template: "%s - Ciuna",
  },
  description:
    "Send money internationally without fees using bank-to-bank transfers. Ciuna helps you move funds across borders simply and securely.",
  keywords:
    "international money transfer, remittance, cross-border payments, send money abroad, bank transfer, global payments",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://www.ciuna.com"),
  alternates: { canonical: "/" },
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20favicon.png",
    shortcut: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20favicon.png",
    apple: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20favicon.png",
  },
  openGraph: {
    title: "Ciuna - Send Money Across Borders",
    description: "International remittances and cross-border bank transfers without fees.",
    url: "https://www.ciuna.com",
    siteName: "Ciuna",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20seo.png",
        width: 1200,
        height: 630,
        alt: "Ciuna - Global Money Transfer Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciuna - Send Money Across Borders",
    description: "International remittances and cross-border bank transfers without fees.",
    creator: "@ciunabanking",
    images: ["https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20seo.png"],
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
      <body className={`${plusJakartaSans.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans`} suppressHydrationWarning>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
