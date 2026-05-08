"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import type { HubProductRow } from "@/lib/hub-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"
import { categoryMatchesSlug } from "@/lib/hub-slug"
import {
  formatCardPrice,
  renderUserInputRangeLabel,
  sortHubCatalogProducts,
} from "@/lib/hub-catalog-utils"

function shuffleInPlace<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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

  const lineProducts = useMemo(
    () => sortHubCatalogProducts(allProducts).filter((p) => categoryMatchesSlug(p.category || "", lineSlug)),
    [allProducts, lineSlug],
  )

  const carouselProducts = useMemo(() => {
    const withVendor = lineProducts.filter((p) => p.vendor_id)
    const pool = withVendor.length > 0 ? withVendor : lineProducts
    return shuffleInPlace(pool).slice(0, 12)
  }, [lineProducts])

  const loading = loadingVendors || loadingProducts

  return (
    <div className="space-y-10 sm:space-y-12">
      <section>
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("hub.marketplaceForYou", { defaultValue: "For you" })}</h3>
        {loading && carouselProducts.length === 0 ? (
          <div className="flex gap-3 overflow-hidden pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-40 w-36 shrink-0 rounded-xl bg-muted sm:h-44 sm:w-40" />
            ))}
          </div>
        ) : carouselProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("hub.marketplaceNoCarousel", { defaultValue: "More items coming soon." })}</p>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 pt-0.5 sm:gap-4">
            {carouselProducts.map((p) => (
              <Link
                key={p.id}
                href={`/hub/checkout/${p.id}`}
                className="w-[9.5rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-orange-300/70 hover:shadow-md sm:w-[11rem]"
              >
                <div className="relative aspect-square w-full bg-muted">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                      {t("hub.noImage")}
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-2.5">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">{p.title}</p>
                  {p.pricing_type === "fixed" ? (
                    <p className="text-[11px] font-bold tabular-nums text-foreground">
                      {formatCardPrice(p.fixed_amount, p.fixed_currency)}
                    </p>
                  ) : (
                    <div className="text-[10px] text-muted-foreground">
                      {renderUserInputRangeLabel(
                        p.funded_min,
                        p.funded_max,
                        p.default_input_currency || p.fixed_currency || "USD",
                        t,
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("hub.marketplaceVendors", { defaultValue: "Stores" })}</h3>
        {loading && vendors.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("hub.marketplaceNoVendors", { defaultValue: "No stores yet — check back soon." })}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
            {vendors.map((v) => (
              <Link
                key={v.id}
                href={`/hub/${lineSlug}/v/${encodeURIComponent(v.slug)}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-orange-300/70 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-muted">
                  {v.photo_url ? (
                    <img
                      src={v.photo_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{v.name}</div>
                  )}
                </div>
                <div className="space-y-1 border-t border-border/60 bg-card/80 p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">{v.name}</p>
                  {v.short_bio ? <p className="line-clamp-2 text-xs text-muted-foreground">{v.short_bio}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
