"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HubProductRow } from "@/lib/hub-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import { categoryMatchesSlug, hubProductBelongsToServiceLine } from "@/lib/hub-slug"
import {
  hubClientCacheUserId,
  hubPublicHubJsonCacheUserId,
  isHubCatalogCacheFresh,
  isHubServiceLinesCacheFresh,
  isHubVendorListCacheFresh,
  readStaleHubCatalogCache,
  readStaleHubServiceLinesCache,
  readStaleHubVendorListCache,
  writeHubCatalogCache,
  writeHubServiceLinesCache,
  writeHubVendorListCache,
  type HubCatalogCacheScope,
} from "@/lib/hub-client-cache"
import {
  amountPrefixClass,
  HubCatalogFixedPrice,
  renderUserInputRangeLabel,
  sortHubCatalogProducts,
} from "@/lib/hub-catalog-utils"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { HubProductVendorChipLight } from "@/components/hub/hub-product-vendor-chip-light"
import { HubMarketplaceLineHome } from "@/components/hub/hub-marketplace-line-home"
import { hubGenericCheckoutPath, hubLineHomePath, hubMarketplaceCheckoutPath } from "@/lib/hub-public-paths"

const ALL_CATEGORIES_VALUE = "__all__"

const MARKETPLACE_SLUGS = new Set(["food", "mart"])

export function HubServiceCatalogPage({ slug: slugProp }: { slug: string }) {
  const slug = String(slugProp || "").trim().toLowerCase()
  const { t } = useTranslation("app")
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [loading, setLoading] = useState(false)
  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [vendors, setVendors] = useState<HubVendorRow[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)
  const cacheUserId = hubClientCacheUserId(user?.id, userProfile?.id)
  const marketplaceJsonCacheId = hubPublicHubJsonCacheUserId()
  const isMarketplaceLine = MARKETPLACE_SLUGS.has(slug)
  /** Service lines list is the same for every user; avoids refetch when auth session hydrates. */
  const linesCacheUserId = marketplaceJsonCacheId
  const marketplaceCatalogUserId = isMarketplaceLine ? marketplaceJsonCacheId : cacheUserId

  const line = useMemo(() => lines.find((l) => l.slug === slug) ?? null, [lines, slug])
  const lineHome = hubLineHomePath(slug)

  const catalogScope: HubCatalogCacheScope = isMarketplaceLine ? (slug as "food" | "mart") : "all"

  useLayoutEffect(() => {
    if (!linesCacheUserId) return
    const staleLines = readStaleHubServiceLinesCache(linesCacheUserId)
    if (staleLines !== null) {
      setLines(staleLines)
      setLinesLoaded(true)
    }
  }, [linesCacheUserId])

  useLayoutEffect(() => {
    if (!marketplaceCatalogUserId) return
    setProducts((prev) => {
      if (prev.length > 0) return prev
      const stale = readStaleHubCatalogCache(marketplaceCatalogUserId, catalogScope)
      if (stale && stale.length > 0) return sortHubCatalogProducts(stale)
      return prev
    })
    const stale = readStaleHubCatalogCache(marketplaceCatalogUserId, catalogScope)
    const hasRows = (stale?.length ?? 0) > 0
    const cacheFresh = isHubCatalogCacheFresh(marketplaceCatalogUserId, catalogScope)
    if (!cacheFresh && !hasRows) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [marketplaceCatalogUserId, catalogScope])

  useLayoutEffect(() => {
    if (!isMarketplaceLine) return
    setVendors((prev) => {
      if (prev.length > 0) return prev
      const stale = readStaleHubVendorListCache(marketplaceJsonCacheId, slug)
      if (stale && stale.length > 0) return stale
      return prev
    })
    const stale = readStaleHubVendorListCache(marketplaceJsonCacheId, slug)
    const hasRows = (stale?.length ?? 0) > 0
    const vendorListFresh = isHubVendorListCacheFresh(marketplaceJsonCacheId, slug)
    if (!vendorListFresh && !hasRows) {
      setLoadingVendors(true)
    } else {
      setLoadingVendors(false)
    }
  }, [marketplaceJsonCacheId, slug, isMarketplaceLine])

  useEffect(() => {
    if (!isMarketplaceLine && !authLoading && !user) {
      router.push("/auth/login")
    }
  }, [isMarketplaceLine, authLoading, user, router])

  useEffect(() => {
    if (!linesCacheUserId) return
    if (!isMarketplaceLine && (authLoading || !user)) return

    if (isHubServiceLinesCacheFresh(linesCacheUserId)) {
      const s = readStaleHubServiceLinesCache(linesCacheUserId)
      if (s) setLines(s)
      setLinesLoaded(true)
      return
    }

    let cancelled = false
    const silent = readStaleHubServiceLinesCache(linesCacheUserId) !== null
    ;(async () => {
      try {
        const res = await fetch("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("lines")
        const data = await res.json()
        const next = (data.serviceLines || []) as HubServiceLineRow[]
        if (!cancelled) {
          setLines(next)
          writeHubServiceLinesCache(linesCacheUserId, next)
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
  }, [authLoading, cacheUserId, user, linesCacheUserId, isMarketplaceLine])

  useEffect(() => {
    if (!linesLoaded || !line) return
    if (line.grid_kind === "app_link") {
      const target = line.route_path?.trim() || "/hub"
      router.replace(target)
      return
    }
    if (line.grid_kind === "external_url" && line.href?.trim()) {
      window.location.href = line.href.trim()
    }
  }, [linesLoaded, line, router])

  useEffect(() => {
    if (!marketplaceCatalogUserId) return
    if (!isMarketplaceLine && !user) return
    if (isHubCatalogCacheFresh(marketplaceCatalogUserId, catalogScope)) return

    let cancelled = false
    ;(async () => {
      try {
        const qs = catalogScope !== "all" ? `?service_line=${encodeURIComponent(catalogScope)}` : ""
        const res = isMarketplaceLine
          ? await fetch(`/api/hub/products${qs}`, { cache: "no-store" })
          : await fetchWithAuth(`/api/hub/products${qs}`, { cache: "no-store" })
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        const list = sortHubCatalogProducts((data.products || []) as HubProductRow[])
        if (!cancelled) {
          setProducts(list)
          writeHubCatalogCache(marketplaceCatalogUserId, list, catalogScope)
        }
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, marketplaceCatalogUserId, catalogScope, isMarketplaceLine])

  useEffect(() => {
    if (!isMarketplaceLine) return
    if (isHubVendorListCacheFresh(marketplaceJsonCacheId, slug)) return

    let cancelled = false
    const staleRows = readStaleHubVendorListCache(marketplaceJsonCacheId, slug)
    const hasRows = (staleRows?.length ?? 0) > 0
    if (!hasRows) setLoadingVendors(true)

    ;(async () => {
      try {
        const res = await fetch(`/api/hub/vendors?service_line=${encodeURIComponent(slug)}`, { cache: "no-store" })
        if (!res.ok) throw new Error("vendors")
        const data = await res.json()
        const next = (data.vendors || []) as HubVendorRow[]
        if (!cancelled) {
          setVendors(next)
          writeHubVendorListCache(marketplaceJsonCacheId, slug, next)
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
  }, [marketplaceJsonCacheId, slug, isMarketplaceLine])

  const visibleProducts = useMemo(() => {
    if (!slug) return []
    if (MARKETPLACE_SLUGS.has(slug)) {
      return sortHubCatalogProducts(products).filter((p) => hubProductBelongsToServiceLine(p, slug))
    }
    return sortHubCatalogProducts(products).filter((p) => categoryMatchesSlug(p.category || "", slug))
  }, [products, slug])

  const unavailable = linesLoaded && (!line || !line.is_enabled)

  const title = line?.title || slug || t("hub.hub")
  const subtitle = line?.short_description || null

  const searchParams = useSearchParams()
  const selectedCategory = (searchParams.get("category") || "").trim()

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of visibleProducts) {
      const c = (p.category || "").trim()
      if (c) set.add(c)
    }
    const sorted = [...set].sort((a, b) => a.localeCompare(b))
    if (selectedCategory && !sorted.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())) {
      sorted.unshift(selectedCategory)
    }
    return sorted
  }, [visibleProducts, selectedCategory])

  const categorySelectValue = useMemo(() => {
    if (!selectedCategory) return ALL_CATEGORIES_VALUE
    const q = selectedCategory.toLowerCase()
    for (const c of categoryOptions) {
      if (c.toLowerCase() === q) return c
    }
    return selectedCategory
  }, [selectedCategory, categoryOptions])

  const orderedVisible = useMemo(() => sortHubCatalogProducts(visibleProducts), [visibleProducts])

  const filteredByCategory = useMemo(() => {
    if (!selectedCategory) return orderedVisible
    const q = selectedCategory.toLowerCase()
    return orderedVisible.filter((p) => (p.category || "").trim().toLowerCase() === q)
  }, [orderedVisible, selectedCategory])

  const checkoutHref = (productId: string) =>
    isMarketplaceLine ? hubMarketplaceCheckoutPath(slug, productId) : hubGenericCheckoutPath(productId)

  const onCategoryFilterChange = (value: string) => {
    if (value === ALL_CATEGORIES_VALUE) {
      router.replace(lineHome)
      return
    }
    router.replace(`${lineHome}?category=${encodeURIComponent(value)}`)
  }

  if (!isMarketplaceLine && (authLoading || !user)) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
          <div className="h-10 rounded-lg bg-muted" />
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

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

  if (linesLoaded && line?.grid_kind === "external_url") {
    return (
      <HubLinePageShell title={title} subtitle={subtitle} backToHubAriaLabel={t("hub.backToHub")}>
        <p className="text-sm text-muted-foreground">{t("hub.openingExternal")}</p>
      </HubLinePageShell>
    )
  }

  if (isMarketplaceLine && line?.grid_kind === "hub_category") {
    return (
      <HubLinePageShell title={title} subtitle={subtitle} backToHubAriaLabel={t("hub.backToHub")}>
        <HubMarketplaceLineHome
          lineSlug={slug}
          vendors={vendors}
          allProducts={products}
          loadingVendors={loadingVendors}
          loadingProducts={loading && products.length === 0}
        />
      </HubLinePageShell>
    )
  }

  return (
    <HubLinePageShell title={title} subtitle={subtitle} backToHubAriaLabel={t("hub.backToHub")}>
      {loading && products.length === 0 ? (
        <div className="space-y-5 animate-pulse">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] max-h-[220px] rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="space-y-3 py-12 text-center text-sm text-muted-foreground">
          <p>{t("hub.noProductsInCategory")}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/hub">{t("hub.backToHub")}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex min-w-0 flex-nowrap items-center justify-between gap-2 pb-4 sm:gap-3">
            <h3 className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900">
              {t("hub.productsSectionTitle")}
            </h3>
            <div className="shrink-0 basis-44 sm:basis-56 w-44 sm:w-56 min-w-0">
              <Select value={categorySelectValue} onValueChange={onCategoryFilterChange}>
                <SelectTrigger className="max-w-full" aria-label={t("hub.categoryFilterAria")}>
                  <SelectValue placeholder={t("hub.allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES_VALUE}>{t("hub.allCategories")}</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredByCategory.length === 0 ? (
            <div className="space-y-3 py-12 text-center text-sm text-muted-foreground">
              <p>{t("hub.noProductsInCategory")}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => onCategoryFilterChange(ALL_CATEGORIES_VALUE)}>
                {t("hub.allCategories")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {filteredByCategory.map((p) => (
                <Card
                  key={p.id}
                  className="h-full group overflow-hidden rounded-2xl border border-gray-200 bg-white gap-0 py-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)] motion-safe:hover:border-orange-300/70"
                >
                  <CardContent className="p-0 h-full flex flex-col">
                    <Link
                      href={checkoutHref(p.id)}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="absolute inset-0 h-full w-full object-contain" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center px-3 text-center text-xs text-gray-500">
                            {t("hub.noImage")}
                          </div>
                        )}
                        <div className="absolute right-2 top-1">
                          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-1 py-0.5 sm:px-1.5 text-[7px] sm:text-[8px] font-medium text-gray-700">
                            {p.category || "Other"}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col gap-1 px-2.5 pb-1.5 pt-2 sm:px-3 sm:pt-2 sm:pb-2">
                      <Link href={checkoutHref(p.id)} className="block min-w-0 group/title">
                        <p className="line-clamp-2 text-[13px] sm:text-sm font-semibold leading-snug text-gray-900 group-hover/title:text-orange-700 transition-colors">
                          {p.title}
                        </p>
                        {p.short_description ? (
                          <p className="mt-1 mb-2 line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                            {p.short_description}
                          </p>
                        ) : null}
                      </Link>
                      {p.vendor ? (
                        <div className="mb-1">
                          <HubProductVendorChipLight vendor={p.vendor} className="max-w-full" />
                        </div>
                      ) : null}
                      <div className="mt-auto flex flex-col gap-1.5 pt-3">
                        {p.pricing_type === "fixed" ? (
                          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                            <span className={amountPrefixClass}>
                              {(() => {
                                const label = t("hub.sellPrice")
                                return label === "hub.sellPrice" ? "Sell price" : label
                              })()}
                            </span>
                            <HubCatalogFixedPrice product={p} />
                          </div>
                        ) : (
                          <div className="text-gray-600">
                            {renderUserInputRangeLabel(
                              p.funded_min,
                              p.funded_max,
                              p.default_input_currency || p.fixed_currency || "USD",
                              t,
                            )}
                          </div>
                        )}
                        <Button asChild size="sm" className="w-full h-8 text-xs font-semibold rounded-xl">
                          <Link href={checkoutHref(p.id)}>{p.pricing_type === "fixed" ? t("hub.buy") : t("hub.order")}</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </HubLinePageShell>
  )
}
