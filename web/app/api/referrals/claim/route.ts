import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@/lib/supabase"
import { requireUser, withErrorHandling } from "@/lib/auth-utils"
import { getAccessTokenFromRequest } from "@/lib/supabase-server-helpers"

const REF_COOKIE = "ciuna_ref_slug"

/** Email/password signup stores `referral_slug` in user_metadata; OAuth does not — allow a short window after account creation. */
const SIGNUP_ATTRIBUTION_WINDOW_MS = 48 * 60 * 60 * 1000

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const supabase = createServerClient()

  let referralSlug: string | undefined
  try {
    const body = await request.json()
    if (typeof body?.referralSlug === "string") referralSlug = body.referralSlug
  } catch {
    /* no body */
  }
  if (!referralSlug?.trim()) {
    referralSlug = request.cookies.get(REF_COOKIE)?.value
  }

  const slug = referralSlug?.trim()
  if (!slug) {
    return NextResponse.json({ success: true, attributed: false })
  }

  const slugNorm = slug.toLowerCase()

  const token = getAccessTokenFromRequest(request)
  let metaSlug: string | undefined
  let authCreatedMs = 0
  if (token) {
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: authData } = await anon.auth.getUser(token)
    const raw = (authData.user?.user_metadata as { referral_slug?: string } | undefined)?.referral_slug
    metaSlug = raw?.trim().toLowerCase()
    const ac = authData.user?.created_at
    if (ac) authCreatedMs = new Date(ac).getTime()
  }
  const metaMatches = !!metaSlug && metaSlug === slugNorm

  const { data: self } = await supabase
    .from("users")
    .select("id, referred_by_user_id, created_at")
    .eq("id", user.id)
    .single()

  if (!self) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (self.referred_by_user_id) {
    const res = NextResponse.json({ success: true, attributed: false, alreadySet: true })
    res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 })
    return res
  }

  const profileCreatedMs = self.created_at ? new Date(self.created_at as string).getTime() : 0
  /** Prefer public.users timestamp; fall back to auth user created_at (e.g. row not yet stamped). */
  const anchorMs = profileCreatedMs > 0 ? profileCreatedMs : authCreatedMs
  const ageMs = Date.now() - anchorMs
  const withinSignupWindow = anchorMs > 0 && ageMs >= 0 && ageMs < SIGNUP_ATTRIBUTION_WINDOW_MS

  if (metaSlug && metaSlug !== slugNorm) {
    const res = NextResponse.json({
      success: true,
      attributed: false,
      ineligible: true,
      reason: "referral_mismatch",
    })
    res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 })
    return res
  }

  const eligible = metaMatches || (!metaSlug && withinSignupWindow)
  if (!eligible) {
    const res = NextResponse.json({
      success: true,
      attributed: false,
      ineligible: true,
      reason: "signup_only",
    })
    res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 })
    return res
  }

  let referrer = (await supabase.from("users").select("id").eq("referral_slug", slug).maybeSingle()).data
  if (!referrer?.id && slugNorm !== slug) {
    referrer = (await supabase.from("users").select("id").eq("referral_slug", slugNorm).maybeSingle()).data
  }

  if (!referrer?.id || referrer.id === user.id) {
    const res = NextResponse.json({
      success: true,
      attributed: false,
      ineligible: true,
      reason: referrer?.id === user.id ? "self_referral" : "unknown_referrer",
    })
    res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 })
    return res
  }

  const { error } = await supabase
    .from("users")
    .update({ referred_by_user_id: referrer.id })
    .eq("id", user.id)
    .is("referred_by_user_id", null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const res = NextResponse.json({ success: true, attributed: true })
  res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 })
  return res
})
