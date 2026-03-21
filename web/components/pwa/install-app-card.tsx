"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt"
import { PwaInstallBodyCopy } from "@/components/pwa/pwa-install-copy"

export function InstallAppCard() {
  const { visible, deferred, ios, android, dismiss, runInstall } = usePwaInstallPrompt()

  if (!visible) return null

  return (
    <Card className="border-primary/25 bg-primary/5 overflow-hidden">
      <CardContent className="p-4 relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 text-muted-foreground"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="pr-8 flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2 min-w-0">
            <p className="font-semibold text-foreground">Install Ciuna</p>
            <PwaInstallBodyCopy deferred={deferred} ios={ios} android={android} variant="default" />
            {deferred ? (
              <Button type="button" size="sm" className="mt-1" onClick={() => void runInstall()}>
                Install app
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
