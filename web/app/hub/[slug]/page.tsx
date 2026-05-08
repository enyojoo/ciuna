"use client"

import { useParams } from "next/navigation"
import { HubServiceCatalogPage } from "@/components/hub/hub-service-catalog-page"

export default function HubServiceCatalogRoutePage() {
  const slug = String(useParams()?.slug || "").trim().toLowerCase()
  return <HubServiceCatalogPage slug={slug} />
}
