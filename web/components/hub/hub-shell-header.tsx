"use client"

import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"
import { HubReferSupportActions } from "@/components/hub/hub-refer-support-actions"

/**
 * Mobile / tablet only (`lg:hidden`): legacy dashboard strip with logo + actions.
 * On `lg+`, logo lives in the sidebar and actions sit in `UserDashboardLayout` top bar.
 */
export function HubShellHeader() {
  return (
    <div className="mb-5 bg-card px-4 py-4 sm:mb-6 sm:p-6 lg:hidden">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
        <Link href="/hub" className="inline-flex shrink-0 items-center" aria-label="Ciuna">
          <BrandLogo size="sm" className="h-7 sm:h-8" />
        </Link>
        <HubReferSupportActions className="min-w-0 flex-1" />
      </div>
    </div>
  )
}
