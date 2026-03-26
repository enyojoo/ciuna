import { supabase } from "./supabase"

/**
 * Options for same-origin API routes that use `getAccessTokenFromRequest` / `requireUser`.
 * Sends cookies plus `Authorization: Bearer` from the current session so the server
 * can authenticate even when cookie parsing fails (chunked cookies, edge cases).
 */
export async function authFetchInit(): Promise<RequestInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  return {
    credentials: "include",
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  }
}
