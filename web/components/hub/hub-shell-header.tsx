"use client"

import Link from "next/link"
import { Gift, MessageCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"

export function HubShellHeader() {
  const { t } = useTranslation("app")

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/80 bg-background/95 py-3 sm:py-3.5">
      <BrandLogo size="lg" className="shrink-0" />
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button variant="outline" size="sm" className="h-9 rounded-full px-3 text-xs sm:text-sm" asChild>
          <Link href="/more/referrals" className="inline-flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="hidden sm:inline">{t("hub.referEarn")}</span>
            <span className="sm:hidden">{t("hub.referEarnShort")}</span>
          </Link>
        </Button>
        <Button variant="default" size="sm" className="h-9 rounded-full px-3 text-xs sm:text-sm" asChild>
          <Link href="/support" className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t("hub.chatSupport")}
          </Link>
        </Button>
      </div>
    </header>
  )
}
