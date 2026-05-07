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
    .from("hub_service_lines")
    .select("*")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true })

  if (error) {
    console.error("hub service-lines list", error)
    return createErrorResponse("Failed to load service lines", 500)
  }

  const res = NextResponse.json({ serviceLines: data || [] })
  res.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120")
  return res
})
