"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt"
import {
  PWA_INSTALL_SUBTITLE,
  PWA_INSTALL_TITLE,
  PwaInstallIosGuide,
} from "@/components/pwa/pwa-install-copy"

/** Matches fixed notice height + safe area so content below is not covered (subtitle + optional iOS guide + actions). */
const BANNER_LAYOUT_RESERVE =
  "min-h-[calc(6.5rem+env(safe-area-inset-top,0px))] sm:min-h-[calc(6rem+env(safe-area-inset-top,0px))]"

/**
 * Global top notice for install / add-to-home-screen. Uses the same dismiss key and
 * `beforeinstallprompt` behavior as {@link InstallAppCard}. Hidden on `/more` where the card lives.
 */
export function InstallAppBanner() {
  const pathname = usePathname()
  const { visible, iosChrome, iosSafari, showInstallButton, dismiss, runInstall } = usePwaInstallPrompt()

  const onMore = pathname === "/more" || pathname?.startsWith("/more/")
  if (!visible || onMore) return null

  return (
    <>
      <div className={`shrink-0 ${BANNER_LAYOUT_RESERVE}`} aria-hidden />
      <div
        className="fixed left-0 right-0 top-0 z-[60] pt-[env(safe-area-inset-top,0px)] pointer-events-none"
        role="region"
        aria-label={PWA_INSTALL_TITLE}
      >
        <div className="pointer-events-auto mx-auto max-w-lg px-2 sm:max-w-xl sm:px-3">
          <div className="rounded-b-2xl border border-border bg-background/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/90">
            <div className="flex items-start gap-2 px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 sm:h-8 sm:w-8">
                <Download className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm font-semibold leading-tight text-foreground">{PWA_INSTALL_TITLE}</p>
                <p className="text-xs text-muted-foreground leading-snug sm:text-sm">{PWA_INSTALL_SUBTITLE}</p>
                <PwaInstallIosGuide iosChrome={iosChrome} iosSafari={iosSafari} variant="banner" />
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {showInstallButton ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 shrink-0 px-2.5 text-xs sm:h-8 sm:px-3 sm:text-sm"
                      onClick={() => void runInstall()}
                    >
                      Install
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0 px-2.5 text-xs sm:h-8 sm:px-3 sm:text-sm"
                    onClick={dismiss}
                  >
                    Not now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
