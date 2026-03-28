"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppPageHeaderProps {
  title: string
  /** Used when browser history has no prior entry (e.g. opened in a new tab). Otherwise back uses history. */
  backHref?: string
  backLabel?: string
  className?: string
  trailing?: ReactNode
}

/**
 * Sticky app-style header for sub-pages (mobile-first; works on all breakpoints).
 * Back prefers the previous screen in history; falls back to `backHref` when that is not available.
 */
export function AppPageHeader({
  title,
  backHref,
  backLabel,
  className,
  trailing,
}: AppPageHeaderProps) {
  const { t } = useTranslation("app")
  const resolvedBackLabel = backLabel ?? t("layout.back")
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else if (backHref) {
      router.push(backHref)
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-background/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6",
        className,
      )}
    >
      {backHref ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 -ml-2 h-11 w-11"
          onClick={handleBack}
          aria-label={resolvedBackLabel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      ) : (
        <div className="w-11 shrink-0" aria-hidden />
      )}
      <h1 className="min-w-0 flex-1 line-clamp-2 break-words text-lg font-semibold leading-tight text-balance">
        {title}
      </h1>
      {trailing ? <div className="shrink-0">{trailing}</div> : <div className="w-11 shrink-0 sm:w-0" aria-hidden />}
    </header>
  )
}
