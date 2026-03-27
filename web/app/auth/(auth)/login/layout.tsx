import type { Metadata } from "next"
import type { ReactNode } from "react"
import {
  SEO_OG_IMAGE_ALT,
  SEO_OG_IMAGE_URL,
  SEO_PAGE_DESCRIPTIONS,
  SEO_PAGE_TITLES,
  SEO_SITE_NAME,
  SEO_SITE_URL,
  SEO_TWITTER_CREATOR,
} from "@/lib/seo"

const pageUrl = `${SEO_SITE_URL}/auth/login`

/** Override root `og:url` / canonical so scrapers do not fetch `/` and hit the `/` → login redirect. */
export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.auth,
  description: SEO_PAGE_DESCRIPTIONS.auth,
  alternates: {
    canonical: "/auth/login",
  },
  openGraph: {
    type: "website",
    title: SEO_PAGE_TITLES.auth,
    description: SEO_PAGE_DESCRIPTIONS.auth,
    url: pageUrl,
    siteName: SEO_SITE_NAME,
    locale: "en_US",
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
    title: SEO_PAGE_TITLES.auth,
    description: SEO_PAGE_DESCRIPTIONS.auth,
    creator: SEO_TWITTER_CREATOR,
    images: [SEO_OG_IMAGE_URL],
  },
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
