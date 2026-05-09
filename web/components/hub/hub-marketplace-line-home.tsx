"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { ChevronRight } from "lucide-react"
import type { HubProductRow } from "@/lib/hub-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"
import { hubProductBelongsToServiceLine } from "@/lib/hub-slug"
import {
  amountPrefixClass,
  HubCatalogFixedPrice,
  renderUserInputRangeLabel,
  sortHubCatalogProducts,
} from "@/lib/hub-catalog-utils"
import { HubProductVendorChipLight } from "@/components/hub/hub-product-vendor-chip-light"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HubVendorCardNameRow } from "@/components/hub/hub-vendor-card-name-row"
import { hubLineHomePath, hubMarketplaceCheckoutPath, hubMarketplaceStoresPath, hubMarketplaceVendorPath } from "@/lib/hub-public-paths"

const ALL_CATEGORIES_VALUE = "__all__"
const STORES_PREVIEW_COUNT = 8

function MarketplaceProductCard({
  product: p,
  t,
  lineSlug,
}: {
  product: HubProductRow
  t: (k: string, o?: Record<string, unknown>) => string
  lineSlug: string
}) {
  const checkoutHref = hubMarketplaceCheckoutPath(lineSlug, p.id)
  return (
    <Card className="group h-full gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white py-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:border-orange-300/70 motion-safe:hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)]">
      <CardContent className="flex h-full flex-col p-0">
        <Link
          href={checkoutHref}
          prefetch
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
          </div>
        </Link>
        <div className="flex flex-1 flex-col gap-1 px-2.5 pb-1.5 pt-2 sm:px-3 sm:pb-2 sm:pt-2">
          <Link href={checkoutHref} prefetch className="group/title block min-w-0">
            <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors group-hover/title:text-orange-700 sm:text-sm">
              {p.title}
            </p>
            {p.short_description ? (
              <p className="mb-2 mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">{p.short_description}</p>
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
            <Button asChild size="sm" className="h-8 w-full rounded-xl text-xs font-semibold">
              <Link href={checkoutHref} prefetch>{p.pricing_type === "fixed" ? t("hub.buy") : t("hub.order")}</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HubMarketplaceLineHome({
  lineSlug,
  vendors,
  allProducts,
  loadingVendors,
  loadingProducts,
}: {
  lineSlug: string
  vendors: HubVendorRow[]
  allProducts: HubProductRow[]
  loadingVendors: boolean
  loadingProducts: boolean
}) {
  const { t } = useTranslation("app")
  const router = useRouter()
  const searchParams = useSearchParams()
  const lineBase = hubLineHomePath(lineSlug)
  const storesHref = hubMarketplaceStoresPath(lineSlug)

  const selectedCategory = (searchParams.get("category") || "").trim()

  const lineProducts = useMemo(
    () => sortHubCatalogProducts(allProducts).filter((p) => hubProductBelongsToServiceLine(p, lineSlug)),
    [allProducts, lineSlug],
  )

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of lineProducts) {
      const c = (p.category || "").trim()
      if (c) set.add(c)
    }
    const sorted = [...set].sort((a, b) => a.localeCompare(b))
    if (selectedCategory && !sorted.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())) {
      sorted.unshift(selectedCategory)
    }
    return sorted
  }, [lineProducts, selectedCategory])

  const categorySelectValue = useMemo(() => {
    if (!selectedCategory) return ALL_CATEGORIES_VALUE
    const q = selectedCategory.toLowerCase()
    for (const c of categoryOptions) {
      if (c.toLowerCase() === q) return c
    }
    return selectedCategory
  }, [selectedCategory, categoryOptions])

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return lineProducts
    const q = selectedCategory.toLowerCase()
    return lineProducts.filter((p) => (p.category || "").trim().toLowerCase() === q)
  }, [lineProducts, selectedCategory])

  const onCategoryFilterChange = useCallback(
    (value: string) => {
      if (value === ALL_CATEGORIES_VALUE) {
        router.replace(lineBase)
        return
      }
      router.replace(`${lineBase}?category=${encodeURIComponent(value)}`)
    },
    [router, lineBase],
  )

  /** Guard against stale cross-line cache: only show vendors that belong to this line. */
  const lineVendors = useMemo(
    () => vendors.filter((v) => String(v.service_line_slug || "").trim().toLowerCase() === lineSlug),
    [vendors, lineSlug],
  )
  const previewVendors = useMemo(() => lineVendors.slice(0, STORES_PREVIEW_COUNT), [lineVendors])
  const loading = loadingVendors || loadingProducts

  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              {t("hub.marketplaceStoresHeading", { defaultValue: "Stores" })}
            </h2>
          </div>
          {lineVendors.length > 0 ? (
            <Link
              href={storesHref}
              prefetch
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
            >
              {t("hub.marketplaceSeeAllStores", { defaultValue: "See all" })}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>

        {(loading || loadingVendors) && lineVendors.length === 0 ? (
          <div className="flex gap-3 overflow-hidden pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-36 w-28 shrink-0 rounded-2xl bg-muted sm:h-40 sm:w-32" />
            ))}
          </div>
        ) : lineVendors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("hub.marketplaceNoVendors", { defaultValue: "No stores yet — check back soon." })}
          </p>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 pt-0.5 sm:gap-4">
            {previewVendors.map((v) => (
              <Link
                key={v.id}
                href={hubMarketplaceVendorPath(lineSlug, v.slug)}
                prefetch
                className="w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-orange-300/70 hover:shadow-md sm:w-[8.5rem]"
              >
                <div className="relative aspect-square w-full bg-muted">
                  {v.photo_url ? (
                    <img src={v.photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-[10px] font-medium text-muted-foreground">
                      {v.name}
                    </div>
                  )}
                </div>
                <div className="border-t border-border/60 p-2">
                  <HubVendorCardNameRow
                    name={v.name}
                    isVerified={v.is_verified}
                    verifiedAriaLabel={t("hub.verifiedVendor", { defaultValue: "Verified vendor" })}
                    align="center"
                    textClassName="text-xs"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex min-w-0 flex-nowrap items-center justify-between gap-2 sm:gap-3">
          <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-foreground sm:text-xl">
            {t("hub.marketplaceProductsHeading", { defaultValue: "Products" })}
          </h2>
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

        {loading && lineProducts.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] max-h-[220px] rounded-xl bg-muted" />
            ))}
          </div>
        ) : lineProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("hub.noProducts", { defaultValue: "No products yet." })}
          </p>
        ) : filteredProducts.length === 0 ? (
          <div className="space-y-3 py-10 text-center text-sm text-muted-foreground">
            <p>{t("hub.noProductsInCategory")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => onCategoryFilterChange(ALL_CATEGORIES_VALUE)}>
              {t("hub.allCategories")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {sortHubCatalogProducts(filteredProducts).map((p) => (
              <MarketplaceProductCard key={p.id} product={p} t={t} lineSlug={lineSlug} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
