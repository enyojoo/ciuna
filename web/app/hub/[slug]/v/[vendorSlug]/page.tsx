"use client"

import { useParams } from "next/navigation"
import { HubMarketplaceVendorStorefront } from "@/components/hub/hub-marketplace-vendor-storefront"

export default function HubVendorStorefrontRoutePage() {
  const params = useParams()
  const lineSlug = String(params?.slug || "").trim().toLowerCase()
  const vendorSlug = String(params?.vendorSlug || "").trim().toLowerCase()
  return <HubMarketplaceVendorStorefront key={`${lineSlug}:${vendorSlug}`} lineSlug={lineSlug} vendorSlug={vendorSlug} />
}
