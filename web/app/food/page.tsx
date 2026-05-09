"use client"

import { Suspense, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import type { HubProductRow } from "@/lib/hub-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import { sortHubCatalogProducts } from "@/lib/hub-catalog-utils"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { HubMarketplaceLineHome } from "@/components/hub/hub-marketplace-line-home"

const LINE_SLUG = "food" as const

function FoodLinePageInner() {
  const { t } = useTranslation("app")

  const [line, setLine] = useState<HubServiceLineRow | null>(null)
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [vendors, setVendors] = useState<HubVendorRow[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingVendors, setLoadingVendors] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("lines")
        const data = await res.json()
        const list = (data.serviceLines || []) as HubServiceLineRow[]
        if (cancelled) return
        const found = list.find((l) => l.slug === LINE_SLUG) ?? null
        setLine(found)
      } catch {
        if (!cancelled) setLine(null)
      } finally {
        if (!cancelled) setLinesLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingProducts(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/hub/products?service_line=${LINE_SLUG}`, { cache: "no-store" })
        if (!res.ok) throw new Error("products")
        const data = await res.json()
        const list = sortHubCatalogProducts((data.products || []) as HubProductRow[])
        if (!cancelled) setProducts(list)
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingVendors(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/hub/vendors?service_line=${LINE_SLUG}`, { cache: "no-store" })
        if (!res.ok) throw new Error("vendors")
        const data = await res.json()
        const next = (data.vendors || []) as HubVendorRow[]
        if (!cancelled) setVendors(next)
      } catch {
        if (!cancelled) setVendors([])
      } finally {
        if (!cancelled) setLoadingVendors(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
        lineSlug={LINE_SLUG}
        vendors={vendors}
        allProducts={products}
        loadingVendors={loadingVendors}
        loadingProducts={loadingProducts}
      />
    </HubLinePageShell>
  )
}

function FoodLinePageFallback() {
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

export default function FoodLinePage() {
  return (
    <Suspense fallback={<FoodLinePageFallback />}>
      <FoodLinePageInner />
    </Suspense>
  )
}
