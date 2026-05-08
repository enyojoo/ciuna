import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { withErrorHandling, createErrorResponse } from "@/lib/auth-utils"

const ALLOWED_LINES = new Set(["food", "mart"])

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ vendorSlug: string }> }) => {
  const { vendorSlug } = await params
  const slug = String(vendorSlug || "").trim().toLowerCase()
  if (!slug) {
    return createErrorResponse("Missing vendor slug", 400)
  }

  const { searchParams } = new URL(request.url)
  const serviceLine = String(searchParams.get("service_line") || "").trim().toLowerCase()
  if (!ALLOWED_LINES.has(serviceLine)) {
    return createErrorResponse("Invalid or missing service_line (use food or mart)", 400)
  }

  const server = createServerClient()
  const { data: vendor, error } = await server
    .from("hub_vendors")
    .select("id, service_line_slug, name, slug, photo_url, short_bio, location, is_published, is_verified, created_at, updated_at")
    .eq("service_line_slug", serviceLine)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    console.error("hub vendor by slug", error)
    return createErrorResponse("Failed to load vendor", 500)
  }
  if (!vendor?.id) {
    return createErrorResponse("Vendor not found", 404)
  }

  const res = NextResponse.json({ vendor })
  res.headers.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300")
  return res
})
