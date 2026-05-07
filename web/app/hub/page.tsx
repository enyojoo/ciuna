"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { HubShellHeader } from "@/components/hub/hub-shell-header"
import { HubServiceLineTiles } from "@/components/hub/hub-service-line-tiles"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"

export default function HubHomePage() {
  const { t } = useTranslation("app")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        if (!cancelled) setLines((data.serviceLines || []) as HubServiceLineRow[])
      } catch {
        if (!cancelled) setLines([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, router])

  if (!user) {
    return (
      <div className="min-w-0 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
          <div className="h-12 rounded-lg bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-5 space-y-6">
        <HubShellHeader />

        <section
          className="rounded-2xl px-5 py-7 sm:px-7 sm:py-8 text-white shadow-sm"
          style={{
            background: "linear-gradient(135deg, var(--surface-hero-from, #ea580c) 0%, var(--surface-hero-via, #f97316) 45%, var(--surface-hero-to, #fb923c) 100%)",
          }}
        >
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{t("hub.heroTitle")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">{t("hub.heroBody")}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">{t("hub.servicesTitle")}</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-muted" />
              ))}
            </div>
          ) : lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("hub.serviceUnavailable")}</p>
          ) : (
            <HubServiceLineTiles lines={lines} />
          )}
        </section>
      </div>
    </div>
  )
}
