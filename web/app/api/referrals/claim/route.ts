import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireUser, withErrorHandling } from "@/lib/auth-utils"

const REF_COOKIE = "ciuna_ref_slug"

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

  const { data: self } = await supabase.from("users").select("id, referred_by_user_id").eq("id", user.id).single()

  if (!self) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (self.referred_by_user_id) {
    const res = NextResponse.json({ success: true, attributed: false, alreadySet: true })
    res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 })
    return res
  }

  const { data: referrer } = await supabase.from("users").select("id").eq("referral_slug", slug).maybeSingle()

  if (!referrer?.id || referrer.id === user.id) {
    const res = NextResponse.json({ success: true, attributed: false })
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
