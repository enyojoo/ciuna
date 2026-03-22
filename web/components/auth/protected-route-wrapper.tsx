"use client"

import { usePathname } from "next/navigation"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { Loader2 } from "lucide-react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { useAuth } from "@/lib/auth-context"

const PROTECTED_PATHS = ["/dashboard", "/send", "/transactions", "/recipients", "/more", "/support"]

function isProtectedPath(pathname: string | null): boolean {
  if (!pathname) return false
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isChecking, isAdmin } = useRouteProtection({ requireAuth: true })

  if (!isProtectedPath(pathname)) {
    return <>{children}</>
  }

  if (isChecking) {
    // Spinner during session / route resolution; dashboard page shows DashboardSkeleton while data loads.
    if (user) {
      return (
        <UserDashboardLayout>
          <div className="flex min-h-[50vh] w-full items-center justify-center px-5">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            <span className="sr-only">Loading</span>
          </div>
        </UserDashboardLayout>
      )
    }
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    )
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
