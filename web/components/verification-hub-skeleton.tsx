"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { useTranslation } from "react-i18next"

export function VerificationHubSkeleton() {
  const { t } = useTranslation("app")
  return (
    <div className="min-h-screen bg-gray-50">
      <AppPageHeader title={t("verification.hubTitle")} backHref="/more" />
      <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8 space-y-6">
        <Skeleton className="h-5 w-full max-w-lg" />
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <Card key={i} className="rounded-xl border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full max-w-sm" />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
