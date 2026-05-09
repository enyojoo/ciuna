"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { stashRedirectAfterLogin } from "@/lib/auth-login-redirect"
import { expertsBookServicePath, EXPERTS_CATALOG_PATH } from "@/lib/experts-public-paths"

import { ExpertsRouteLoadingSkeleton } from "@/components/hub/experts-route-loading-skeleton"

function ExpertsCheckoutRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = (searchParams.get("slot") || "").trim()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!user) {
      if (!authLoading && typeof window !== "undefined") {
        stashRedirectAfterLogin(`${window.location.pathname}${window.location.search}`)
        router.replace("/auth/login")
      }
      return
    }
    if (!slotId) {
      router.replace(EXPERTS_CATALOG_PATH)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth(`/api/expert/slots/${encodeURIComponent(slotId)}`, { cache: "no-store" })
        if (cancelled) return
        if (!res.ok) {
          router.replace(EXPERTS_CATALOG_PATH)
          return
        }
        const data = (await res.json()) as {
          profile: { id: string; slug?: string | null }
          service: { id: string }
        }
        router.replace(expertsBookServicePath(data.profile, data.service.id, { slot: slotId }))
      } catch {
        if (!cancelled) router.replace(EXPERTS_CATALOG_PATH)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, router, slotId])

  return <ExpertsRouteLoadingSkeleton />
}

export default function ExpertsCheckoutPage() {
  return <ExpertsCheckoutRedirect />
}
