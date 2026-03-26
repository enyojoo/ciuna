import { supabase } from "./supabase"

const GET_SESSION_BUDGET_MS = 5000

/**
 * Options for same-origin API routes that use `getAccessTokenFromRequest` / `requireUser`.
 * Sends cookies plus `Authorization: Bearer` from the current session so the server
 * can authenticate even when cookie parsing fails (chunked cookies, edge cases).
 *
 * `getSession()` is bounded so a stuck client cannot block all data loading forever.
 */
export async function authFetchInit(signal?: AbortSignal): Promise<RequestInit> {
  const sessionResult = await Promise.race([
    supabase.auth.getSession(),
    new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>>((resolve) =>
      setTimeout(
        () => resolve({ data: { session: null }, error: null }),
        GET_SESSION_BUDGET_MS,
      ),
    ),
  ])
  const session = sessionResult.data.session
  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  return {
    credentials: "include",
    ...(signal ? { signal } : {}),
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  }
}
