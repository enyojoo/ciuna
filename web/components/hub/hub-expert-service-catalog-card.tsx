"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HubExpertChipLight, type HubExpertChipSummary } from "@/components/hub/hub-expert-chip-light"
import { useAuth } from "@/lib/auth-context"
import { stashRedirectAfterLogin } from "@/lib/auth-login-redirect"
import { expertsBookPath, expertsProfilePath } from "@/lib/experts-public-paths"
import { cn } from "@/lib/utils"
import { formatCurrencySymbolOnly } from "@/utils/currency"

export type ExpertCatalogService = {
  id: string
  title: string
  short_description: string | null
  fulfillment_type?: string | null
  pricing_type: string
  hourly_rate: number | null
  hourly_currency: string | null
  fixed_amount: number | null
  fixed_currency: string | null
  package_label: string | null
  expert: HubExpertChipSummary
}

const serviceCardClass =
  "flex h-full flex-col rounded-2xl border border-gray-200 bg-white py-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:border-orange-300/70 motion-safe:hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)] dark:border-border dark:bg-card"

function priceLine(
  s: ExpertCatalogService,
  t: (k: string, o?: Record<string, string>) => string,
): string {
  if (s.pricing_type === "quote") return t("experts.bookingWizard.priceQuote")
  if (s.pricing_type === "hourly" && s.hourly_rate != null && s.hourly_currency)
    return `${formatCurrencySymbolOnly(Number(s.hourly_rate), s.hourly_currency)} / hr`
  if (s.pricing_type === "fixed" && s.fixed_amount != null && s.fixed_currency) {
    const amt = formatCurrencySymbolOnly(Number(s.fixed_amount), s.fixed_currency)
    return s.package_label ? `${amt} — ${s.package_label}` : amt
  }
  return t("experts.bookingWizard.priceDash")
}

function fulfillmentKindLabel(ft: string | null | undefined, t: (k: string, o?: Record<string, string>) => string): string {
  const f = ft || "online"
  if (f === "in_person") return t("experts.profile.fulfillmentInPerson")
  if (f === "both") return t("experts.profile.fulfillmentBoth")
  return t("experts.profile.fulfillmentOnline")
}

export function HubExpertServiceCatalogCard({ service: s }: { service: ExpertCatalogService }) {
  const { t } = useTranslation("app")
  const router = useRouter()
  const { user } = useAuth()
  const profileHref = expertsProfilePath(s.expert)
  const bookHref = expertsBookPath(s.expert, { service: s.id })

  const onGuestBookNav = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    stashRedirectAfterLogin(bookHref)
    router.push("/auth/login")
  }

  return (
    <Card className={cn(serviceCardClass, "h-full")}>
      <CardContent className="flex min-h-[11rem] flex-1 flex-col gap-2.5 p-3 sm:min-h-[12rem] sm:gap-3 sm:p-5">
        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
          <Link href={profileHref} prefetch className="block min-w-0">
            <p className="break-words text-base font-semibold leading-snug tracking-tight text-gray-900 transition-colors hover:text-orange-700 dark:text-foreground dark:hover:text-orange-300 sm:text-lg">
              {s.title}
            </p>
          </Link>
          {s.short_description ? (
            <p className="line-clamp-4 text-xs leading-relaxed text-gray-600 dark:text-muted-foreground sm:text-sm">{s.short_description}</p>
          ) : null}
          <div className="pt-0.5">
            <HubExpertChipLight
              expert={s.expert}
              className="max-w-full"
              verifiedAriaLabel={t("hub.expertVerified", { defaultValue: "Verified expert" })}
            />
          </div>
        </div>
        <p className="text-sm font-semibold tabular-nums text-orange-700 dark:text-orange-300 sm:text-base">{priceLine(s, t)}</p>
        <div className="mt-auto flex flex-col gap-2 pt-0.5">
          <Button asChild size="sm" className="h-9 w-full rounded-xl text-xs font-semibold sm:h-10 sm:text-sm">
            <Link href={user ? bookHref : "/auth/login"} prefetch={Boolean(user)} onClick={user ? undefined : onGuestBookNav}>
              {t("experts.profile.bookSession")}
            </Link>
          </Button>
          <p className="text-center text-[11px] leading-snug text-muted-foreground sm:text-xs">
            {t("experts.profile.fulfillmentHero", { value: fulfillmentKindLabel(s.fulfillment_type, t) })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
