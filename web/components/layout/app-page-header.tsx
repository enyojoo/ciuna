"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppPageHeaderProps {
  title: string
  /** If omitted, no back control is shown */
  backHref?: string
  backLabel?: string
  className?: string
  trailing?: ReactNode
}

/**
 * Sticky app-style header for sub-pages (mobile-first; works on all breakpoints).
 */
export function AppPageHeader({
  title,
  backHref,
  backLabel = "Back",
  className,
  trailing,
}: AppPageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-background/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6",
        className,
      )}
    >
      {backHref ? (
        <Button variant="ghost" size="icon" className="shrink-0 -ml-2 h-11 w-11" asChild>
          <Link href={backHref} aria-label={backLabel}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      ) : (
        <div className="w-11 shrink-0" aria-hidden />
      )}
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight">{title}</h1>
      {trailing ? <div className="shrink-0">{trailing}</div> : <div className="w-11 shrink-0 sm:w-0" aria-hidden />}
    </header>
  )
}
