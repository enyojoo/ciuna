"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
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

const SERVICE_LINES_CACHE_USER = hubPublicHubJsonCacheUserId()

export interface HubMarketplaceLineDataResult {
  line: HubServiceLineRow | null
  linesLoaded: boolean
  products: HubProductRow[]
  vendors: HubVendorRow[]
  loadingProducts: boolean
  loadingVendors: boolean
}

/**
 * Self-contained data layer for a single marketplace line page (food or mart).
 * Each call site supplies a literal slug — there is no slug-prop tracking, no shared
 * state with other lines, no cross-line filters, no fetch-generation accounting.
 *
 * Cache buckets are isolated per line via `hubMarketplaceSliceCacheUserId`, so two
 * different routes calling this hook can never see each other's data.
 */
export function useHubMarketplaceLineData(lineSlug: "food" | "mart"): HubMarketplaceLineDataResult {
  const catalogCacheUser = hubMarketplaceSliceCacheUserId(lineSlug)

  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [vendors, setVendors] = useState<HubVendorRow[]>([])
  const [loadingVendors, setLoadingVendors] = useState(true)

  const line = useMemo(() => lines.find((l) => l.slug === lineSlug) ?? null, [lines, lineSlug])

  /** Hydrate service lines from the public cache for the page hero before the network fetch lands. */
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
    if (hasRows) setProducts(sortHubCatalogProducts(stale!))
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

  /** Fetch THIS line's products. Always re-fetches on mount (stale-while-revalidate). */
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

  /** Fetch THIS line's vendors. Always re-fetches on mount (stale-while-revalidate). */
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

  return { line, linesLoaded, products, vendors, loadingProducts, loadingVendors }
}
