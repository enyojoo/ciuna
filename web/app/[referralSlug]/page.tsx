import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"
import { RESERVED_REFERRAL_SLUGS } from "@/lib/referral-slug"

const REF_COOKIE = "ciuna_ref_slug"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90

type Props = { params: Promise<{ referralSlug: string }> }

export default async function ReferralLandingPage({ params }: Props) {
  const { referralSlug } = await params
  const slug = referralSlug.trim()

  if (!slug || slug.length < 8 || RESERVED_REFERRAL_SLUGS.has(slug)) {
    notFound()
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("id").eq("referral_slug", slug).maybeSingle()

  if (error || !data) {
    notFound()
  }

  const jar = await cookies()
  jar.set(REF_COOKIE, slug, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  })

  redirect(`/auth/register?ref=${encodeURIComponent(slug)}`)
}
