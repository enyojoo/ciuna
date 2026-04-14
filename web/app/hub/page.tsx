"use client"

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HubProductRow } from "@/lib/hub-types"
import {
  isHubCatalogCacheFresh,
  readStaleHubCatalogCache,
  writeHubCatalogCache,
} from "@/lib/hub-client-cache"
import { formatCurrencySymbolOnly } from "@/utils/currency"

/** Product line name — not localized. */
const HUB_PRODUCT_LINE = "Ciuna Hub"

const ALL_CATEGORIES_VALUE = "__all__"

function featuredRank(p: HubProductRow): number {
  return p.is_featured ? 1 : 0
}

/** Featured first, then `updated_at` descending (stable for cache + API). */
function sortHubCatalogProducts(list: HubProductRow[]): HubProductRow[] {
  return [...list].sort((a, b) => {
    const fr = featuredRank(b) - featuredRank(a)
    if (fr !== 0) return fr
    const ta = new Date(a.updated_at).getTime()
    const tb = new Date(b.updated_at).getTime()
    return tb - ta
  })
}

function formatCardPrice(amount: number | null, currency: string | null): string {
  if (amount == null) return "—"
  // Guard against any fallback formatter appending an ISO code like "USD".
  return formatCurrencySymbolOnly(Number(amount), currency)
    .replace(/\s?[A-Z]{3}\b/g, "")
    .replace(/\.00\b/g, "")
    .trim()
}

function formatAmountOnly(amount: number, currency: string | null): string {
  return formatCardPrice(amount, currency).replace(/^[^\d-]*/, "")
}

const amountValueClass = "text-base sm:text-xl font-bold tabular-nums tracking-tight text-gray-900"
const amountPrefixClass = "text-[10px] sm:text-[11px] font-medium text-gray-500"

function renderUserInputRangeLabel(
  min: number | null,
  max: number | null,
  currency: string | null,
  t: (key: string) => string,
): ReactNode {
  const hasMin = typeof min === "number" && Number.isFinite(min)
  const hasMax = typeof max === "number" && Number.isFinite(max)
  if (!hasMin && !hasMax) return t("hub.setAmount")

  const minVal = hasMin ? Number(min) : null
  const maxVal = hasMax ? Number(max) : null
  const minLabel = minVal != null ? formatCardPrice(minVal, currency) : null
  const maxLabel = maxVal != null ? formatCardPrice(maxVal, currency) : null

  if (minLabel && maxLabel) {
    // Simplified per UX: show only "Pay from X" on cards.
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className={amountPrefixClass}>{t("hub.payFrom")}</span>
        <span className={amountValueClass}>{minLabel}</span>
      </div>
    )
  }
  if (minLabel) {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className={amountPrefixClass}>{t("hub.payFrom")}</span>
        <span className={amountValueClass}>{minLabel}</span>
      </div>
    )
  }
  if (maxLabel) {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className={amountPrefixClass}>{t("hub.payUpTo")}</span>
        <span className={amountValueClass}>{maxLabel}</span>
      </div>
    )
  }
  return t("hub.setAmount")
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
    if (!cacheUserId) return

    let cancelled = false
    ;(async () => {
      try {
        // Always revalidate on mount so Office DB changes (e.g. image edits) reflect quickly.
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
  }, [user, authLoading, router, cacheUserId])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      const c = (p.category || "").trim()
      if (c) set.add(c)
    }
    const sorted = [...set].sort((a, b) => a.localeCompare(b))
    if (selectedCategory && !sorted.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())) {
      sorted.unshift(selectedCategory)
    }
    return sorted
  }, [products, selectedCategory])

  /** Match URL `category` to canonical casing from loaded products when possible. */
  const categorySelectValue = useMemo(() => {
    if (!selectedCategory) return ALL_CATEGORIES_VALUE
    const q = selectedCategory.toLowerCase()
    for (const c of categoryOptions) {
      if (c.toLowerCase() === q) return c
    }
    return selectedCategory
  }, [selectedCategory, categoryOptions])

  const orderedProducts = useMemo(() => sortHubCatalogProducts(products), [products])

  const visibleProducts = useMemo(() => {
    if (!selectedCategory) return orderedProducts
    const q = selectedCategory.toLowerCase()
    return orderedProducts.filter((p) => (p.category || "").trim().toLowerCase() === q)
  }, [orderedProducts, selectedCategory])

  const onCategoryFilterChange = useCallback(
    (value: string) => {
      if (value === ALL_CATEGORIES_VALUE) {
        router.replace("/hub")
        return
      }
      router.replace(`/hub?category=${encodeURIComponent(value)}`)
    },
    [router],
  )

  if (!user) {
    return (
      <div className="min-w-0">
        <div className="px-4 py-5 sm:px-6 mx-auto w-full max-w-5xl space-y-5 animate-pulse">
          <div className="rounded-2xl bg-gray-100 h-28" />
          <div className="flex items-center gap-3">
            <div className="h-7 w-28 rounded bg-gray-100 shrink-0" />
            <div className="flex-1 h-px bg-gray-100" />
            <div className="h-9 w-40 rounded bg-gray-100 shrink-0" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-100 aspect-[4/3] max-h-[220px]" />
            ))}
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

        {loading && products.length === 0 ? (
          <div className="space-y-5 animate-pulse">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-7 w-28 rounded bg-gray-100 shrink-0" />
              <div className="flex-1 h-px bg-gray-100" />
              <div className="h-9 w-44 rounded bg-gray-100 shrink-0" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-100 aspect-[4/3] max-h-[220px]" />
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">{t("hub.noProducts")}</CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 shrink-0">{t("hub.productsSectionTitle")}</h3>
              <div className="flex-1 min-w-[1rem] border-t border-dashed border-gray-300" aria-hidden />
              <div className="shrink-0 w-[min(100%,12rem)] sm:w-56">
                <Select value={categorySelectValue} onValueChange={onCategoryFilterChange}>
                  <SelectTrigger aria-label={t("hub.categoryFilterAria")}>
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

            {visibleProducts.length === 0 ? (
              <Card>
                <CardContent className="py-10 space-y-3 text-center text-gray-600">
                  <p>{t("hub.noProductsInCategory")}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/hub">{t("hub.allCategories")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {visibleProducts.map((p) => (
                  <Card
                    key={p.id}
                    className="h-full group overflow-hidden rounded-3xl border border-gray-200 bg-white gap-0 py-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)] motion-safe:hover:border-orange-300/70"
                  >
                    <CardContent className="p-0 h-full flex flex-col">
                      <Link
                        href={`/hub/${p.id}`}
                        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="absolute inset-0 h-full w-full object-contain"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center px-3 text-center text-xs text-gray-500">
                              {t("hub.noImage")}
                            </div>
                          )}
                          <div className="absolute right-2 top-2">
                            <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-medium text-gray-700">
                              {p.category || "Other"}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex flex-1 flex-col gap-1 px-2.5 pb-1.5 pt-2 sm:px-3 sm:pt-2 sm:pb-2">
                        <Link href={`/hub/${p.id}`} className="block min-w-0 group/title">
                          <p className="line-clamp-2 text-[13px] sm:text-sm font-semibold leading-snug text-gray-900 group-hover/title:text-orange-700 transition-colors">
                            {p.title}
                          </p>
                          {p.short_description ? (
                            <p className="line-clamp-2 text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed mb-2">{p.short_description}</p>
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
                            <Link href={`/hub/checkout/${p.id}`}>
                              {p.pricing_type === "fixed" ? t("hub.buy") : t("hub.order")}
                            </Link>
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
      </div>
    </div>
  )
}
