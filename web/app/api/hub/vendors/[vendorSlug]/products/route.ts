import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth, withErrorHandling, createErrorResponse } from "@/lib/auth-utils"
import { sortHubProductRows } from "@/lib/hub-products-sort"

const ALLOWED_LINES = new Set(["food", "mart"])

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ vendorSlug: string }> }) => {
  try {
    await requireAuth(request)
  } catch {
    return createErrorResponse("Unauthorized", 401)
  }

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

  const { data: vendor, error: vErr } = await server
    .from("hub_vendors")
    .select("id")
    .eq("service_line_slug", serviceLine)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (vErr) {
    console.error("hub vendor lookup", vErr)
    return createErrorResponse("Failed to resolve vendor", 500)
  }
  if (!vendor?.id) {
    return createErrorResponse("Vendor not found", 404)
  }

  const { data: products, error: pErr } = await server
    .from("hub_products")
    .select("*")
    .eq("status", "live")
    .eq("vendor_id", vendor.id)
    .order("updated_at", { ascending: false })

  if (pErr) {
    console.error("hub vendor products", pErr)
    return createErrorResponse("Failed to load products", 500)
  }

  const res = NextResponse.json({ products: sortHubProductRows(products || []) })
  res.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120")
  return res
})
