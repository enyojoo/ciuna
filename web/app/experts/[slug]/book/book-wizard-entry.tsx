"use client"

import { useParams, useSearchParams } from "next/navigation"
import { ExpertBookingWizard } from "@/components/hub/expert-booking-wizard"

/** Remount when slug, path service id, legacy query service, or slot deep link changes. */
export function BookWizardEntry() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = String(params?.slug ?? "").trim()
  const serviceId = String((params as { serviceId?: string }).serviceId ?? "").trim()
  const legacyService = (searchParams.get("service") ?? "").trim()
  const slot = (searchParams.get("slot") ?? "").trim()
  return <ExpertBookingWizard key={`${slug}:${serviceId || legacyService}:${slot}`} />
}
