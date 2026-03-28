"use client"

import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation("app")
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
            <span className="font-medium text-foreground">{t("pwa.share")}</span>
            {" → "}
            <span className="font-medium text-foreground">{t("pwa.viewMore")}</span>
            {" → "}
            <span className="font-medium text-foreground">{t("pwa.addHome")}</span>
          </>
        ) : (
          <>
            {t("pwa.iosChromeLong", {
              addHome: t("pwa.addHome"),
            })}
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
            <span className="font-medium text-foreground">{t("pwa.menu")}</span>
            {" → "}
            <span className="font-medium text-foreground">{t("pwa.share")}</span>
            {" → "}
            <span className="font-medium text-foreground">{t("pwa.viewMore")}</span>
            {" → "}
            <span className="font-medium text-foreground">{t("pwa.addHome")}</span>
          </>
        ) : (
          <>
            {t("pwa.iosSafariLong", {
              addHome: t("pwa.addHome"),
            })}
          </>
        )}
      </p>
    )
  }

  return null
}
