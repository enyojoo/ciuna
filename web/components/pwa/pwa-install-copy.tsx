"use client"

import { MoreVertical, Share2 } from "lucide-react"
import type { BeforeInstallPromptEvent } from "@/hooks/use-pwa-install-prompt"

export type PwaInstallCopyVariant = "banner" | "card"

type Props = {
  deferred: BeforeInstallPromptEvent | null
  iosChrome: boolean
  iosSafari: boolean
  android: boolean
  /** `banner` = short top notice; `card` = More page detail. Legacy: `compact` → banner, `default` → card. */
  variant?: PwaInstallCopyVariant | "default" | "compact"
}

function resolveVariant(variant: Props["variant"]): PwaInstallCopyVariant {
  if (variant === "compact" || variant === "banner") return "banner"
  return "card"
}

export function PwaInstallBodyCopy({
  deferred,
  iosChrome,
  iosSafari,
  android,
  variant = "card",
}: Props) {
  const tier = resolveVariant(variant)
  const banner = tier === "banner"

  const bodyClass = banner
    ? "text-xs text-muted-foreground leading-snug sm:text-sm line-clamp-2"
    : "text-sm text-muted-foreground leading-relaxed"

  if (deferred) {
    return (
      <p className={bodyClass}>
        {banner
          ? "Tap Install — or add Ciuna to your home screen for a full-screen app."
          : "Add Ciuna to your home screen for a full-screen app experience."}
      </p>
    )
  }

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

  if (android) {
    return (
      <p className={bodyClass}>
        {banner ? (
          <>
            Menu{" "}
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <MoreVertical className="h-3 w-3 shrink-0" aria-hidden />
            </span>
            {" → "}
            <span className="font-medium text-foreground">Add to Home screen</span>
            {" or "}
            <span className="font-medium text-foreground">Install app</span>
            {"."}
          </>
        ) : (
          <>
            Tap the{" "}
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <MoreVertical className="h-3.5 w-3.5 shrink-0" aria-hidden />
              menu
            </span>{" "}
            (three dots), scroll if needed, then{" "}
            <span className="font-medium text-foreground">Add to Home screen</span> or{" "}
            <span className="font-medium text-foreground">Install app</span>.
          </>
        )}
      </p>
    )
  }

  return (
    <p className={bodyClass}>
      {banner
        ? "Use your browser menu to install or add to home screen when offered."
        : "Use your browser menu to Install or Add to Home screen when offered."}
    </p>
  )
}
