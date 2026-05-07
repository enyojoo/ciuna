import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const server = createServerClient()
    const { data, error } = await server
      .from("hub_service_lines")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true })

    if (error) throw error
    return NextResponse.json({ serviceLines: data || [] })
  } catch (e) {
    console.error("admin hub service-lines GET", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to load service lines" }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const server = createServerClient()

    const gridKind = body.grid_kind === "app_link" || body.grid_kind === "external_url" ? body.grid_kind : "hub_category"

    const row = {
      slug: String(body.slug || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      title: String(body.title || "").trim() || "Untitled",
      short_description: body.short_description != null ? String(body.short_description) : null,
      sort_order: body.sort_order != null ? Number(body.sort_order) : 0,
      is_enabled: Boolean(body.is_enabled),
      icon_url: body.icon_url != null ? String(body.icon_url) : null,
      icon_key: body.icon_key != null ? String(body.icon_key) : null,
      grid_kind: gridKind,
      route_path: body.route_path != null ? String(body.route_path) : null,
      href: body.href != null ? String(body.href) : null,
      updated_at: new Date().toISOString(),
    }

    if (!row.slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 })
    }

    const { data, error } = await server.from("hub_service_lines").insert(row).select().single()
    if (error) throw error
    return NextResponse.json({ serviceLine: data })
  } catch (e) {
    console.error("admin hub service-lines POST", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to create service line" }, { status })
  }
}
