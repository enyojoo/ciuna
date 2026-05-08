/** Session key used with password login (`login/page`) and OAuth callback. */
export const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin"

export function stashRedirectAfterLogin(path: string): void {
  if (typeof window === "undefined") return
  const p = String(path || "").trim()
  if (!p.startsWith("/")) return
  if (p.startsWith("/auth/")) return
  try {
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, p)
  } catch {
    /* quota / private mode */
  }
}
