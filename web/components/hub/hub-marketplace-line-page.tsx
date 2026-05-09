"use client"

import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import type { HubProductRow } from "@/lib/hub-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import {
  hubMarketplaceSliceCacheUserId,
  hubPublicHubJsonCacheUserId,
  isHubCatalogCacheFresh,
  isHubServiceLinesCacheFresh,
  isHubVendorListCacheFresh,
  readStaleHubCatalogCache,
  readStaleHubServiceLinesCache,
  readStaleHubVendorListCache,
  scheduleHubServiceLinesStaleWhileRevalidate,
  writeHubCatalogCache,
  writeHubServiceLinesCache,
  writeHubVendorListCache,
} from "@/lib/hub-client-cache"
import { sortHubCatalogProducts } from "@/lib/hub-catalog-utils"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { HubMarketplaceLineHome } from "@/components/hub/hub-marketplace-line-home"

const SERVICE_LINES_CACHE_USER = hubPublicHubJsonCacheUserId()

/**
 * Dedicated marketplace line page (Food / Mart) modeled on `/experts`:
 * one mounted instance per route, route-locked `lineSlug`, separate cache buckets,
 * minimal effects, no cross-line state to bleed.
 */
function HubMarketplaceLinePageInner({ lineSlug }: { lineSlug: "food" | "mart" }) {
  const { t } = useTranslation("app")

  const catalogCacheUser = hubMarketplaceSliceCacheUserId(lineSlug)

  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [vendors, setVendors] = useState<HubVendorRow[]>([])
  const [loadingVendors, setLoadingVendors] = useState(true)

  const line = useMemo(() => lines.find((l) => l.slug === lineSlug) ?? null, [lines, lineSlug])

  /** Hydrate service lines from cache for the page hero before the network fetch lands. */
  useLayoutEffect(() => {
    const stale = readStaleHubServiceLinesCache(SERVICE_LINES_CACHE_USER)
    if (stale !== null) {
      setLines(stale)
      setLinesLoaded(true)
    }
  }, [])

  /** Hydrate products from this line's isolated cache bucket. */
  useLayoutEffect(() => {
    const stale = readStaleHubCatalogCache(catalogCacheUser, "all")
    const hasRows = (stale?.length ?? 0) > 0
    if (hasRows) {
      setProducts(sortHubCatalogProducts(stale!))
    }
    if (hasRows || isHubCatalogCacheFresh(catalogCacheUser, "all")) {
      setLoadingProducts(false)
    }
  }, [catalogCacheUser])

  /** Hydrate vendors from this line's isolated cache bucket. */
  useLayoutEffect(() => {
    const stale = readStaleHubVendorListCache(catalogCacheUser, lineSlug)
    const hasRows = (stale?.length ?? 0) > 0
    if (hasRows) setVendors(stale!)
    if (hasRows || isHubVendorListCacheFresh(catalogCacheUser, lineSlug)) {
      setLoadingVendors(false)
    }
  }, [catalogCacheUser, lineSlug])

  /** Fetch service lines (only if not fresh; SWR otherwise). Public marketplace ⇒ no auth needed. */
  useEffect(() => {
    if (isHubServiceLinesCacheFresh(SERVICE_LINES_CACHE_USER)) {
      const s = readStaleHubServiceLinesCache(SERVICE_LINES_CACHE_USER)
      if (s) setLines(s)
      setLinesLoaded(true)
      scheduleHubServiceLinesStaleWhileRevalidate(SERVICE_LINES_CACHE_USER, async () => {
        const res = await fetch("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) return null
        const data = await res.json()
        return (data.serviceLines || []) as HubServiceLineRow[]
      }, setLines)
      return
    }

    let cancelled = false
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
        /* ignore */
      } finally {
        if (!cancelled) setLinesLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /** Fetch products for THIS line. Always re-fetch on mount (stale-while-revalidate). */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/hub/products?service_line=${encodeURIComponent(lineSlug)}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("products")
        const data = await res.json()
        const list = sortHubCatalogProducts((data.products || []) as HubProductRow[])
        if (!cancelled) {
          setProducts(list)
          writeHubCatalogCache(catalogCacheUser, list, "all")
        }
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [catalogCacheUser, lineSlug])

  /** Fetch vendors for THIS line. Always re-fetch on mount (stale-while-revalidate). */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/hub/vendors?service_line=${encodeURIComponent(lineSlug)}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("vendors")
        const data = await res.json()
        const next = (data.vendors || []) as HubVendorRow[]
        if (!cancelled) {
          setVendors(next)
          writeHubVendorListCache(catalogCacheUser, lineSlug, next)
        }
      } catch {
        if (!cancelled) setVendors([])
      } finally {
        if (!cancelled) setLoadingVendors(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [catalogCacheUser, lineSlug])

  const title = line?.title || t("hub.hub")
  const subtitle = line?.short_description || null

  if (linesLoaded && line && !line.is_enabled) {
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
      <HubMarketplaceLineHome
        lineSlug={lineSlug}
        vendors={vendors}
        allProducts={products}
        loadingVendors={loadingVendors}
        loadingProducts={loadingProducts}
      />
    </HubLinePageShell>
  )
}

function HubMarketplaceLineFallback() {
  return (
    <div className="min-w-0 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
        <div className="h-10 rounded-lg bg-muted" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 w-28 shrink-0 rounded-2xl bg-muted sm:h-40 sm:w-32" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] max-h-[220px] rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function HubMarketplaceLinePage({ lineSlug }: { lineSlug: "food" | "mart" }) {
  return (
    <Suspense fallback={<HubMarketplaceLineFallback />}>
      <HubMarketplaceLinePageInner lineSlug={lineSlug} />
    </Suspense>
  )
}
