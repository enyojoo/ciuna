import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/lib/auth-context"
import { PostHogProvider } from "@/components/posthog-provider"
import { ProtectedRouteWrapper } from "@/components/auth/protected-route-wrapper"
import { PwaStandaloneRoot } from "@/components/pwa/pwa-standalone-root"
import { InstallAppBanner } from "@/components/pwa/install-app-banner"
import { PwaInstallProvider } from "@/hooks/use-pwa-install-prompt"
import "./globals.css"
import { PWA_APP_ICON_URL, SITE_FAVICON_URL } from "@/lib/pwa-brand"
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SEO_FAQ_JSON_LD,
  SEO_FINANCIAL_SERVICE_JSON_LD,
  SEO_KEYWORDS,
  SEO_OG_IMAGE_ALT,
  SEO_OG_IMAGE_URL,
  SEO_SITE_NAME,
  SEO_SITE_URL,
  SEO_TWITTER_CREATOR,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: {
    default: SEO_DEFAULT_TITLE,
    template: "%s - Ciuna",
  },
  description: SEO_DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SEO_SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: SITE_FAVICON_URL, sizes: "32x32", type: "image/png" },
      { url: SITE_FAVICON_URL, sizes: "512x512", type: "image/png" },
    ],
    shortcut: SITE_FAVICON_URL,
    apple: [{ url: PWA_APP_ICON_URL, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    url: SEO_SITE_URL,
    siteName: SEO_SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: SEO_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SEO_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    creator: SEO_TWITTER_CREATOR,
    images: [SEO_OG_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  /**
   * `statusBarStyle: "default"` keeps the iOS status bar opaque and matches our
   * sticky headers that use `env(safe-area-inset-top)`. Avoid `black-translucent`
   * unless you retest all top safe-area padding (e.g. AppPageHeader).
   */
  appleWebApp: {
    capable: true,
    title: SEO_SITE_NAME,
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SEO_FAQ_JSON_LD),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SEO_FINANCIAL_SERVICE_JSON_LD),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <PwaInstallProvider>
          <PwaStandaloneRoot />
          <InstallAppBanner />
          <PostHogProvider>
            <AuthProvider>
              <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>
            </AuthProvider>
          </PostHogProvider>
        </PwaInstallProvider>
      </body>
    </html>
  )
}
