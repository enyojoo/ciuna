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

/** Shared with InstallAppCard and InstallAppBanner; one dismiss hides both for 1 hour. */
export const PWA_INSTALL_DISMISS_KEY = "ciuna_pwa_install_dismissed"

/** When `beforeinstallprompt` is missing, tap still explains how to install from the browser menu. */
const ANDROID_INSTALL_FALLBACK_MSG =
  "If no install dialog appears, open the browser menu (⋮) and choose Install app or Add to Home screen."

const DESKTOP_INSTALL_FALLBACK_MSG =
  "If no install dialog appears, use the install icon in the address bar, or open the browser menu (⋮) and choose Install app or Install Ciuna."

const PWA_INSTALL_DISMISS_MS = 60 * 60 * 1000

function readDismissedAt(): number | null {
  if (typeof window === "undefined") return null
  try {
    const v = localStorage.getItem(PWA_INSTALL_DISMISS_KEY)
    if (v == null) return null
    if (v === "1") {
      localStorage.removeItem(PWA_INSTALL_DISMISS_KEY)
      return null
    }
    const t = Number(v)
    if (!Number.isFinite(t) || t <= 0) return null
    if (Date.now() >= t + PWA_INSTALL_DISMISS_MS) {
      localStorage.removeItem(PWA_INSTALL_DISMISS_KEY)
      return null
    }
    return t
  } catch {
    return null
  }
}

function isDismissWindowActive(dismissedAt: number | null): boolean {
  if (dismissedAt === null) return false
  return Date.now() < dismissedAt + PWA_INSTALL_DISMISS_MS
}

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
  /** Install app button: Android + desktop (non-iOS). iOS uses instructions only. */
  showInstallButton: boolean
  dismiss: () => void
  runInstall: () => Promise<void>
  visible: boolean
}

const PwaInstallContext = createContext<PwaInstallValue | null>(null)

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosChrome, setIosChrome] = useState(false)
  const [iosSafari, setIosSafari] = useState(false)
  const [android, setAndroid] = useState(false)

  useEffect(() => {
    setDismissedAt(readDismissedAt())
    const chrome = isIosChromeBrowser()
    setIosChrome(chrome)
    setIosSafari(isIosBrowser() && !chrome)
    setAndroid(isAndroidBrowser())
    setReady(true)
  }, [])

  useEffect(() => {
    if (dismissedAt === null) return
    const expireIfNeeded = () => {
      if (Date.now() >= dismissedAt + PWA_INSTALL_DISMISS_MS) {
        setDismissedAt(null)
        try {
          localStorage.removeItem(PWA_INSTALL_DISMISS_KEY)
        } catch {
          /* ignore */
        }
      }
    }
    expireIfNeeded()
    const id = window.setInterval(expireIfNeeded, 30_000)
    return () => window.clearInterval(id)
  }, [dismissedAt])

  const dismissed = isDismissWindowActive(dismissedAt)

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
    const t = Date.now()
    try {
      localStorage.setItem(PWA_INSTALL_DISMISS_KEY, String(t))
    } catch {
      /* ignore */
    }
    setDismissedAt(t)
  }, [])

  const runInstall = useCallback(async () => {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
      return
    }
    if (typeof window === "undefined") return
    if (android) {
      window.alert(ANDROID_INSTALL_FALLBACK_MSG)
      return
    }
    if (!isIosBrowser()) {
      window.alert(DESKTOP_INSTALL_FALLBACK_MSG)
    }
  }, [deferred, android])

  const visible = ready && !dismissed && !isStandalonePwa()

  const showInstallButton =
    ready &&
    typeof navigator !== "undefined" &&
    !isIosBrowser()

  const value = useMemo(
    () => ({
      ready,
      deferred,
      iosChrome,
      iosSafari,
      android,
      showInstallButton,
      dismiss,
      runInstall,
      visible,
    }),
    [ready, deferred, iosChrome, iosSafari, android, showInstallButton, dismiss, runInstall, visible],
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
