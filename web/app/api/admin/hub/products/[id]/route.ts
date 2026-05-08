import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"
import { assertHubProductCategoryAllowed } from "@/lib/hub-product-category-validation"
import { hubCategorySlug } from "@/lib/hub-slug"

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message
  if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
    return (e as { message: string }).message
  }
  return fallback
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const server = createServerClient()
    const { data, error } = await server.from("hub_products").select("*").eq("id", id).single()
    if (error) throw error
    return NextResponse.json({ product: data })
  } catch (e) {
    console.error("admin hub product GET", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Not found" }, { status })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const server = createServerClient()

    const vendorId =
      body.vendor_id !== undefined
        ? body.vendor_id != null && String(body.vendor_id).trim() !== ""
          ? String(body.vendor_id).trim()
          : null
        : undefined

    const row: Record<string, unknown> = {
      title: String(body.title || "").trim() || "Untitled",
      short_description: body.short_description ?? null,
      category: String(body.category || "Other"),
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
    if (vendorId !== undefined) {
      row.vendor_id = vendorId
    }

    const catCheck = await assertHubProductCategoryAllowed(server, row.category as string)
    if (!catCheck.ok) {
      return NextResponse.json({ error: catCheck.message }, { status: 400 })
    }

    if (vendorId) {
      const { data: v, error: vErr } = await server.from("hub_vendors").select("id, service_line_slug").eq("id", vendorId).maybeSingle()
      if (vErr || !v) {
        return NextResponse.json({ error: "Invalid vendor_id" }, { status: 400 })
      }
      if (v.service_line_slug !== hubCategorySlug(row.category as string)) {
        return NextResponse.json(
          { error: "Vendor service line must match the product category hub line (e.g. Food → food vendor)." },
          { status: 400 },
        )
      }
    }

    // Office "new product" should POST, but tolerate accidental PATCH /products/new.
    if (id === "new") {
      const { data, error } = await server.from("hub_products").insert(row).select().single()
      if (error) throw error
      return NextResponse.json({ product: data }, { status: 201 })
    }

    const { data, error } = await server.from("hub_products").update(row).eq("id", id).select().maybeSingle()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ product: data })
  } catch (e) {
    console.error("admin hub product PATCH", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    const message = getErrorMessage(e, "Failed to update")
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const server = createServerClient()
    const { error } = await server.from("hub_products").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("admin hub product DELETE", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to delete" }, { status })
  }
}
