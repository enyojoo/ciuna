"use client"

import { useParams } from "next/navigation"
import { HubMarketplaceStoresDirectory } from "@/components/hub/hub-marketplace-stores-directory"

export default function HubLineStoresDirectoryRoutePage() {
  const slug = String(useParams()?.slug || "").trim().toLowerCase()
  return <HubMarketplaceStoresDirectory lineSlug={slug} />
}
