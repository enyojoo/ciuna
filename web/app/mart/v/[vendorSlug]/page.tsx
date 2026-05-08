"use client"

import { useParams } from "next/navigation"
import { HubMarketplaceVendorStorefront } from "@/components/hub/hub-marketplace-vendor-storefront"

export default function MartVendorStorefrontPage() {
  const vendorSlug = String(useParams()?.vendorSlug || "").trim().toLowerCase()
  return <HubMarketplaceVendorStorefront key={vendorSlug || "_"} lineSlug="mart" vendorSlug={vendorSlug} />
}
