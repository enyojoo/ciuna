"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { useTranslation } from "react-i18next"

export function ReferralsPageSkeleton() {
  const { t } = useTranslation("app")
  return (
    <div className="min-h-screen bg-gray-50">
      <AppPageHeader title={t("referrals.pageTitle")} backHref="/more" />
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-12 sm:pb-16 lg:px-8 lg:pb-10 space-y-6">
        <Skeleton className="h-5 w-full max-w-md" />

        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-teal-50/90 to-white">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Card>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-row gap-3">
          <Skeleton className="h-11 flex-1 rounded-md" />
          <Skeleton className="h-11 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  )
}
