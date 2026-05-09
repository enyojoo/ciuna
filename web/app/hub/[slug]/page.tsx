"use client"

import { useParams } from "next/navigation"
import { HubMarketplaceLinePage } from "@/components/hub/hub-marketplace-line-page"
import { HubServiceCatalogPage } from "@/components/hub/hub-service-catalog-page"

export default function HubServiceCatalogRoutePage() {
  const slug = String(useParams()?.slug || "").trim().toLowerCase()
  if (slug === "food" || slug === "mart") {
    return <HubMarketplaceLinePage key={slug} lineSlug={slug} />
  }
  return <HubServiceCatalogPage key={slug} slug={slug} />
}
