"use client"

import { Suspense, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { stashRedirectAfterLogin } from "@/lib/auth-login-redirect"
import { expertsBookServicePath, EXPERTS_CATALOG_PATH } from "@/lib/experts-public-paths"

function RedirectInner() {
  const router = useRouter()
  const params = useParams()
  const slotId = String(params?.slotId ?? "").trim()
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
    <div className="min-w-0 px-4 py-6">
      <div className="mx-auto max-w-lg animate-pulse space-y-4">
        <div className="h-12 rounded-lg bg-muted" />
        <div className="h-48 rounded-2xl bg-muted" />
      </div>
    </div>
  )
}

export default function LegacyExpertSlotCheckoutRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-w-0 px-4 py-6">
          <div className="mx-auto max-w-lg animate-pulse space-y-4">
            <div className="h-12 rounded-lg bg-muted" />
            <div className="h-48 rounded-2xl bg-muted" />
          </div>
        </div>
      }
    >
      <RedirectInner />
    </Suspense>
  )
}
