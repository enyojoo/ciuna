"use client"

export const PWA_INSTALL_TITLE = "Ciuna App"
export const PWA_INSTALL_SUBTITLE = "Use our app on the go without browser"

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
    ? "text-xs text-muted-foreground leading-snug sm:text-sm line-clamp-2"
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
          </>
        ) : (
          <>
            Tap Share, then View more, then <span className="font-medium text-foreground">Add to Home Screen</span>
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
            <span className="font-medium text-foreground">Menu</span>
            {" → "}
            <span className="font-medium text-foreground">Share</span>
            {" → "}
            <span className="font-medium text-foreground">View more</span>
            {" → "}
            <span className="font-medium text-foreground">Add to Home Screen</span>
          </>
        ) : (
          <>
            Tap the menu (three dots), then Share, then View more, then{" "}
            <span className="font-medium text-foreground">Add to Home Screen</span>
          </>
        )}
      </p>
    )
  }

  return null
}
