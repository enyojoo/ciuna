"use client"

import { MoreVertical, Share2 } from "lucide-react"
import type { BeforeInstallPromptEvent } from "@/hooks/use-pwa-install-prompt"

type Props = {
  deferred: BeforeInstallPromptEvent | null
  ios: boolean
  android: boolean
  /** compact = one-line banner; default = card paragraphs */
  variant?: "default" | "compact"
}

export function PwaInstallBodyCopy({ deferred, ios, android, variant = "default" }: Props) {
  const compact = variant === "compact"

  if (deferred) {
    return (
      <p className={compact ? "text-xs text-muted-foreground sm:text-sm" : "text-sm text-muted-foreground"}>
        Add Ciuna to your home screen for a full-screen app experience.
      </p>
    )
  }

  if (ios) {
    return (
      <p
        className={
          compact
            ? "text-xs text-muted-foreground leading-snug sm:text-sm"
            : "text-sm text-muted-foreground leading-relaxed"
        }
      >
        Tap{" "}
        <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
          <Share2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
          Share
        </span>
        , then{" "}
        <span className="font-medium text-foreground">Add to Home Screen</span>
        {!compact ? " to open Ciuna without the browser bar." : "."}
      </p>
    )
  }

  if (android) {
    return (
      <p
        className={
          compact
            ? "text-xs text-muted-foreground leading-snug sm:text-sm"
            : "text-sm text-muted-foreground leading-relaxed"
        }
      >
        Tap the{" "}
        <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
          <MoreVertical className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
          menu
        </span>{" "}
        (three dots), scroll if needed, then{" "}
        <span className="font-medium text-foreground">Add to Home screen</span> or{" "}
        <span className="font-medium text-foreground">Install app</span>.
      </p>
    )
  }

  return (
    <p className={compact ? "text-xs text-muted-foreground sm:text-sm" : "text-sm text-muted-foreground"}>
      Use your browser menu to <span className="font-medium text-foreground">Install</span> or{" "}
      <span className="font-medium text-foreground">Add to Home screen</span> when offered.
    </p>
  )
}
