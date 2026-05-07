"use client"

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react"
import { resolveThemeCssVars, resolveSurfaceTokens, resolveSemanticLight } from "@/theme"

const ThemeColorsContext = createContext<ReturnType<typeof resolveSemanticLight> | null>(null)

export function useThemeColors() {
  const ctx = useContext(ThemeColorsContext)
  if (!ctx) {
    throw new Error("useThemeColors must be used within ThemeProvider")
  }
  return ctx
}

/** Applies light-theme CSS variables to document root once (no dark mode / no toggle). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const semantic = useMemo(() => resolveSemanticLight(), [])
  const surfaces = useMemo(() => resolveSurfaceTokens(semantic), [semantic])

  useEffect(() => {
    const root = document.documentElement
    const vars = resolveThemeCssVars()
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value)
    }
    root.style.setProperty("--surface-hero-start", surfaces.heroGradientStart)
    root.style.setProperty("--surface-hero-end", surfaces.heroGradientEnd)
    root.style.setProperty("--glass-bg", surfaces.glassBg)
    root.style.setProperty("--glass-border", surfaces.glassBorder)
  }, [surfaces])

  return <ThemeColorsContext.Provider value={semantic}>{children}</ThemeColorsContext.Provider>
}
