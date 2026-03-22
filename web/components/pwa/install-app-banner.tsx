"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt"
import {
  PWA_INSTALL_SUBTITLE,
  PWA_INSTALL_TITLE,
  PwaInstallIosGuide,
} from "@/components/pwa/pwa-install-copy"

/** Compact banner; extra room when iOS guide line is shown. */
const BANNER_LAYOUT_RESERVE =
  "min-h-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:min-h-[calc(5rem+env(safe-area-inset-top,0px))]"

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
          <div className="rounded-b-xl border border-border bg-background/95 px-2 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90 sm:px-2.5 sm:py-2">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 sm:h-8 sm:w-8">
                <Download className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-semibold leading-tight text-foreground">{PWA_INSTALL_TITLE}</p>
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                    {PWA_INSTALL_SUBTITLE}
                  </p>
                  {showInstallButton ? (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-6 shrink-0 rounded-full px-2.5 text-[11px] font-semibold shadow-none sm:h-7 sm:px-3 sm:text-xs"
                      onClick={() => void runInstall()}
                    >
                      Install
                    </Button>
                  ) : null}
                </div>
                <PwaInstallIosGuide iosChrome={iosChrome} iosSafari={iosSafari} variant="banner" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-mr-1 -mt-0.5 h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground sm:h-8 sm:w-8"
                onClick={dismiss}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
