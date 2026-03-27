import { supabase } from "./supabase"

/**
 * Same-origin API calls with `requireUser` / `getAccessTokenFromRequest` need the bearer token
 * when the session lives in localStorage (default Supabase browser client) and is not mirrored to cookies.
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)

  const attachSessionToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`)
      return
    }
    const { data } = await supabase.auth.refreshSession()
    if (data.session?.access_token) {
      headers.set("Authorization", `Bearer ${data.session.access_token}`)
    }
  }

  await attachSessionToken()

  const doFetch = () =>
    fetch(input, {
      ...init,
      headers,
      credentials: init?.credentials ?? "include",
    })

  let res = await doFetch()
  if (res.status === 401) {
    await supabase.auth.refreshSession()
    headers.delete("Authorization")
    await attachSessionToken()
    res = await doFetch()
  }
  return res
}
