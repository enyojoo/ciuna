import { isReferralPayoutMirrorReference } from "./volume/completed-volume"

/** Slug for hub product category (food vs mart). Mirrors web `hubCategorySlug`. */
export function hubCategorySlugForLine(label: string): string {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function categoryMatchesSlugForLine(category: string, slug: string): boolean {
  return hubCategorySlugForLine(category) === String(slug || "").trim().toLowerCase()
}

export type TransactionListLine =
  | { kind: "send" }
  | { kind: "hub"; line: "food" | "mart" }
  | { kind: "referral_payout" }

/**
 * Classifies a `transactions` row (or merged payout row) for list/detail badges.
 * Referral payout rows use `reference` starting with `REFERRAL_PAYOUT:`.
 * Hub food vs mart uses `hubProductCategory` when present; otherwise hub defaults to **mart** (legacy).
 */
export function resolveTransactionListLine(
  row: {
    type?: string | null
    transaction_source?: string | null
    reference?: string | null
  },
  hubProductCategory?: string | null,
): TransactionListLine {
  if (row.type === "referral_payout" || isReferralPayoutMirrorReference(row.reference)) {
    return { kind: "referral_payout" }
  }
  const isHub = row.transaction_source === "hub" || row.type === "hub"
  if (isHub) {
    const cat = hubProductCategory != null ? String(hubProductCategory) : ""
    if (categoryMatchesSlugForLine(cat, "food")) return { kind: "hub", line: "food" }
    return { kind: "hub", line: "mart" }
  }
  return { kind: "send" }
}

/** Primary list/badge label for the line (English; callers can map via i18n). */
export function transactionLinePrimaryBadge(line: TransactionListLine): "Send" | "Food" | "Mart" | "Referral" {
  if (line.kind === "referral_payout") return "Referral"
  if (line.kind === "send") return "Send"
  return line.line === "food" ? "Food" : "Mart"
}
