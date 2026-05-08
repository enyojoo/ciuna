"use client"

import Link from "next/link"
import { BadgeDollarSign, MessageCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

/** Same controls as legacy dashboard / mobile Hub header (teal refer pill + support icon). */
export function HubReferSupportActions({ className }: { className?: string }) {
  const { t } = useTranslation("app")

  return (
    <div className={cn("flex min-w-0 items-center justify-end gap-1.5 sm:gap-2", className)}>
      <Link
        href="/more/referrals"
        className="inline-flex min-w-0 max-w-[min(100%,12rem)] items-center gap-1 rounded-full border border-teal-200/90 bg-gradient-to-r from-teal-50 to-emerald-50/90 px-2.5 py-1.5 text-xs font-semibold leading-tight text-teal-900 shadow-sm hover:from-teal-100 hover:to-emerald-50 sm:max-w-none sm:gap-1.5 sm:px-3 sm:text-sm"
      >
        <BadgeDollarSign className="h-3.5 w-3.5 shrink-0 text-teal-800" strokeWidth={2.25} aria-hidden />
        <span className="truncate">{t("dashboard.referEarn")}</span>
      </Link>
      <Link
        href="/support"
        className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
        aria-label={t("dashboard.supportAria")}
      >
        <MessageCircle className="h-6 w-6 text-gray-600" />
      </Link>
    </div>
  )
}
