"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt"
import { PwaInstallBodyCopy } from "@/components/pwa/pwa-install-copy"

const BANNER_LAYOUT_RESERVE =
  "min-h-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:min-h-[calc(4.75rem+env(safe-area-inset-top,0px))]"

/**
 * Global top notice for install / add-to-home-screen. Uses the same dismiss key and
 * `beforeinstallprompt` behavior as {@link InstallAppCard}. Hidden on `/more` where the card lives.
 */
export function InstallAppBanner() {
  const pathname = usePathname()
  const { visible, deferred, ios, android, dismiss, runInstall } = usePwaInstallPrompt()

  const onMore = pathname === "/more" || pathname?.startsWith("/more/")
  if (!visible || onMore) return null

  return (
    <>
      {/* Reserve space so fixed bar does not cover page content */}
      <div className={`shrink-0 ${BANNER_LAYOUT_RESERVE}`} aria-hidden />
      <div
        className="fixed left-0 right-0 top-0 z-[60] border-b border-border bg-background/95 pt-[env(safe-area-inset-top,0px)] shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90"
        role="region"
        aria-label="Install app"
      >
      <div className="mx-auto flex max-w-4xl items-start gap-2 px-3 py-2 sm:items-center sm:gap-3 sm:px-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 sm:mt-0">
          <Download className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-0">
          <p className="text-sm font-semibold leading-tight text-foreground">Install Ciuna</p>
          <div className="sm:inline sm:after:content-none">
            <PwaInstallBodyCopy deferred={deferred} ios={ios} android={android} variant="compact" />
          </div>
          {deferred ? (
            <div className="pt-1 sm:inline sm:pl-2 sm:pt-0">
              <Button type="button" size="sm" className="h-8 text-xs sm:h-9 sm:text-sm" onClick={() => void runInstall()}>
                Install app
              </Button>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          onClick={dismiss}
          aria-label="Dismiss install notice"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      </div>
    </>
  )
}
