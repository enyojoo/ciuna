"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Layout mirrors `/send/[id]` (2+1 grid). Outer padding comes from the parent. */
export function TransactionDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 lg:col-span-2">
          <Card>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-48 max-w-full" />
                </div>
                <Skeleton className="h-6 w-28 rounded-full sm:shrink-0" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                  </div>
                ))}
              </div>

              <Skeleton className="h-11 w-full rounded-md sm:max-w-xs" />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="space-y-4 p-4 sm:p-6">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3 border-b border-gray-100 pb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
