"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import {
  hubPublicHubJsonCacheUserId,
  isHubServiceLinesCacheFresh,
  readStaleHubServiceLinesCache,
  writeHubServiceLinesCache,
} from "@/lib/hub-client-cache"
import {
  isExpertProfilesListCacheFresh,
  readStaleExpertProfilesListCache,
  writeExpertProfilesListCache,
} from "@/lib/expert-profile-client-cache"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { expertsProfilePath } from "@/lib/experts-public-paths"

type ExpertProfile = {
  id: string
  display_name: string
  headline: string | null
  bio: string | null
  category?: string | null
  image_url?: string | null
  pricing_hint?: string | null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SERVICE_LINES_CACHE_USER = hubPublicHubJsonCacheUserId()

export default function ExpertsDiscoveryPage() {
  const { t } = useTranslation("app")
  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [profiles, setProfiles] = useState<ExpertProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("")

  useLayoutEffect(() => {
    const stale = readStaleExpertProfilesListCache()
    if (stale && stale.length > 0) {
      setProfiles(stale as ExpertProfile[])
    }
    const hasRows = (stale?.length ?? 0) > 0
    const fresh = isExpertProfilesListCacheFresh()
    if (!fresh && !hasRows) setLoadingProfiles(true)
    else setLoadingProfiles(false)
  }, [])

  const expertsLine = useMemo(() => lines.find((l) => l.slug === "experts") ?? null, [lines])

  useLayoutEffect(() => {
    const stale = readStaleHubServiceLinesCache(SERVICE_LINES_CACHE_USER)
    if (stale !== null) {
      setLines(stale)
      setLinesLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isHubServiceLinesCacheFresh(SERVICE_LINES_CACHE_USER)) {
      const s = readStaleHubServiceLinesCache(SERVICE_LINES_CACHE_USER)
      if (s) setLines(s)
      setLinesLoaded(true)
      return
    }

    let cancelled = false
    const silent = readStaleHubServiceLinesCache(SERVICE_LINES_CACHE_USER) !== null
    ;(async () => {
      try {
        const res = await fetch("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("lines")
        const data = await res.json()
        const next = (data.serviceLines || []) as HubServiceLineRow[]
        if (!cancelled) {
          setLines(next)
          writeHubServiceLinesCache(SERVICE_LINES_CACHE_USER, next)
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
  }, [])

  useEffect(() => {
    if (isExpertProfilesListCacheFresh()) return

    let cancelled = false
    const silent = (readStaleExpertProfilesListCache()?.length ?? 0) > 0
    if (!silent) setLoadingProfiles(true)

    ;(async () => {
      try {
        const res = await fetch("/api/expert/profiles", { cache: "no-store" })
        if (!res.ok) throw new Error("profiles")
        const data = await res.json()
        const next = (data.profiles || []) as ExpertProfile[]
        if (!cancelled) {
          setProfiles(next)
          writeExpertProfilesListCache(next)
        }
      } catch {
        if (!cancelled) setProfiles([])
      } finally {
        if (!cancelled) setLoadingProfiles(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const displayedProfiles = useMemo(() => {
    const c = categoryFilter.trim()
    if (!c) return profiles
    return profiles.filter((p) => (p.category || "").trim() === c)
  }, [profiles, categoryFilter])

  const carouselExperts = useMemo(() => shuffle(displayedProfiles).slice(0, 10), [displayedProfiles])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of profiles) {
      const cat = (p.category || "").trim()
      if (cat) set.add(cat)
    }
    return Array.from(set).sort()
  }, [profiles])

  const title = t("hub.expertsTitle")
  const subtitle =
    expertsLine?.short_description?.trim() ||
    t("hub.expertsSubtitle")

  if (linesLoaded && expertsLine && !expertsLine.is_enabled) {
    return (
      <HubLinePageShell
        title={t("hub.unavailableTitle")}
        subtitle={null}
        backToHubAriaLabel={t("hub.backToHub")}
        backHref="/hub"
      >
        <p className="text-center text-sm text-muted-foreground">{t("hub.serviceUnavailable")}</p>
      </HubLinePageShell>
    )
  }

  return (
    <HubLinePageShell title={title} subtitle={subtitle} backToHubAriaLabel={t("hub.backToHub")} backHref="/hub">
      <div className="space-y-10 sm:space-y-12">
        {categoryOptions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <Button
              type="button"
              variant={categoryFilter === "" ? "default" : "outline"}
              size="sm"
              className="h-8 rounded-full text-xs"
              onClick={() => setCategoryFilter("")}
            >
              All
            </Button>
            {categoryOptions.map((c) => (
              <Button
                key={c}
                type="button"
                variant={categoryFilter === c ? "default" : "outline"}
                size="sm"
                className="h-8 rounded-full text-xs"
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        ) : null}

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
                  href={expertsProfilePath(ex.id)}
                  className="w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition hover:border-orange-300/70 sm:w-[8.5rem]"
                >
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-white">
                    {ex.display_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-foreground">{ex.display_name}</p>
                  {ex.pricing_hint ? (
                    <p className="mt-1 line-clamp-1 text-[10px] font-medium text-orange-700 dark:text-orange-300">{ex.pricing_hint}</p>
                  ) : null}
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
          ) : profiles.length === 0 ? null : displayedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("hub.expertsNoneInCategory", { defaultValue: "No experts in this category." })}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
              {displayedProfiles.map((ex) => (
                <Link key={ex.id} href={expertsProfilePath(ex.id)} className="block">
                  <Card className="h-full overflow-hidden transition hover:border-orange-300/70 hover:shadow-md">
                    <CardContent className="space-y-2 p-4 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-white">
                        {ex.display_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <p className="line-clamp-2 font-semibold text-foreground">{ex.display_name}</p>
                      {ex.pricing_hint ? (
                        <p className="line-clamp-1 text-xs font-medium text-orange-700 dark:text-orange-300">{ex.pricing_hint}</p>
                      ) : null}
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
