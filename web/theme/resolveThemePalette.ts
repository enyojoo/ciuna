import { brand } from "./brand"

/** Flat CSS variable map for :root (light only) */
export type CssVarMap = Record<string, string>

export interface ResolvedSemantic {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  sidebar: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarAccentForeground: string
  sidebarBorder: string
  sidebarRing: string
  statusPending: string
  statusProcessing: string
  statusCompleted: string
  statusFailed: string
  statusCancelled: string
}

export function resolveSemanticLight(): ResolvedSemantic {
  return {
    background: "oklch(0.99 0 0)",
    foreground: "oklch(0.15 0 0)",
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.15 0 0)",
    popover: "oklch(1 0 0)",
    popoverForeground: "oklch(0.15 0 0)",
    primary: brand.primary,
    primaryForeground: "oklch(1 0 0)",
    secondary: "oklch(0.96 0 0)",
    secondaryForeground: "oklch(0.15 0 0)",
    muted: "oklch(0.96 0 0)",
    mutedForeground: "oklch(0.5 0 0)",
    accent: "oklch(0.96 0 0)",
    accentForeground: "oklch(0.15 0 0)",
    destructive: brand.error,
    destructiveForeground: "oklch(1 0 0)",
    border: "oklch(0.93 0 0)",
    input: "oklch(0.93 0 0)",
    ring: brand.primary,
    chart1: brand.primary,
    chart2: "oklch(0.6 0.15 180)",
    chart3: "oklch(0.65 0.2 140)",
    chart4: "oklch(0.7 0.15 80)",
    chart5: "oklch(0.55 0.18 300)",
    sidebar: "oklch(0.98 0 0)",
    sidebarForeground: "oklch(0.15 0 0)",
    sidebarPrimary: brand.primary,
    sidebarPrimaryForeground: "oklch(1 0 0)",
    sidebarAccent: "oklch(0.96 0 0)",
    sidebarAccentForeground: "oklch(0.15 0 0)",
    sidebarBorder: "oklch(0.93 0 0)",
    sidebarRing: brand.primary,
    statusPending: "oklch(0.65 0.12 85)",
    statusProcessing: "oklch(0.55 0.12 250)",
    statusCompleted: brand.success,
    statusFailed: brand.error,
    statusCancelled: "oklch(0.55 0 0)",
  }
}

function semanticToCssVars(s: ResolvedSemantic): CssVarMap {
  return {
    "--background": s.background,
    "--foreground": s.foreground,
    "--card": s.card,
    "--card-foreground": s.cardForeground,
    "--popover": s.popover,
    "--popover-foreground": s.popoverForeground,
    "--primary": s.primary,
    "--primary-foreground": s.primaryForeground,
    "--secondary": s.secondary,
    "--secondary-foreground": s.secondaryForeground,
    "--muted": s.muted,
    "--muted-foreground": s.mutedForeground,
    "--accent": s.accent,
    "--accent-foreground": s.accentForeground,
    "--destructive": s.destructive,
    "--destructive-foreground": s.destructiveForeground,
    "--border": s.border,
    "--input": s.input,
    "--ring": s.ring,
    "--chart-1": s.chart1,
    "--chart-2": s.chart2,
    "--chart-3": s.chart3,
    "--chart-4": s.chart4,
    "--chart-5": s.chart5,
    "--sidebar": s.sidebar,
    "--sidebar-foreground": s.sidebarForeground,
    "--sidebar-primary": s.sidebarPrimary,
    "--sidebar-primary-foreground": s.sidebarPrimaryForeground,
    "--sidebar-accent": s.sidebarAccent,
    "--sidebar-accent-foreground": s.sidebarAccentForeground,
    "--sidebar-border": s.sidebarBorder,
    "--sidebar-ring": s.sidebarRing,
    "--status-pending": s.statusPending,
    "--status-processing": s.statusProcessing,
    "--status-completed": s.statusCompleted,
    "--status-failed": s.statusFailed,
    "--status-cancelled": s.statusCancelled,
  }
}

export function resolveThemeCssVars(): CssVarMap {
  const semantic = resolveSemanticLight()
  return semanticToCssVars(semantic)
}
