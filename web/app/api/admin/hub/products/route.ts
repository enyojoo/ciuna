import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const server = createServerClient()
    const { data, error } = await server.from("hub_products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ products: data || [] })
  } catch (e) {
    console.error("admin hub products GET", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to load hub products" }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const server = createServerClient()

    const row = {
      title: String(body.title || "").trim() || "Untitled",
      short_description: body.short_description ?? null,
      long_description: body.long_description ?? null,
      category: String(body.category || "Other"),
      status: body.status === "live" || body.status === "archived" ? body.status : "draft",
      pricing_type: body.pricing_type === "user_input" ? "user_input" : "fixed",
      fixed_amount: body.fixed_amount != null ? Number(body.fixed_amount) : null,
      fixed_currency: body.fixed_currency ?? null,
      default_input_currency: body.default_input_currency ?? "USD",
      fee_percent: body.fee_percent != null ? Number(body.fee_percent) : null,
      funded_min: body.funded_min != null ? Number(body.funded_min) : null,
      funded_max: body.funded_max != null ? Number(body.funded_max) : null,
      billing_context: body.billing_context === "recurring" || body.billing_context === "one_time" ? body.billing_context : null,
      sla_text: body.sla_text ?? null,
      internal_notes: body.internal_notes ?? null,
      image_url: body.image_url != null ? String(body.image_url) : null,
      form_schema: Array.isArray(body.form_schema) ? body.form_schema : [],
      sort_order: body.sort_order != null ? Number(body.sort_order) : 0,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await server.from("hub_products").insert(row).select().single()
    if (error) throw error
    return NextResponse.json({ product: data })
  } catch (e) {
    console.error("admin hub products POST", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to create hub product" }, { status })
  }
}
