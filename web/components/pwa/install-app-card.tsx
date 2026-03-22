"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt"
import {
  PWA_INSTALL_SUBTITLE,
  PWA_INSTALL_TITLE,
  PwaInstallIosGuide,
} from "@/components/pwa/pwa-install-copy"

export function InstallAppCard() {
  const { visible, iosChrome, iosSafari, showInstallButton, dismiss, runInstall } = usePwaInstallPrompt()

  if (!visible) return null

  return (
    <Card className="border-primary/25 bg-primary/5 overflow-hidden">
      <CardContent className="relative p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-semibold leading-tight text-foreground">{PWA_INSTALL_TITLE}</p>
            <p className="text-sm text-muted-foreground leading-snug">{PWA_INSTALL_SUBTITLE}</p>
            <PwaInstallIosGuide iosChrome={iosChrome} iosSafari={iosSafari} variant="card" />
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {showInstallButton ? (
                <Button type="button" size="sm" className="w-fit" onClick={() => void runInstall()}>
                  Install
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
