import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { RESERVED_REFERRAL_SLUGS } from "@/lib/referral-slug"
import { withErrorHandling } from "@/lib/auth-utils"

const REF_COOKIE = "ciuna_ref_slug"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90

/**
 * Anonymous: sets httpOnly referral cookie after validating slug exists.
 * Must run in a Route Handler (not a Server Component) so cookies can be set.
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  let slug: string | undefined
  try {
    const body = (await request.json()) as { slug?: string }
    if (typeof body?.slug === "string") slug = body.slug.trim()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (!slug || slug.length < 8 || RESERVED_REFERRAL_SLUGS.has(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("id").eq("referral_slug", slug).maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(REF_COOKIE, slug, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  })
  return res
})
