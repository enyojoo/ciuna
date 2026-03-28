import { supabase } from "./supabase"

/** After signInWithPassword, getSession() can lag briefly — wait before attaching Authorization. */
const SESSION_WAIT_MS = 4000

export type FetchWithAuthOptions = {
  /** Use this token instead of getSession() (e.g. access_token from signInWithPassword / signUp response). */
  accessToken?: string | null
}

/**
 * Same-origin API calls with `requireUser` / `getAccessTokenFromRequest` need the bearer token
 * when the session lives in localStorage (default Supabase browser client) and is not mirrored to cookies.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
  authOptions?: FetchWithAuthOptions
): Promise<Response> {
  const headers = new Headers(init?.headers)
  let explicitToken = authOptions?.accessToken ?? null

  const attachSessionToken = async () => {
    if (explicitToken) {
      headers.set("Authorization", `Bearer ${explicitToken}`)
      return
    }
    let {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.access_token) {
      const deadline = Date.now() + SESSION_WAIT_MS
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50))
        ;({
          data: { session },
        } = await supabase.auth.getSession())
        if (session?.access_token) break
      }
    }
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
    explicitToken = null
    await supabase.auth.refreshSession()
    headers.delete("Authorization")
    await attachSessionToken()
    res = await doFetch()
  }
  return res
}
