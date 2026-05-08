"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { expertsProfilePath } from "@/lib/experts-public-paths"
import { cn } from "@/lib/utils"

export type ExpertCatalogProfile = {
  id: string
  slug?: string | null
  display_name: string
  headline: string | null
  image_url?: string | null
  pricing_hint?: string | null
}

const cardClass =
  "group h-full gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white py-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:border-orange-300/70 motion-safe:hover:shadow-[0_18px_36px_rgba(15,23,42,0.14)] dark:border-border dark:bg-card"

export function HubExpertCatalogCard({
  expert: ex,
  className,
}: {
  expert: ExpertCatalogProfile
  className?: string
}) {
  return (
    <Link href={expertsProfilePath(ex)} className={cn("block min-w-0", className)}>
      <Card className={cn(cardClass, "h-full")}>
        <CardContent className="flex h-full flex-col p-0">
          <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-muted">
            {ex.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ex.image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold text-white">
                {ex.display_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 px-2.5 pb-3 pt-2 sm:px-3">
            <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-orange-700 dark:text-foreground dark:group-hover:text-orange-300 sm:text-sm">
              {ex.display_name}
            </p>
            {ex.pricing_hint ? (
              <p className="line-clamp-1 text-xs font-medium text-orange-700 dark:text-orange-300">{ex.pricing_hint}</p>
            ) : null}
            {ex.headline ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-muted-foreground">{ex.headline}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/** Narrow strip card for the Featured horizontal row (mart store chip style). */
export function HubExpertCatalogFeaturedChip({ expert: ex }: { expert: ExpertCatalogProfile }) {
  return (
    <Link
      href={expertsProfilePath(ex)}
      className="w-[7.5rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-orange-300/70 hover:shadow-md sm:w-[8.5rem]"
    >
      <div className="relative aspect-square w-full bg-muted">
        {ex.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ex.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-white">
            {ex.display_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="border-t border-border/60 p-2">
        <p className="line-clamp-2 text-center text-xs font-medium leading-snug text-foreground">{ex.display_name}</p>
      </div>
    </Link>
  )
}
