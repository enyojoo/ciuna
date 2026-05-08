import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { withErrorHandling, createErrorResponse } from "@/lib/auth-utils"

const PROFILE_FIELDS =
  "id, display_name, headline, bio, is_published, category, image_url, capabilities, fulfillment_type, service_area, meeting_hint, created_at"

const SERVICE_FIELDS =
  "id, title, short_description, sort_order, is_published, pricing_type, hourly_rate, hourly_currency, fixed_amount, fixed_currency, package_label, default_duration_minutes, min_session_minutes, max_session_minutes"

export const GET = withErrorHandling(async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  if (!id) return createErrorResponse("Missing id", 400)

  const server = createServerClient()
  const { data: profile, error } = await server
    .from("expert_profiles")
    .select(PROFILE_FIELDS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    console.error("expert profile GET", error)
    return createErrorResponse("Failed to load expert", 500)
  }
  if (!profile) return createErrorResponse("Not found", 404)

  const { data: services, error: sErr } = await server
    .from("expert_services")
    .select(SERVICE_FIELDS)
    .eq("expert_profile_id", id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (sErr) {
    console.error("expert profile services", sErr)
    return createErrorResponse("Failed to load expert", 500)
  }

  const res = NextResponse.json({ profile, services: services || [] })
  res.headers.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300")
  return res
})
