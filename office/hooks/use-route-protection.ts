"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface UseRouteProtectionOptions {
  requireAuth?: boolean
  adminOnly?: boolean
  /** When true, only `super_admin` may stay on the route; other admins redirect to `forbiddenRedirectTo`. */
  requireSuperAdmin?: boolean
  redirectTo?: string
  forbiddenRedirectTo?: string
}

export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  const {
    requireAuth = true,
    adminOnly = true,
    requireSuperAdmin = false,
    redirectTo = "/auth/login",
    forbiddenRedirectTo = "/dashboard",
  } = options

  useEffect(() => {
    if (!requireAuth) {
      setIsChecking(false)
      return
    }

    if (loading) return

    if (!user) {
      router.push(redirectTo)
      setIsChecking(false)
      return
    }

    if (adminOnly && !isAdmin) {
      router.push(redirectTo)
      setIsChecking(false)
      return
    }

    if (requireSuperAdmin && !isSuperAdmin) {
      router.push(forbiddenRedirectTo)
      setIsChecking(false)
      return
    }

    setIsChecking(false)
  }, [
    user,
    loading,
    isAdmin,
    isSuperAdmin,
    router,
    requireAuth,
    adminOnly,
    requireSuperAdmin,
    redirectTo,
    forbiddenRedirectTo,
  ])

  return {
    isChecking: loading || isChecking,
    isAdmin,
    isSuperAdmin,
  }
}
