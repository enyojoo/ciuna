import { Suspense } from "react"
import { BookFallback } from "../book-fallback"
import { BookWizardEntry } from "../book-wizard-entry"

export default function ExpertsBookServicePage() {
  return (
    <Suspense fallback={<BookFallback />}>
      <BookWizardEntry />
    </Suspense>
  )
}
