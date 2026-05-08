"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HubProductRow } from "@/lib/hub-types"
import {
  amountPrefixClass,
  amountValueClass,
  formatCardPrice,
  renderUserInputRangeLabel,
  sortHubCatalogProducts,
} from "@/lib/hub-catalog-utils"

const ALL_CATEGORIES_VALUE = "__all__"

export function VendorHubCatalog({
  products,
  loading,
  vendorBasePath,
}: {
  products: HubProductRow[]
  loading: boolean
  /** e.g. `/hub/food/v/acme` — category query is appended here */
  vendorBasePath: string
}) {
  const { t } = useTranslation("app")
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = (searchParams.get("category") || "").trim()

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
        router.replace(vendorBasePath)
        return
      }
      router.replace(`${vendorBasePath}?category=${encodeURIComponent(value)}`)
    },
    [router, vendorBasePath],
  )

  if (loading && products.length === 0) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-7 w-28 shrink-0 rounded bg-muted" />
          <div className="min-w-[1rem] flex-1 border-t border-dashed border-border" aria-hidden />
          <div className="h-9 w-44 shrink-0 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] max-h-[220px] rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return <div className="py-12 text-center text-sm text-muted-foreground">{t("hub.noProducts")}</div>
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-3 pb-4">
        <h3 className="shrink-0 text-lg font-semibold text-foreground">{t("hub.productsSectionTitle")}</h3>
        <div className="min-w-[1rem] flex-1 border-t border-dashed border-border" aria-hidden />
        <div className="w-[min(100%,12rem)] shrink-0 sm:w-56">
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
        <div className="space-y-3 py-12 text-center text-sm text-muted-foreground">
          <p>{t("hub.noProductsInCategory")}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => onCategoryFilterChange(ALL_CATEGORIES_VALUE)}>
            {t("hub.allCategories")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {visibleProducts.map((p) => (
            <Card
              key={p.id}
              className="group h-full gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white py-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:border-orange-300/70 motion-safe:hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)]"
            >
              <CardContent className="flex h-full flex-col p-0">
                <Link
                  href={`/hub/checkout/${p.id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="absolute inset-0 h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-gray-500">
                        {t("hub.noImage")}
                      </div>
                    )}
                    <div className="absolute right-2 top-1">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-1 py-0.5 text-[7px] font-medium text-gray-700 backdrop-blur sm:px-1.5 sm:text-[8px]">
                        {p.category || "Other"}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-1 px-2.5 pb-1.5 pt-2 sm:px-3 sm:pb-2 sm:pt-2">
                  <Link href={`/hub/checkout/${p.id}`} className="group/title block min-w-0">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors group-hover/title:text-orange-700 sm:text-sm">
                      {p.title}
                    </p>
                    {p.short_description ? (
                      <p className="mb-2 mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">{p.short_description}</p>
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
                    <Button asChild size="sm" className="h-8 w-full rounded-xl text-xs font-semibold">
                      <Link href={`/hub/checkout/${p.id}`}>{p.pricing_type === "fixed" ? t("hub.buy") : t("hub.order")}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
