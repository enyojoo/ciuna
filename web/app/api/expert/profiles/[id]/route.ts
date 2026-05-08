import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAuth, withErrorHandling, createErrorResponse } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await requireAuth(request)
  } catch {
    return createErrorResponse("Unauthorized", 401)
  }

  const { id } = await params
  if (!id) return createErrorResponse("Missing id", 400)

  const server = createServerClient()
  const { data, error } = await server
    .from("expert_profiles")
    .select("id, display_name, headline, bio, is_published, created_at")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle()

  if (error) {
    console.error("expert profile GET", error)
    return createErrorResponse("Failed to load expert", 500)
  }
  if (!data) return createErrorResponse("Not found", 404)

  return NextResponse.json({ profile: data })
})
