"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

/** Shared with InstallAppCard and InstallAppBanner; one dismiss hides both (no TTL). */
export const PWA_INSTALL_DISMISS_KEY = "ciuna_pwa_install_dismissed"

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return true
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true
  return false
}

export function isIosBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return (
    navigator.platform === "MacIntel" &&
    ((navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ?? 0) > 1
  )
}

export function isAndroidBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android/i.test(navigator.userAgent)
}

/** Chrome on iOS reports `CriOS` in the user agent. */
export function isIosChromeBrowser(): boolean {
  if (typeof navigator === "undefined") return false
  if (!isIosBrowser()) return false
  return /CriOS/i.test(navigator.userAgent)
}

type PwaInstallValue = {
  ready: boolean
  deferred: BeforeInstallPromptEvent | null
  /** True when on iOS Chrome (Share → View more → Add to Home Screen). */
  iosChrome: boolean
  /** True when on iOS Safari / WebKit shell (⋯ → Share → View more → Add to Home Screen). */
  iosSafari: boolean
  android: boolean
  dismiss: () => void
  runInstall: () => Promise<void>
  visible: boolean
}

const PwaInstallContext = createContext<PwaInstallValue | null>(null)

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosChrome, setIosChrome] = useState(false)
  const [iosSafari, setIosSafari] = useState(false)
  const [android, setAndroid] = useState(false)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(PWA_INSTALL_DISMISS_KEY) === "1")
    } catch {
      setDismissed(false)
    }
    const chrome = isIosChromeBrowser()
    setIosChrome(chrome)
    setIosSafari(isIosBrowser() && !chrome)
    setAndroid(isAndroidBrowser())
    setReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || dismissed || isStandalonePwa()) return

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall)
  }, [dismissed])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(PWA_INSTALL_DISMISS_KEY, "1")
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }, [])

  const runInstall = useCallback(async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }, [deferred])

  const visible = ready && !dismissed && !isStandalonePwa()

  const value = useMemo(
    () => ({
      ready,
      deferred,
      iosChrome,
      iosSafari,
      android,
      dismiss,
      runInstall,
      visible,
    }),
    [ready, deferred, iosChrome, iosSafari, android, dismiss, runInstall, visible],
  )

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
}

export function usePwaInstallPrompt(): PwaInstallValue {
  const ctx = useContext(PwaInstallContext)
  if (!ctx) {
    throw new Error("usePwaInstallPrompt must be used within PwaInstallProvider")
  }
  return ctx
}
