/**
 * Single source of truth for Ciuna brand colors.
 * Do not add hex in components — extend tokens here or in resolveThemePalette.
 */
export const BRAND_PRIMARY = "#F97316" as const

export const brand = {
  primary: BRAND_PRIMARY,
  primaryHover: "#ea580c",
  primaryDeep: "#c2410c",
  primaryMuted: "oklch(0.92 0.08 55)",
  success: "oklch(0.55 0.15 150)",
  successSoft: "oklch(0.95 0.04 150)",
  warning: "oklch(0.75 0.15 85)",
  warningSoft: "oklch(0.97 0.04 85)",
  error: "oklch(0.577 0.245 27.325)",
  errorSoft: "oklch(0.95 0.04 27)",
} as const

export type Brand = typeof brand
