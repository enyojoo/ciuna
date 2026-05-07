"use client"

import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"

function lineHref(line: HubServiceLineRow): string | null {
  if (line.grid_kind === "external_url") return line.href?.trim() || null
  const p = line.route_path?.trim()
  if (p) return p
  if (line.grid_kind === "hub_category") return `/hub/${line.slug}`
  return null
}

export function HubServiceLineTiles({ lines }: { lines: HubServiceLineRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {lines.map((line) => {
        const href = lineHref(line)
        const external = line.grid_kind === "external_url"
        const inner = (
          <Card className="h-full overflow-hidden border border-gray-200 bg-white shadow-sm transition-colors hover:border-primary/40 hover:shadow-md">
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">{line.title}</h3>
                  {external ? (
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                </div>
                {line.short_description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{line.short_description}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )

        if (!href) {
          return <div key={line.id}>{inner}</div>
        }

        if (external) {
          return (
            <a key={line.id} href={href} target="_blank" rel="noopener noreferrer" className="block min-h-[44px]">
              {inner}
            </a>
          )
        }

        return (
          <Link key={line.id} href={href} prefetch className="block min-h-[44px]">
            {inner}
          </Link>
        )
      })}
    </div>
  )
}
