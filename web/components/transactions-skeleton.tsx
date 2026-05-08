"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Transactions list: grouped card + compact rows — use below standalone page header + search */
export function TransactionsListSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      {[1, 2].map((group) => (
        <div key={group}>
          <div className="mb-2.5 h-3 w-24 rounded bg-muted sm:h-3.5" />
          <Card className="overflow-hidden border-border/80 shadow-md">
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full sm:h-11 sm:w-11" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-[min(100%,14rem)]" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="shrink-0 space-y-2 text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                    <Skeleton className="ml-auto h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

export function TransactionsSkeleton() {
  return (
    <div className="space-y-0">
      {/* Header Skeleton */}
      <div className="bg-white p-5 sm:p-6 border-b border-gray-200">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-5 sm:p-6 pb-3 sm:pb-4">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>

      {/* Transactions List Skeleton */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
        <TransactionsListSkeleton />
      </div>
    </div>
  )
}

