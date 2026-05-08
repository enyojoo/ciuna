import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth, withErrorHandling, createErrorResponse } from "@/lib/auth-utils"

const ALLOWED_LINES = new Set(["food", "mart"])

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    await requireAuth(request)
  } catch {
    return createErrorResponse("Unauthorized", 401)
  }

  const { searchParams } = new URL(request.url)
  const serviceLine = String(searchParams.get("service_line") || "").trim().toLowerCase()
  if (!ALLOWED_LINES.has(serviceLine)) {
    return createErrorResponse("Invalid or missing service_line (use food or mart)", 400)
  }

  const server = createServerClient()
  const { data, error } = await server
    .from("hub_vendors")
    .select("id, service_line_slug, name, slug, photo_url, short_bio, is_published, created_at, updated_at")
    .eq("service_line_slug", serviceLine)
    .eq("is_published", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("hub vendors list", error)
    return createErrorResponse("Failed to load vendors", 500)
  }

  const res = NextResponse.json({ vendors: data || [] })
  res.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120")
  return res
})
