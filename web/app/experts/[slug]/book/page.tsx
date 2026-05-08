import { Suspense } from "react"
import { redirect } from "next/navigation"
import { BookFallback } from "./book-fallback"
import { BookWizardEntry } from "./book-wizard-entry"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ service?: string; slot?: string }>
}

export default async function ExpertsBookPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const svc = typeof searchParams.service === "string" ? searchParams.service.trim() : ""
  if (svc) {
    const slot = typeof searchParams.slot === "string" ? searchParams.slot.trim() : ""
    const qs = new URLSearchParams()
    if (slot) qs.set("slot", slot)
    const q = qs.toString()
    redirect(`/experts/${encodeURIComponent(params.slug)}/book/${encodeURIComponent(svc)}${q ? `?${q}` : ""}`)
  }

  return (
    <Suspense fallback={<BookFallback />}>
      <BookWizardEntry />
    </Suspense>
  )
}
