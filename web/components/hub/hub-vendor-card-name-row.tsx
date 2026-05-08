"use client"

import { BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"

/** Shared on marketplace store cards: name then small verified check (same icon size everywhere). */
export const HUB_VENDOR_CARD_VERIFIED_ICON_CLASS = "h-3 w-3 shrink-0 text-orange-600"

export function HubVendorCardNameRow({
  name,
  isVerified,
  verifiedAriaLabel,
  align = "center",
  textClassName,
}: {
  name: string
  isVerified?: boolean | null
  verifiedAriaLabel: string
  align?: "center" | "start"
  textClassName: string
}) {
  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-1 font-semibold leading-snug text-foreground",
        align === "center" ? "justify-center text-center" : "justify-start text-left",
        textClassName,
      )}
    >
      <span className="line-clamp-2 min-w-0">{name}</span>
      {isVerified ? (
        <BadgeCheck className={HUB_VENDOR_CARD_VERIFIED_ICON_CLASS} aria-label={verifiedAriaLabel} />
      ) : null}
    </p>
  )
}
