import { supabase } from "./supabase"

/**
 * Same-origin API calls with `requireUser` / `getAccessTokenFromRequest` need the bearer token
 * when the session lives in localStorage (default Supabase browser client) and is not mirrored to cookies.
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const headers = new Headers(init?.headers)
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`)
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: init?.credentials ?? "include",
  })
}
