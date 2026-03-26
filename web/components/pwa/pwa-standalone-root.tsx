"use client"

import { useEffect } from "react"

/**
 * Sets `data-pwa-standalone` on `<html>` when the app runs as an installed PWA
 * (display-mode: standalone) or iOS home-screen (`navigator.standalone`).
 * Use in CSS: `html[data-pwa-standalone="true"]` for PWA-only tweaks.
 */
export function PwaStandaloneRoot() {
  useEffect(() => {
    const apply = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      document.documentElement.dataset.pwaStandalone = standalone ? "true" : "false"
    }
    apply()
    const mq = window.matchMedia("(display-mode: standalone)")
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg?.update())
      .catch(() => {})
  }, [])

  return null
}
