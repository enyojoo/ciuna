"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import { readStaleHubServiceLinesCache, writeHubServiceLinesCache } from "@/lib/hub-client-cache"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { Card, CardContent } from "@/components/ui/card"

type ExpertProfile = {
  id: string
  display_name: string
  headline: string | null
  bio: string | null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HubExpertsDiscoveryPage() {
  const { t } = useTranslation("app")
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const cacheUserId = user?.id ?? userProfile?.id ?? ""
  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [profiles, setProfiles] = useState<ExpertProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  const expertsLine = useMemo(() => lines.find((l) => l.slug === "experts") ?? null, [lines])

  useLayoutEffect(() => {
    if (!cacheUserId) return
    const stale = readStaleHubServiceLinesCache(cacheUserId)
    if (stale !== null) {
      setLines(stale)
      setLinesLoaded(true)
    }
  }, [cacheUserId])

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    const userId = user.id
    let cancelled = false
    const silent = readStaleHubServiceLinesCache(userId) !== null
    ;(async () => {
      try {
        const res = await fetchWithAuth("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("lines")
        const data = await res.json()
        const next = (data.serviceLines || []) as HubServiceLineRow[]
        if (!cancelled) {
          setLines(next)
          writeHubServiceLinesCache(userId, next)
        }
      } catch {
        if (!cancelled && !silent) setLines([])
      } finally {
        if (!cancelled) setLinesLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth("/api/expert/profiles", { cache: "no-store" })
        if (!res.ok) throw new Error("profiles")
        const data = await res.json()
        if (!cancelled) setProfiles((data.profiles || []) as ExpertProfile[])
      } catch {
        if (!cancelled) setProfiles([])
      } finally {
        if (!cancelled) setLoadingProfiles(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const carouselExperts = useMemo(() => shuffle(profiles).slice(0, 10), [profiles])

  const title = t("hub.expertsTitle")
  const subtitle =
    expertsLine?.short_description?.trim() ||
    t("hub.expertsSubtitle")

  if (!user) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (linesLoaded && expertsLine && !expertsLine.is_enabled) {
    return (
      <HubLinePageShell
        title={t("hub.unavailableTitle")}
        subtitle={null}
        backToHubAriaLabel={t("hub.backToHub")}
      >
        <p className="text-center text-sm text-muted-foreground">{t("hub.serviceUnavailable")}</p>
      </HubLinePageShell>
    )
  }

  return (
    <HubLinePageShell title={title} subtitle={subtitle} backToHubAriaLabel={t("hub.backToHub")}>
      <div className="space-y-10 sm:space-y-12">
        <section>
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("hub.expertsFeatured", { defaultValue: "Featured" })}</h3>
          {loadingProfiles && profiles.length === 0 ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-36 w-28 shrink-0 rounded-xl bg-muted sm:h-40 sm:w-32" />
              ))}
            </div>
          ) : carouselExperts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("hub.expertsEmpty", { defaultValue: "No experts listed yet." })}</p>
          ) : (
            <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 sm:gap-4">
              {carouselExperts.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/hub/experts/${ex.id}`}
                  className="w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition hover:border-orange-300/70 sm:w-[8.5rem]"
                >
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-white">
                    {ex.display_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-foreground">{ex.display_name}</p>
                  {ex.headline ? <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{ex.headline}</p> : null}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("hub.expertsAll", { defaultValue: "All experts" })}</h3>
          {loadingProfiles && profiles.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-muted" />
              ))}
            </div>
          ) : profiles.length === 0 ? null : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
              {profiles.map((ex) => (
                <Link key={ex.id} href={`/hub/experts/${ex.id}`} className="block">
                  <Card className="h-full overflow-hidden transition hover:border-orange-300/70 hover:shadow-md">
                    <CardContent className="space-y-2 p-4 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-white">
                        {ex.display_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <p className="line-clamp-2 font-semibold text-foreground">{ex.display_name}</p>
                      {ex.headline ? <p className="line-clamp-2 text-xs text-muted-foreground">{ex.headline}</p> : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </HubLinePageShell>
  )
}
