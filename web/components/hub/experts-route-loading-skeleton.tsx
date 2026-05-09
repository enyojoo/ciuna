/** Shared pulse for experts layout Suspense, checkout redirects, and book fallback — consistent entry motion. */
export function ExpertsRouteLoadingSkeleton() {
  return (
    <div className="min-w-0 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-40 rounded-2xl bg-muted" />
      </div>
    </div>
  )
}
