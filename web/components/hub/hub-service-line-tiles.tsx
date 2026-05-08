"use client"

import Link from "next/link"
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
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
      {lines.map((line) => {
        const href = lineHref(line)
        const inner = (
          <Card className="h-full border border-gray-200 bg-white shadow-sm transition-colors hover:border-primary/40 hover:shadow-md">
            <CardContent className="flex min-h-[6.75rem] flex-col items-center justify-center gap-1.5 px-3 py-3 text-center sm:min-h-[8.5rem] sm:gap-2 sm:px-4 sm:py-4 md:min-h-[9.5rem] md:gap-2 md:px-5 md:py-5">
              {line.icon_url ? (
                <img
                  src={line.icon_url}
                  alt=""
                  className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 md:h-16 md:w-16"
                />
              ) : null}
              <h3 className="line-clamp-2 w-full text-xs font-semibold leading-tight text-gray-900 sm:text-sm sm:leading-snug md:text-base">
                {line.title}
              </h3>
              {line.short_description ? (
                <p className="line-clamp-2 w-full text-xs leading-snug text-muted-foreground sm:line-clamp-3 sm:text-sm sm:leading-relaxed md:line-clamp-4">
                  {line.short_description}
                </p>
              ) : null}
            </CardContent>
          </Card>
        )

        if (!href) {
          return <div key={line.id}>{inner}</div>
        }

        if (line.grid_kind === "external_url") {
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
