import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth, withErrorHandling, createErrorResponse } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    await requireAuth(request)
  } catch {
    return createErrorResponse("Unauthorized", 401)
  }

  const server = createServerClient()
  const { data, error } = await server
    .from("hub_products")
    .select(
      "id, title, short_description, long_description, category, status, pricing_type, fixed_amount, fixed_currency, default_input_currency, fee_percent, funded_min, funded_max, billing_context, sla_text, image_url, form_schema, sort_order, created_at, updated_at",
    )
    .eq("status", "live")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("hub products list", error)
    return createErrorResponse("Failed to load products", 500)
  }

  return NextResponse.json({ products: data || [] })
})
