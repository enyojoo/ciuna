"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HubProductRow } from "@/lib/hub-types"
import {
  isHubCatalogCacheFresh,
  readStaleHubCatalogCache,
  writeHubCatalogCache,
} from "@/lib/hub-client-cache"
import { ChevronRight } from "lucide-react"

/** Product line name — not localized. */
const HUB_PRODUCT_LINE = "Ciuna Hub"

function formatPrice(amount: number | null, currency: string | null): string {
  if (amount == null) return "—"
  return `${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ""}`.trim()
}

export default function HubCatalogPage() {
  const { t } = useTranslation("app")
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [loading, setLoading] = useState(false)
  const selectedCategory = (searchParams.get("category") || "").trim()
  /** Prefer session `user.id` so cache keys stay stable before `userProfile` loads (matches hub LS writes). */
  const cacheUserId = user?.id ?? userProfile?.id ?? ""

  useLayoutEffect(() => {
    if (!cacheUserId) return
    setProducts((prev) => {
      if (prev.length > 0) return prev
      const stale = readStaleHubCatalogCache(cacheUserId)
      if (stale && stale.length > 0) return stale
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
    if (!cacheUserId) return
    if (isHubCatalogCacheFresh(cacheUserId)) {
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth("/api/hub/products")
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        const list = (data.products || []) as HubProductRow[]
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
  }, [user, authLoading, router, cacheUserId])

  const grouped = useMemo(() => {
    const map = new Map<string, HubProductRow[]>()
    for (const p of products) {
      const key = (p.category || "Other").trim() || "Other"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    const entries = Array.from(map.entries()).map(([category, rows]) => ({ category, rows }))
    entries.sort((a, b) => a.category.localeCompare(b.category))
    return entries
  }, [products])

  const visibleSections = selectedCategory
    ? grouped.filter((g) => g.category.toLowerCase() === selectedCategory.toLowerCase())
    : grouped

  if (!user) {
    return (
      <div className="min-w-0">
        <div className="px-4 py-5 sm:px-6 mx-auto w-full max-w-5xl space-y-5 animate-pulse">
          <div className="rounded-2xl bg-gray-100 h-28" />
          <div className="space-y-3">
            <div className="h-8 w-40 rounded bg-gray-100" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[150px] h-[210px] rounded-xl bg-gray-100 shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <div className="px-4 py-5 sm:px-6 space-y-5 mx-auto w-full max-w-5xl">
        <section className="rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-5 py-6 text-white shadow-sm">
          <h2 className="text-2xl font-bold leading-tight">{HUB_PRODUCT_LINE}</h2>
          <p className="mt-2 text-sm/6 text-orange-50 max-w-xl">{t("hub.catalogSubtitle")}</p>
        </section>

        {selectedCategory ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              {t("hub.showingCategory")} <span className="font-semibold">{selectedCategory}</span>
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/hub">{t("hub.allCategories")}</Link>
            </Button>
          </div>
        ) : null}

        {loading && products.length === 0 ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2].map((row) => (
              <section key={row} className="space-y-3">
                <div className="h-8 w-36 rounded bg-gray-100" />
                <div className="flex gap-3 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`${row}-${i}`} className="w-[150px] h-[210px] rounded-xl bg-gray-100 shrink-0" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : products.length === 0 || visibleSections.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">{t("hub.noProducts")}</CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {visibleSections.map(({ category, rows }) => (
              <section key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">{category}</h3>
                  <Button asChild variant="ghost" size="sm" className="text-primary">
                    <Link href={`/hub?category=${encodeURIComponent(category)}`}>
                      {t("hub.all")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
                  <div className="flex gap-3 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {(selectedCategory ? rows : rows.slice(0, 12)).map((p) => (
                      <Card
                        key={p.id}
                        className="group w-[31vw] max-w-[180px] min-w-[150px] sm:w-auto sm:max-w-none sm:min-w-0 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-0">
                          <Link href={`/hub/${p.id}`} className="block">
                            <div className="aspect-[4/3] w-full bg-gray-100">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                                  {t("hub.noImage")}
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="p-2.5 space-y-2">
                            <Link href={`/hub/${p.id}`} className="block">
                              <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">{p.title}</p>
                              {p.short_description ? (
                                <p className="line-clamp-1 text-xs text-gray-500 mt-1">{p.short_description}</p>
                              ) : null}
                            </Link>
                            <div className="space-y-2">
                              {p.pricing_type === "fixed" ? (
                                <p className="text-base font-semibold text-gray-900">
                                  {formatPrice(p.fixed_amount, p.fixed_currency)}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-600">{t("hub.setAmount")}</p>
                              )}
                              <Button asChild size="sm" className="w-full h-8 text-xs">
                                <Link href={`/hub/${p.id}`}>{p.pricing_type === "fixed" ? t("hub.buy") : t("hub.order")}</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
