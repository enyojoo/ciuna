"use client"

import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { AuthLoadingSkeleton } from "@/components/auth-loading-skeleton"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

/** Keeps `useTranslation` off public routes (e.g. `/[referralSlug]`) so SSR/build does not warn NO_I18NEXT_INSTANCE. */
function AdminAccessDeniedScreen() {
  const { t } = useTranslation("app")
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("layout.accessDenied")}</h1>
        <p className="text-gray-600 mb-4">{t("layout.adminCannotAccessUser")}</p>
        <a
          href="/admin/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          {t("layout.goToAdminDashboard")}
        </a>
      </div>
    </div>
  )
}

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
    return <AdminAccessDeniedScreen />
  }

  return <UserDashboardLayout>{children}</UserDashboardLayout>
}
