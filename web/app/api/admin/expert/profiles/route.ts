import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

const PROFILE_SELECT =
  "id, display_name, headline, bio, is_published, category, image_url, capabilities, fulfillment_type, service_area, meeting_hint, created_at, updated_at"

function parseFulfillment(v: unknown): "online" | "in_person" | "both" {
  const s = String(v || "online").trim().toLowerCase()
  if (s === "in_person" || s === "both") return s as "in_person" | "both"
  return "online"
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const server = createServerClient()
    const { data, error } = await server
      .from("expert_profiles")
      .select(PROFILE_SELECT)
      .order("updated_at", { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ profiles: data || [] })
  } catch (e) {
    console.error("admin expert profiles GET", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to load expert profiles" }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json().catch(() => ({}))
    const server = createServerClient()
    const row = {
      display_name: String(body.display_name || "").trim() || "Expert",
      headline: body.headline != null ? String(body.headline).trim() || null : null,
      bio: body.bio != null ? String(body.bio).trim() || null : null,
      is_published: Boolean(body.is_published),
      category: String(body.category || "Other").trim() || "Other",
      image_url: body.image_url != null ? String(body.image_url).trim() || null : null,
      capabilities: typeof body.capabilities === "object" && body.capabilities !== null ? body.capabilities : {},
      fulfillment_type: parseFulfillment(body.fulfillment_type),
      service_area: body.service_area != null ? String(body.service_area).trim() || null : null,
      meeting_hint: body.meeting_hint != null ? String(body.meeting_hint).trim() || null : null,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await server.from("expert_profiles").insert(row).select(PROFILE_SELECT).single()
    if (error) throw error
    return NextResponse.json({ profile: data })
  } catch (e) {
    console.error("admin expert profiles POST", e)
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to create expert profile" }, { status })
  }
}
