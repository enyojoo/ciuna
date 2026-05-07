import type { ResolvedSemantic } from "./resolveThemePalette"

export interface SurfaceTokens {
  heroGradientStart: string
  heroGradientEnd: string
  glassBg: string
  glassBorder: string
}

/** Derived surfaces from semantic palette — no duplicated rgba strings in components */
export function resolveSurfaceTokens(semantic: ResolvedSemantic): SurfaceTokens {
  return {
    heroGradientStart: semantic.background,
    heroGradientEnd: semantic.muted,
    glassBg: "oklch(1 0 0 / 0.72)",
    glassBorder: "oklch(0.9 0 0 / 0.5)",
  }
}
