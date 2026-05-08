import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"
import { assertHubProductCategoryAllowed } from "@/lib/hub-product-category-validation"
import { hubCategorySlug } from "@/lib/hub-slug"
import { sortHubProductRows } from "@/lib/hub-products-sort"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const server = createServerClient()
    // Order only by columns that always exist; `is_featured` may be missing until migration runs.
    const { data, error } = await server.from("hub_products").select("*").order("updated_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ products: sortHubProductRows(data || []) })
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

    const vendorId =
      body.vendor_id != null && String(body.vendor_id).trim() !== "" ? String(body.vendor_id).trim() : null

    const row = {
      title: String(body.title || "").trim() || "Untitled",
      short_description: body.short_description ?? null,
      category: String(body.category || "Other"),
      vendor_id: vendorId,
      is_featured: Boolean(body.is_featured),
      status: body.status === "live" || body.status === "archived" ? body.status : "draft",
      pricing_type: body.pricing_type === "user_input" ? "user_input" : "fixed",
      fulfillment_type: body.fulfillment_type === "in_person" ? "in_person" : "online",
      fixed_amount: body.fixed_amount != null ? Number(body.fixed_amount) : null,
      fixed_currency: body.fixed_currency ?? null,
      default_input_currency: body.default_input_currency ?? "USD",
      fee_percent: body.fee_percent != null ? Number(body.fee_percent) : null,
      funded_min: body.funded_min != null ? Number(body.funded_min) : null,
      funded_max: body.funded_max != null ? Number(body.funded_max) : null,
      sla_text: body.sla_text ?? null,
      image_url: body.image_url != null ? String(body.image_url) : null,
      updated_at: new Date().toISOString(),
    }

    const catCheck = await assertHubProductCategoryAllowed(server, row.category)
    if (!catCheck.ok) {
      return NextResponse.json({ error: catCheck.message }, { status: 400 })
    }

    if (vendorId) {
      const { data: v, error: vErr } = await server.from("hub_vendors").select("id, service_line_slug").eq("id", vendorId).maybeSingle()
      if (vErr || !v) {
        return NextResponse.json({ error: "Invalid vendor_id" }, { status: 400 })
      }
      if (v.service_line_slug !== hubCategorySlug(row.category)) {
        return NextResponse.json(
          { error: "Vendor service line must match the product category hub line (e.g. Food → food vendor)." },
          { status: 400 },
        )
      }
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
