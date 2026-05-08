import type { ReactNode } from "react"
import type { HubProductRow } from "@/lib/hub-types"
import { formatCurrencySymbolOnly } from "@/utils/currency"

export function featuredRank(p: HubProductRow): number {
  return p.is_featured ? 1 : 0
}

export function sortHubCatalogProducts(list: HubProductRow[]): HubProductRow[] {
  return [...list].sort((a, b) => {
    const fr = featuredRank(b) - featuredRank(a)
    if (fr !== 0) return fr
    const ta = new Date(a.updated_at).getTime()
    const tb = new Date(b.updated_at).getTime()
    return tb - ta
  })
}

export function formatCardPrice(amount: number | null, currency: string | null): string {
  if (amount == null) return "—"
  return formatCurrencySymbolOnly(Number(amount), currency)
    .replace(/\s?[A-Z]{3}\b/g, "")
    .replace(/\.00\b/g, "")
    .trim()
}

export const amountValueClass = "text-base sm:text-xl font-bold tabular-nums tracking-tight text-gray-900"
export const amountPrefixClass = "text-xs font-medium text-gray-500 sm:text-sm"

export function renderUserInputRangeLabel(
  min: number | null,
  max: number | null,
  currency: string | null,
  t: (key: string) => string,
): ReactNode {
  const hasMin = typeof min === "number" && Number.isFinite(min)
  const hasMax = typeof max === "number" && Number.isFinite(max)
  if (!hasMin && !hasMax) return t("hub.setAmount")

  const minVal = hasMin ? Number(min) : null
  const maxVal = hasMax ? Number(max) : null
  const minLabel = minVal != null ? formatCardPrice(minVal, currency) : null
  const maxLabel = maxVal != null ? formatCardPrice(maxVal, currency) : null

  if (minLabel && maxLabel) {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className={amountPrefixClass}>{t("hub.payFrom")}</span>
        <span className={amountValueClass}>{minLabel}</span>
      </div>
    )
  }
  if (minLabel) {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className={amountPrefixClass}>{t("hub.payFrom")}</span>
        <span className={amountValueClass}>{minLabel}</span>
      </div>
    )
  }
  if (maxLabel) {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className={amountPrefixClass}>{t("hub.payUpTo")}</span>
        <span className={amountValueClass}>{maxLabel}</span>
      </div>
    )
  }
  return t("hub.setAmount")
}
