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

const pageUrl = `${SEO_SITE_URL}/auth/register`

/** Override root `og:url` / canonical so link previews stay on the signup URL, not `/` → login. */
export const metadata: Metadata = {
  title: SEO_PAGE_TITLES.register,
  description: SEO_PAGE_DESCRIPTIONS.register,
  alternates: {
    canonical: "/auth/register",
  },
  openGraph: {
    type: "website",
    title: SEO_PAGE_TITLES.register,
    description: SEO_PAGE_DESCRIPTIONS.register,
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
    title: SEO_PAGE_TITLES.register,
    description: SEO_PAGE_DESCRIPTIONS.register,
    creator: SEO_TWITTER_CREATOR,
    images: [SEO_OG_IMAGE_URL],
  },
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children
}
