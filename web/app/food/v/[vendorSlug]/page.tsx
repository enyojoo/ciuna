"use client"

import { useParams } from "next/navigation"
import { HubMarketplaceVendorStorefront } from "@/components/hub/hub-marketplace-vendor-storefront"

export default function FoodVendorStorefrontPage() {
  const vendorSlug = String(useParams()?.vendorSlug || "").trim().toLowerCase()
  return <HubMarketplaceVendorStorefront key={vendorSlug || "_"} lineSlug="food" vendorSlug={vendorSlug} />
}
