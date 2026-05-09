"use client"

import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { HubMarketplaceLineHome } from "@/components/hub/hub-marketplace-line-home"
import { useHubMarketplaceLineData } from "@/hooks/use-hub-marketplace-line-data"

const LINE_SLUG = "mart" as const

function MartLinePageInner() {
  const { t } = useTranslation("app")
  const { line, linesLoaded, products, vendors, loadingProducts, loadingVendors } =
    useHubMarketplaceLineData(LINE_SLUG)

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

function MartLinePageFallback() {
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

export default function MartLinePage() {
  return (
    <Suspense fallback={<MartLinePageFallback />}>
      <MartLinePageInner />
    </Suspense>
  )
}
