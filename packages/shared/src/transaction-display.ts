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
  | { kind: "experts" }
  | { kind: "referral_payout" }

function hubSnapshotIsExpertCheckout(hubSnapshot?: Record<string, unknown> | null): boolean {
  if (!hubSnapshot || typeof hubSnapshot !== "object") return false
  const fa = hubSnapshot.formAnswers as Record<string, unknown> | undefined
  return fa?.expert_checkout === true
}

/**
 * Classifies a `transactions` row (or merged payout row) for list/detail badges.
 * Referral payout rows use `reference` starting with `REFERRAL_PAYOUT:`.
 * Expert hub checkouts set `hub_snapshot.formAnswers.expert_checkout` (no `hub_product_id`).
 * Hub food vs mart uses `hubProductCategory` when present; otherwise hub defaults to **mart** (legacy).
 */
export function resolveTransactionListLine(
  row: {
    type?: string | null
    transaction_source?: string | null
    reference?: string | null
  },
  hubProductCategory?: string | null,
  hubSnapshot?: Record<string, unknown> | null,
): TransactionListLine {
  if (row.type === "referral_payout" || isReferralPayoutMirrorReference(row.reference)) {
    return { kind: "referral_payout" }
  }
  const isHub = row.transaction_source === "hub" || row.type === "hub"
  if (isHub) {
    if (hubSnapshotIsExpertCheckout(hubSnapshot)) return { kind: "experts" }
    const cat = hubProductCategory != null ? String(hubProductCategory) : ""
    if (categoryMatchesSlugForLine(cat, "food")) return { kind: "hub", line: "food" }
    return { kind: "hub", line: "mart" }
  }
  return { kind: "send" }
}

/** Primary list/badge label for the line (English; callers can map via i18n). */
export function transactionLinePrimaryBadge(
  line: TransactionListLine,
): "Send" | "Food" | "Mart" | "Experts" | "Referral" {
  if (line.kind === "referral_payout") return "Referral"
  if (line.kind === "send") return "Send"
  if (line.kind === "experts") return "Experts"
  return line.line === "food" ? "Food" : "Mart"
}

/** Stable icon category for transaction rows (maps to Lucide icons in the web app). */
export type TransactionListLineIconKind = "send" | "referral" | "hub_food" | "hub_mart" | "experts"

export function transactionListLineIconKind(line: TransactionListLine): TransactionListLineIconKind {
  if (line.kind === "referral_payout") return "referral"
  if (line.kind === "send") return "send"
  if (line.kind === "experts") return "experts"
  return line.line === "food" ? "hub_food" : "hub_mart"
}
