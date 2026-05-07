import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireUser, withErrorHandling, createErrorResponse } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest) => {
  let user
  try {
    user = await requireUser(request)
  } catch {
    return createErrorResponse("Unauthorized", 401)
  }

  const server = createServerClient()
  const { data, error } = await server
    .from("expert_bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("expert bookings list", error)
    return createErrorResponse("Failed to load bookings", 500)
  }

  return NextResponse.json({ bookings: data || [] })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  let user
  try {
    user = await requireUser(request)
  } catch {
    return createErrorResponse("Unauthorized", 401)
  }

  const body = await request.json().catch(() => ({}))
  const expertProfileId = String(body.expert_profile_id || "").trim()
  if (!expertProfileId) {
    return createErrorResponse("expert_profile_id required", 400)
  }

  const server = createServerClient()
  const { data: prof, error: pErr } = await server
    .from("expert_profiles")
    .select("id")
    .eq("id", expertProfileId)
    .eq("is_published", true)
    .maybeSingle()
  if (pErr || !prof) {
    return createErrorResponse("Expert not found", 404)
  }

  const row = {
    user_id: user.id,
    expert_profile_id: expertProfileId,
    status: "pending",
    slot_start: body.slot_start ? String(body.slot_start) : null,
    slot_end: body.slot_end ? String(body.slot_end) : null,
    message: body.message != null ? String(body.message) : null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await server.from("expert_bookings").insert(row).select().single()
  if (error) {
    console.error("expert bookings create", error)
    return createErrorResponse("Failed to create booking", 500)
  }

  return NextResponse.json({ booking: data })
})
