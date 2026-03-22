"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt"
import { PwaInstallBodyCopy } from "@/components/pwa/pwa-install-copy"

export function InstallAppCard() {
  const { visible, deferred, iosChrome, iosSafari, android, showInstallButton, dismiss, runInstall } =
    usePwaInstallPrompt()

  if (!visible) return null

  return (
    <Card className="border-primary/25 bg-primary/5 overflow-hidden">
      <CardContent className="relative p-3 sm:p-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1.5 top-1.5 h-8 w-8 text-muted-foreground sm:right-2 sm:top-2"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-semibold leading-tight text-foreground">Install Ciuna</p>
            <PwaInstallBodyCopy
              deferred={deferred}
              iosChrome={iosChrome}
              iosSafari={iosSafari}
              android={android}
              variant="card"
            />
            {showInstallButton ? (
              <Button type="button" size="sm" className="mt-0.5 w-fit" onClick={() => void runInstall()}>
                Install app
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
