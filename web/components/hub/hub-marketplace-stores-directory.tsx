"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import type { HubVendorRow } from "@/lib/hub-vendor-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import { hubCachedVendorsMatchServiceLine } from "@/lib/hub-slug"
import {
  clearHubVendorListCache,
  hubPublicHubJsonCacheUserId,
  isHubServiceLinesCacheFresh,
  isHubVendorListCacheFresh,
  readStaleHubServiceLinesCache,
  readStaleHubVendorListCache,
  scheduleHubServiceLinesStaleWhileRevalidate,
  writeHubServiceLinesCache,
  writeHubVendorListCache,
} from "@/lib/hub-client-cache"
import { HubVendorCardNameRow } from "@/components/hub/hub-vendor-card-name-row"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { hubLineHomePath, hubMarketplaceVendorPath } from "@/lib/hub-public-paths"

const MARKETPLACE = new Set(["food", "mart"])

/** Public hub JSON shared across users (service lines + vendor directory). */
const JSON_CACHE_USER = hubPublicHubJsonCacheUserId()

export function HubMarketplaceStoresDirectory({ lineSlug: slugProp }: { lineSlug: string }) {
  const slug = String(slugProp || "").trim().toLowerCase()
  const router = useRouter()
  const { t } = useTranslation("app")
  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [vendors, setVendors] = useState<HubVendorRow[]>([])
  const [loading, setLoading] = useState(true)

  const line = useMemo(() => lines.find((l) => l.slug === slug) ?? null, [lines, slug])
  const lineHome = hubLineHomePath(slug)

  useLayoutEffect(() => {
    if (!MARKETPLACE.has(slug)) return
    const stale = readStaleHubServiceLinesCache(JSON_CACHE_USER)
    if (stale !== null) {
      setLines(stale)
      setLinesLoaded(true)
    }
  }, [slug])

  useLayoutEffect(() => {
    if (!MARKETPLACE.has(slug)) return
    const stale = readStaleHubVendorListCache(JSON_CACHE_USER, slug)
    let list = stale ?? []
    if (list.length > 0 && !hubCachedVendorsMatchServiceLine(list, slug)) {
      clearHubVendorListCache(JSON_CACHE_USER, slug)
      list = []
    }
    setVendors(list)
    const hasRows = list.length > 0
    const vendorListFresh = isHubVendorListCacheFresh(JSON_CACHE_USER, slug)
    if (!vendorListFresh && !hasRows) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (!MARKETPLACE.has(slug)) {
      router.replace("/hub")
      return
    }
  }, [router, slug])

  useEffect(() => {
    if (!MARKETPLACE.has(slug)) return
    if (isHubServiceLinesCacheFresh(JSON_CACHE_USER)) {
      const s = readStaleHubServiceLinesCache(JSON_CACHE_USER)
      if (s) setLines(s)
      setLinesLoaded(true)
      scheduleHubServiceLinesStaleWhileRevalidate(JSON_CACHE_USER, async () => {
        const res = await fetch("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) return null
        const data = await res.json()
        return (data.serviceLines || []) as HubServiceLineRow[]
      }, setLines)
      return
    }

    let cancelled = false
    const silent = readStaleHubServiceLinesCache(JSON_CACHE_USER) !== null
    ;(async () => {
      try {
        const res = await fetch("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("lines")
        const data = await res.json()
        const next = (data.serviceLines || []) as HubServiceLineRow[]
        if (!cancelled) {
          setLines(next)
          writeHubServiceLinesCache(JSON_CACHE_USER, next)
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
  }, [slug])

  useEffect(() => {
    if (!MARKETPLACE.has(slug)) return
    const staleVendors = readStaleHubVendorListCache(JSON_CACHE_USER, slug)
    const vendorsRowsOk = !staleVendors?.length || hubCachedVendorsMatchServiceLine(staleVendors, slug)
    if (
      isHubVendorListCacheFresh(JSON_CACHE_USER, slug) &&
      (staleVendors?.length ?? 0) > 0 &&
      vendorsRowsOk
    ) {
      return
    }

    let cancelled = false
    const staleRows = readStaleHubVendorListCache(JSON_CACHE_USER, slug)
    const hasRows = (staleRows?.length ?? 0) > 0
    if (!hasRows) setLoading(true)

    ;(async () => {
      try {
        const res = await fetch(`/api/hub/vendors?service_line=${encodeURIComponent(slug)}`, { cache: "no-store" })
        if (!res.ok) throw new Error("vendors")
        const data = await res.json()
        const next = (data.vendors || []) as HubVendorRow[]
        if (!cancelled) {
          setVendors(next)
          writeHubVendorListCache(JSON_CACHE_USER, slug, next)
        }
      } catch {
        if (!cancelled) setVendors([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const title = line?.title
    ? `${t("hub.marketplaceStoresHeading", { defaultValue: "Stores" })} · ${line.title}`
    : t("hub.marketplaceStoresHeading", { defaultValue: "Stores" })
  const subtitle = t("hub.storesDirectorySubtitle", { defaultValue: "Choose a store to see its products." })

  if (!MARKETPLACE.has(slug)) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
          <div className="h-10 rounded-lg bg-muted" />
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  const unavailable = linesLoaded && (!line || !line.is_enabled)

  if (unavailable) {
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
    <HubLinePageShell
      title={title}
      subtitle={subtitle}
      backToHubAriaLabel={t("hub.backToLine", { defaultValue: "Back to line" })}
      backHref={lineHome}
    >
      {loading && vendors.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("hub.marketplaceNoVendors", { defaultValue: "No stores yet — check back soon." })}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={hubMarketplaceVendorPath(slug, v.slug)}
              prefetch
              className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-orange-300/70 hover:shadow-md"
            >
              <div className="relative aspect-square w-full bg-muted">
                {v.photo_url ? (
                  <img
                    src={v.photo_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">{v.name}</div>
                )}
              </div>
              <div className="space-y-1 border-t border-border/60 bg-card/80 p-3">
                <HubVendorCardNameRow
                  name={v.name}
                  isVerified={v.is_verified}
                  verifiedAriaLabel={t("hub.verifiedVendor", { defaultValue: "Verified vendor" })}
                  align="start"
                  textClassName="text-sm"
                />
                {v.short_bio ? <p className="line-clamp-2 text-xs text-muted-foreground">{v.short_bio}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </HubLinePageShell>
  )
}
