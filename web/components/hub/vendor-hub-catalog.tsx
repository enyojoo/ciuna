"use client"

import { useCallback, useMemo, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { stashRedirectAfterLogin } from "@/lib/auth-login-redirect"
import { HubProductVendorChipLight } from "@/components/hub/hub-product-vendor-chip-light"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HubProductRow } from "@/lib/hub-types"
import {
  amountPrefixClass,
  HubCatalogFixedPrice,
  renderUserInputRangeLabel,
  sortHubCatalogProducts,
} from "@/lib/hub-catalog-utils"
import { hubGenericCheckoutPath, hubMarketplaceCheckoutPath, isHubMarketplaceLineSlug } from "@/lib/hub-public-paths"

const ALL_CATEGORIES_VALUE = "__all__"

export function VendorHubCatalog({
  products,
  loading,
  vendorBasePath,
  lineSlug,
  showVendorChip = true,
}: {
  products: HubProductRow[]
  loading: boolean
  /** e.g. `/food/v/acme` — category query is appended here */
  vendorBasePath: string
  lineSlug: string
  /** When false (single-vendor storefront), hide redundant vendor row on each card. */
  showVendorChip?: boolean
}) {
  const { t } = useTranslation("app")
  const router = useRouter()
  const pathname = usePathname() || ""
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const selectedCategory = (searchParams.get("category") || "").trim()
  const line = String(lineSlug || "").trim().toLowerCase()
  const productCheckoutHref = (productId: string) =>
    isHubMarketplaceLineSlug(line) ? hubMarketplaceCheckoutPath(line, productId) : hubGenericCheckoutPath(productId)

  const returnPath = useMemo(() => {
    const q = searchParams.toString()
    return (q ? `${pathname}?${q}` : pathname) || "/hub"
  }, [pathname, searchParams])

  const onGuestProductNav = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      stashRedirectAfterLogin(returnPath)
      router.push("/auth/login")
    },
    [returnPath, router],
  )

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
      <div className="space-y-6 animate-pulse">
        <div className="flex min-w-0 flex-nowrap items-center justify-between gap-2 sm:gap-3">
          <div className="h-7 min-w-0 flex-1 max-w-[40%] rounded bg-muted" />
          <div className="h-10 w-44 shrink-0 rounded-md bg-muted sm:w-56" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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
                  href={user ? productCheckoutHref(p.id) : "/auth/login"}
                  prefetch={Boolean(user)}
                  onClick={user ? undefined : onGuestProductNav}
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
                  <Link
                    href={user ? productCheckoutHref(p.id) : "/auth/login"}
                    prefetch={Boolean(user)}
                    onClick={user ? undefined : onGuestProductNav}
                    className="group/title block min-w-0"
                  >
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors group-hover/title:text-orange-700 sm:text-sm">
                      {p.title}
                    </p>
                    {p.short_description ? (
                      <p className="mb-2 mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">{p.short_description}</p>
                    ) : null}
                  </Link>
                  {showVendorChip && p.vendor ? (
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
                      <Link
                        href={user ? productCheckoutHref(p.id) : "/auth/login"}
                        prefetch={Boolean(user)}
                        onClick={user ? undefined : onGuestProductNav}
                      >
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
    </section>
  )
}
