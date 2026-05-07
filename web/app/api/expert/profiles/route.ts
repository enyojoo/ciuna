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
    .from("expert_profiles")
    .select("id, display_name, headline, bio, is_published, created_at")
    .eq("is_published", true)
    .order("display_name", { ascending: true })

  if (error) {
    console.error("expert profiles list", error)
    return createErrorResponse("Failed to load experts", 500)
  }

  return NextResponse.json({ profiles: data || [] })
})
