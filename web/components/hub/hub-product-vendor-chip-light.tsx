"use client"

import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import type { HubProductVendorSummary } from "@/lib/hub-types"
import { hubMarketplaceVendorPath, isHubMarketplaceLineSlug } from "@/lib/hub-public-paths"
import { cn } from "@/lib/utils"

/** Vendor row: small logo + name + optional verified (brand orange check). */
export function HubProductVendorChipLight({
  vendor,
  className,
  tone = "default",
}: {
  vendor: HubProductVendorSummary
  className?: string
  /** `onGradient`: white text for orange hero / checkout product header. */
  tone?: "default" | "onGradient"
}) {
  const line = String(vendor.service_line_slug || "").trim().toLowerCase()
  const slug = String(vendor.slug || "").trim()
  if (!line || !slug) return null

  const href = isHubMarketplaceLineSlug(line)
    ? hubMarketplaceVendorPath(line, slug)
    : `/hub/${encodeURIComponent(line)}/v/${encodeURIComponent(slug)}`

  const onGradient = tone === "onGradient"

  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded-sm py-0.5 transition",
        onGradient
          ? "text-white hover:text-orange-50"
          : "text-gray-900 hover:text-orange-700",
        className,
      )}
    >
      <span
        className={cn(
          "relative h-5 w-5 shrink-0 overflow-hidden rounded-full sm:h-6 sm:w-6",
          onGradient ? "bg-white/20" : "bg-muted",
        )}
      >
        {vendor.photo_url ? (
          <img src={vendor.photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center text-[10px] font-semibold sm:text-xs",
              onGradient ? "text-white/90" : "text-muted-foreground",
            )}
          >
            {((vendor.name || "").trim().charAt(0) || "?").toUpperCase()}
          </span>
        )}
      </span>
      <span className="min-w-0 truncate text-[11px] font-medium sm:text-xs">{vendor.name}</span>
      {vendor.is_verified ? (
        <BadgeCheck
          className={cn(
            "h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4",
            onGradient ? "text-orange-200" : "text-orange-600",
          )}
          aria-label="Verified vendor"
        />
      ) : null}
    </Link>
  )
}
