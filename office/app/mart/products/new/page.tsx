"use client"

import { OfficeHubNewProductForm } from "@/components/hub/office-hub-new-product-form"
import { hubProductsPath } from "@/lib/hub-office-paths"

export default function OfficeMartNewProductPage() {
  return <OfficeHubNewProductForm backHref={hubProductsPath("mart")} />
}
