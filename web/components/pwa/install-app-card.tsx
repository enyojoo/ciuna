"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

const DISMISS_KEY = "ciuna_pwa_install_dismissed"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return true
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true
  return false
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return (
    navigator.platform === "MacIntel" &&
    ((navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ?? 0) > 1
  )
}

export function InstallAppCard() {
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1")
    } catch {
      setDismissed(false)
    }
    setIos(isIos())
    setReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || dismissed || isStandalone()) return

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall)
  }, [dismissed])

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {}
    setDismissed(true)
  }, [])

  const handleInstall = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  if (!ready || dismissed || isStandalone()) return null

  return (
    <Card className="border-primary/25 bg-primary/5 overflow-hidden">
      <CardContent className="p-4 relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 text-muted-foreground"
          onClick={handleDismiss}
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
            {deferred ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Add Ciuna to your home screen for a full-screen app experience.
                </p>
                <Button type="button" size="sm" className="mt-1" onClick={handleInstall}>
                  Install app
                </Button>
              </>
            ) : ios ? (
              <p className="text-sm text-muted-foreground">
                Tap <span className="font-medium text-foreground">Share</span>, then{" "}
                <span className="font-medium text-foreground">Add to Home Screen</span> to open Ciuna
                without the browser bar.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Use your browser menu to <span className="font-medium text-foreground">Install</span> or{" "}
                <span className="font-medium text-foreground">Add to Home screen</span> when offered, for a
                full-screen app experience.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
