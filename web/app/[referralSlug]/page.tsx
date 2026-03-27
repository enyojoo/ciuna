import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { RESERVED_REFERRAL_SLUGS } from "@/lib/referral-slug"
import {
  SEO_REFERRAL_SHARE_DESCRIPTION,
  SEO_REFERRAL_SHARE_IMAGE_ALT,
  SEO_REFERRAL_SHARE_IMAGE_URL,
  SEO_REFERRAL_SHARE_TITLE,
  SEO_SITE_NAME,
  SEO_SITE_URL,
} from "@/lib/seo"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ referralSlug: string }> }

async function resolveSlug(params: Props["params"]) {
  const { referralSlug } = await params
  return referralSlug.trim()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await resolveSlug(params)
  if (!slug || slug.length < 8 || RESERVED_REFERRAL_SLUGS.has(slug)) {
    return { title: "Not found" }
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("id").eq("referral_slug", slug).maybeSingle()

  if (error || !data) {
    return { title: "Not found" }
  }

  const pageUrl = `${SEO_SITE_URL}/${slug}`

  return {
    title: SEO_REFERRAL_SHARE_TITLE,
    description: SEO_REFERRAL_SHARE_DESCRIPTION,
    openGraph: {
      type: "website",
      title: SEO_REFERRAL_SHARE_TITLE,
      description: SEO_REFERRAL_SHARE_DESCRIPTION,
      url: pageUrl,
      siteName: SEO_SITE_NAME,
      locale: "en_US",
      images: [
        {
          url: SEO_REFERRAL_SHARE_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: SEO_REFERRAL_SHARE_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_REFERRAL_SHARE_TITLE,
      description: SEO_REFERRAL_SHARE_DESCRIPTION,
      images: [SEO_REFERRAL_SHARE_IMAGE_URL],
    },
  }
}

export default async function ReferralLandingPage({ params }: Props) {
  const slug = await resolveSlug(params)

  if (!slug || slug.length < 8 || RESERVED_REFERRAL_SLUGS.has(slug)) {
    notFound()
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("id").eq("referral_slug", slug).maybeSingle()

  if (error || !data) {
    notFound()
  }

  redirect(`/auth/register?ref=${encodeURIComponent(slug)}`)
}
