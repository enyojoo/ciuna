"use client"

import { useLayoutEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface UseRouteProtectionOptions {
  requireAuth?: boolean
  adminOnly?: boolean
  redirectTo?: string
}

export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const { user, userProfile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const {
    requireAuth = true,
    adminOnly = false,
    redirectTo = "/auth/login",
  } = options

  // useLayoutEffect: resolve auth gate before paint so we don't flash duplicate loading UIs.
  useLayoutEffect(() => {
    if (!requireAuth) {
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // Session + profile still resolving (auth-context keeps loading true until profile fetch completes).
    if (loading) {
      setIsChecking(true)
      return
    }

    // For user pages, check if user is admin and block access
    if (requireAuth && !adminOnly && user) {
      if (isAdmin) {
        router.push("/admin/dashboard")
        setIsAuthorized(false)
        setIsChecking(false)
        return
      }
      setIsAuthorized(true)
      setIsChecking(false)
      return
    }

    // For admin pages, we need to wait for profile to determine admin status
    if (adminOnly && user) {
      if (isAdmin) {
        setIsAuthorized(true)
        setIsChecking(false)
      } else {
        router.push(redirectTo)
        setIsAuthorized(false)
        setIsChecking(false)
      }
      return
    }

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      router.push(redirectTo)
      setIsAuthorized(false)
      setIsChecking(false)
      return
    }

    // If user is logged in but trying to access login page
    if (!requireAuth && user) {
      if (isAdmin) {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
      setIsAuthorized(false)
      setIsChecking(false)
      return
    }

    setIsAuthorized(true)
    setIsChecking(false)
  }, [user, loading, isAdmin, router, requireAuth, adminOnly, redirectTo])

  return {
    isChecking,
    isAuthorized,
    user,
    userProfile,
    isAdmin,
  }
}
