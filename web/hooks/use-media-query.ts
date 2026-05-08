"use client"

import { useSyncExternalStore } from "react"

/** Tailwind `lg` breakpoint; SSR falls back to `false`. */
export function useMediaQueryMinLg(): boolean {
  const query = "(min-width: 1024px)"
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", onStoreChange)
      return () => mq.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
