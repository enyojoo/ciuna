"use client"

import { MoreVertical, Share2 } from "lucide-react"

export const PWA_INSTALL_TITLE = "Ciuna App"
export const PWA_INSTALL_SUBTITLE = "Use our app on the go without the browser"

export type PwaInstallCopyVariant = "banner" | "card"

type Props = {
  iosChrome: boolean
  iosSafari: boolean
  /** `banner` = short top notice; `card` = More page detail. */
  variant?: PwaInstallCopyVariant | "default" | "compact"
}

function resolveVariant(variant: Props["variant"]): PwaInstallCopyVariant {
  if (variant === "compact" || variant === "banner") return "banner"
  return "card"
}

/** Step-by-step Add to Home Screen instructions for iOS Safari vs Chrome. Returns null off-iOS. */
export function PwaInstallIosGuide({ iosChrome, iosSafari, variant = "card" }: Props) {
  const tier = resolveVariant(variant)
  const banner = tier === "banner"

  const bodyClass = banner
    ? "text-xs text-muted-foreground leading-snug sm:text-sm line-clamp-3"
    : "text-sm text-muted-foreground leading-relaxed"

  if (iosChrome) {
    return (
      <p className={bodyClass}>
        {banner ? (
          <>
            <span className="font-medium text-foreground">Share</span>
            {" → "}
            <span className="font-medium text-foreground">View more</span>
            {" → "}
            <span className="font-medium text-foreground">Add to Home Screen</span>
            {"."}
          </>
        ) : (
          <>
            Tap{" "}
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <Share2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Share
            </span>
            , then <span className="font-medium text-foreground">View more</span>, then{" "}
            <span className="font-medium text-foreground">Add to Home Screen</span> to open Ciuna without the
            browser bar.
          </>
        )}
      </p>
    )
  }

  if (iosSafari) {
    return (
      <p className={bodyClass}>
        {banner ? (
          <>
            <span className="font-medium text-foreground">⋯</span>
            {" → "}
            <span className="font-medium text-foreground">Share</span>
            {" → "}
            <span className="font-medium text-foreground">View more</span>
            {" → "}
            <span className="font-medium text-foreground">Add to Home Screen</span>
            {"."}
          </>
        ) : (
          <>
            Tap the{" "}
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <MoreVertical className="h-3.5 w-3.5 shrink-0" aria-hidden />
              menu
            </span>{" "}
            (three dots), then{" "}
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <Share2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Share
            </span>
            , then <span className="font-medium text-foreground">View more</span>, then{" "}
            <span className="font-medium text-foreground">Add to Home Screen</span> to open Ciuna without the
            browser bar.
          </>
        )}
      </p>
    )
  }

  return null
}
