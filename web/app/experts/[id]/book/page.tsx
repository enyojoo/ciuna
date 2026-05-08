import { Suspense } from "react"
import { ExpertBookingWizard } from "@/components/hub/expert-booking-wizard"

function BookFallback() {
  return (
    <div className="min-w-0 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-40 rounded-2xl bg-muted" />
      </div>
    </div>
  )
}

export default function ExpertsBookPage() {
  return (
    <Suspense fallback={<BookFallback />}>
      <ExpertBookingWizard />
    </Suspense>
  )
}
