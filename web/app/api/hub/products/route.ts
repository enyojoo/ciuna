import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth, withErrorHandling, createErrorResponse } from "@/lib/auth-utils"
import { sortHubProductRows } from "@/lib/hub-products-sort"

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    await requireAuth(request)
  } catch {
    return createErrorResponse("Unauthorized", 401)
  }

  const server = createServerClient()
  const { data, error } = await server
    .from("hub_products")
    .select("*")
    .eq("status", "live")
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("hub products list", error)
    return createErrorResponse("Failed to load products", 500)
  }

  return NextResponse.json({ products: sortHubProductRows(data || []) })
})
