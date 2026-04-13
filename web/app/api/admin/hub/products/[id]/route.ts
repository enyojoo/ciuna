import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

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

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    const keys = [
      "title",
      "short_description",
      "long_description",
      "category",
      "status",
      "pricing_type",
      "fixed_amount",
      "fixed_currency",
      "default_input_currency",
      "fee_percent",
      "funded_min",
      "funded_max",
      "billing_context",
      "sla_text",
      "internal_notes",
      "image_url",
      "sort_order",
    ] as const
    for (const k of keys) {
      if (k in body) updates[k] = body[k]
    }
    if ("form_schema" in body) {
      updates.form_schema = Array.isArray(body.form_schema) ? body.form_schema : []
    }

    const { data, error } = await server.from("hub_products").update(updates).eq("id", id).select().single()
    if (error) throw error
    return NextResponse.json({ product: data })
  } catch (e) {
    console.error("admin hub product PATCH", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to update" }, { status })
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
