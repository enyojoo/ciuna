"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppPageHeader } from "@/components/layout/app-page-header"
import type { HubProductRow } from "@/lib/hub-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import { categoryMatchesSlug } from "@/lib/hub-slug"
import {
  isHubCatalogCacheFresh,
  readStaleHubCatalogCache,
  writeHubCatalogCache,
} from "@/lib/hub-client-cache"
import {
  amountPrefixClass,
  amountValueClass,
  formatCardPrice,
  renderUserInputRangeLabel,
  sortHubCatalogProducts,
} from "@/lib/hub-catalog-utils"

export default function HubServiceCatalogPage() {
  const params = useParams()
  const slug = String(params?.slug || "").trim().toLowerCase()
  const { t } = useTranslation("app")
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [loading, setLoading] = useState(false)
  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const cacheUserId = user?.id ?? userProfile?.id ?? ""

  const line = useMemo(() => lines.find((l) => l.slug === slug) ?? null, [lines, slug])

  useLayoutEffect(() => {
    if (!cacheUserId) return
    setProducts((prev) => {
      if (prev.length > 0) return prev
      const stale = readStaleHubCatalogCache(cacheUserId)
      if (stale && stale.length > 0) return sortHubCatalogProducts(stale)
      return prev
    })
    const stale = readStaleHubCatalogCache(cacheUserId)
    const hasRows = (stale?.length ?? 0) > 0
    const cacheFresh = isHubCatalogCacheFresh(cacheUserId)
    if (!cacheFresh && !hasRows) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [cacheUserId])

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("lines")
        const data = await res.json()
        if (!cancelled) setLines((data.serviceLines || []) as HubServiceLineRow[])
      } catch {
        if (!cancelled) setLines([])
      } finally {
        if (!cancelled) setLinesLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, router])

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
    if (!user || !cacheUserId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth("/api/hub/products", { cache: "no-store" })
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        const list = sortHubCatalogProducts((data.products || []) as HubProductRow[])
        if (!cancelled) {
          setProducts(list)
          writeHubCatalogCache(cacheUserId, list)
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
  }, [user, cacheUserId])

  const visibleProducts = useMemo(() => {
    if (!slug) return []
    return sortHubCatalogProducts(products).filter((p) => categoryMatchesSlug(p.category || "", slug))
  }, [products, slug])

  const unavailable = linesLoaded && (!line || !line.is_enabled)

  const title = line?.title || slug || t("hub.hub")

  if (!user) {
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
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <AppPageHeader title={t("hub.unavailableTitle")} backHref="/hub" />
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">{t("hub.serviceUnavailable")}</CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (linesLoaded && line?.grid_kind === "external_url") {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <AppPageHeader title={title} backHref="/hub" />
          <p className="text-sm text-muted-foreground">{t("hub.openingExternal")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 space-y-5">
        <AppPageHeader title={title} backHref="/hub" />

        {slug === "experts" && visibleProducts.length > 0 ? (
          <div className="flex justify-end">
            <Button asChild className="rounded-full">
              <Link href="/hub/experts/book">{t("experts.booking.title")}</Link>
            </Button>
          </div>
        ) : null}

        {loading && products.length === 0 ? (
          <div className="space-y-5 animate-pulse">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] max-h-[220px] rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        ) : visibleProducts.length === 0 ? (
          <Card>
            <CardContent className="py-10 space-y-3 text-center text-gray-600">
              <p>{t("hub.noProductsInCategory")}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/hub">{t("hub.backToHub")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {visibleProducts.map((p) => (
              <Card
                key={p.id}
                className="h-full group overflow-hidden rounded-2xl border border-gray-200 bg-white gap-0 py-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)] motion-safe:hover:border-orange-300/70"
              >
                <CardContent className="p-0 h-full flex flex-col">
                  <Link
                    href={`/hub/checkout/${p.id}`}
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
                    <Link href={`/hub/checkout/${p.id}`} className="block min-w-0 group/title">
                      <p className="line-clamp-2 text-[13px] sm:text-sm font-semibold leading-snug text-gray-900 group-hover/title:text-orange-700 transition-colors">
                        {p.title}
                      </p>
                      {p.short_description ? (
                        <p className="line-clamp-2 text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed mb-2">
                          {p.short_description}
                        </p>
                      ) : null}
                    </Link>
                    <div className="mt-auto flex flex-col gap-1.5 pt-3">
                      {p.pricing_type === "fixed" ? (
                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                          <span className={amountPrefixClass}>
                            {(() => {
                              const label = t("hub.sellPrice")
                              return label === "hub.sellPrice" ? "Sell price" : label
                            })()}
                          </span>
                          <span className={amountValueClass}>{formatCardPrice(p.fixed_amount, p.fixed_currency)}</span>
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
                        <Link href={`/hub/checkout/${p.id}`}>{p.pricing_type === "fixed" ? t("hub.buy") : t("hub.order")}</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
