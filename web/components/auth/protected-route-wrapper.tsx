"use client"

import { usePathname } from "next/navigation"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { AuthLoadingSkeleton } from "@/components/auth-loading-skeleton"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

const PROTECTED_PATHS = ["/dashboard", "/send", "/transactions", "/recipients", "/more", "/support"]

function isProtectedPath(pathname: string | null): boolean {
  if (!pathname) return false
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

/** Only these routes should trigger "must be logged in → redirect to /auth/login" in the wrapper. */
function requiresProtectedAuth(pathname: string | null): boolean {
  if (!pathname) return false
  // All /auth/* (login, register, callback, …) must stay public — never push logged-out users to login.
  if (pathname.startsWith("/auth/")) return false
  if (pathname.startsWith("/admin")) return true
  return isProtectedPath(pathname)
}

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isChecking, isAdmin } = useRouteProtection({
    requireAuth: requiresProtectedAuth(pathname),
  })

  if (!isProtectedPath(pathname)) {
    return <>{children}</>
  }

  if (isChecking) {
    return <AuthLoadingSkeleton />
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin users cannot access user pages.</p>
          <a
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <UserDashboardLayout>{children}</UserDashboardLayout>
}
