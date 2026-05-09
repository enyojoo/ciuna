/**
 * Lightweight stash for the most recently authenticated user id so that
 * client pages can hydrate per-user localStorage caches *before* the auth
 * context finishes its async session bootstrap.
 *
 * The auth context starts with `loading: true` until `supabase.auth.getSession()`
 * (and the user-profile DB fetch) complete. During that window any cache lookup
 * keyed on `user.id` is impossible. Persisting the id here lets pages read their
 * cache synchronously in `useLayoutEffect` so the first paint is the cached UI
 * — never a placeholder. After auth resolves callers re-validate the cached
 * payload against the actual user id and discard if it doesn't match.
 */

const KEY = "ciuna_last_user_id"

export function readLastKnownUserId(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw && raw.trim() ? raw.trim() : null
  } catch {
    return null
  }
}

export function writeLastKnownUserId(userId: string | null | undefined): void {
  if (typeof window === "undefined") return
  try {
    if (userId && userId.trim()) localStorage.setItem(KEY, userId.trim())
    else localStorage.removeItem(KEY)
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function clearLastKnownUserId(): void {
  writeLastKnownUserId(null)
}
