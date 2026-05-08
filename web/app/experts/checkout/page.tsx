"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { stashRedirectAfterLogin } from "@/lib/auth-login-redirect"
import { expertsBookServicePath, EXPERTS_CATALOG_PATH } from "@/lib/experts-public-paths"

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

  return (
    <div className="min-w-0 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-40 rounded-2xl bg-muted" />
      </div>
    </div>
  )
}

export default function ExpertsCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-w-0 px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-5xl animate-pulse space-y-4">
            <div className="h-40 rounded-2xl bg-muted" />
          </div>
        </div>
      }
    >
      <ExpertsCheckoutRedirect />
    </Suspense>
  )
}
