import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth, withErrorHandling, createErrorResponse } from "@/lib/auth-utils"
import { sortHubProductRows } from "@/lib/hub-products-sort"
import { enrichHubProductsWithVendors } from "@/lib/hub-product-vendors"
import type { HubProductRow } from "@/lib/hub-types"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const server = createServerClient()
  const { searchParams } = new URL(request.url)
  const serviceLine = String(searchParams.get("service_line") || "").trim().toLowerCase()
  const publicMarketplaceSlice = serviceLine === "food" || serviceLine === "mart"

  if (!publicMarketplaceSlice) {
    try {
      await requireAuth(request)
    } catch {
      return createErrorResponse("Unauthorized", 401)
    }
  }

  let q = server.from("hub_products").select("*").eq("status", "live").order("updated_at", { ascending: false })
  if (serviceLine === "food" || serviceLine === "mart") {
    q = q.eq("service_line_slug", serviceLine)
  }

  const { data, error } = await q

  if (error) {
    console.error("hub products list", error)
    return createErrorResponse("Failed to load products", 500)
  }

  const enriched = await enrichHubProductsWithVendors(server, (data || []) as HubProductRow[])

  const res = NextResponse.json({ products: sortHubProductRows(enriched) })
  if (publicMarketplaceSlice) {
    res.headers.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300")
  }
  return res
})
