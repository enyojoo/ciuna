"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function HubLinePageShell({
  title,
  subtitle,
  children,
  backToHubAriaLabel,
  className,
}: {
  title: string
  subtitle: string | null
  children: ReactNode
  /** Accessible label for the back link to `/hub` (e.g. translated “Back to Hub”). */
  backToHubAriaLabel: string
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
        <Card className="gap-0 overflow-hidden rounded-2xl border py-0 shadow-md">
          <CardContent className="space-y-0 p-0">
            <div className="relative isolate">
              <div className="rounded-t-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-5 pb-20 pt-4 text-white sm:px-6 sm:pb-24 sm:pt-5">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <Link
                    href="/hub"
                    aria-label={backToHubAriaLabel}
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/15 text-white ring-1 ring-white/25 transition hover:bg-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </Link>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h1 className="text-balance text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
                    {subtitle ? <p className="max-w-xl text-sm/6 text-orange-50 sm:text-base/7">{subtitle}</p> : null}
                  </div>
                </div>
              </div>
              <div className="relative z-10 -mt-12 bg-card px-4 pb-8 pt-3 sm:-mt-[4.25rem] sm:px-6 sm:pb-10 sm:pt-4">
                {children}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
