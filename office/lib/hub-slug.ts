/** Match web `hubCategorySlug` — keep in sync with web/lib/hub-slug.ts */
export function hubCategorySlug(label: string): string {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function categoryMatchesSlug(category: string, slug: string): boolean {
  return hubCategorySlug(category) === String(slug || "").trim().toLowerCase()
}

/** Match web `hubProductBelongsToServiceLine` — keep in sync with web/lib/hub-slug.ts */
export function hubProductBelongsToServiceLine(
  product: { category?: string | null; service_line_slug?: string | null },
  lineSlug: string,
): boolean {
  const line = String(lineSlug || "").trim().toLowerCase()
  if (!line) return false
  const stored = product.service_line_slug != null ? String(product.service_line_slug).trim().toLowerCase() : ""
  if (stored === "food" || stored === "mart") return stored === line
  return categoryMatchesSlug(String(product.category || ""), line)
}

/** Match web `hubMarketplaceLineFromCategory` — keep in sync with web/lib/hub-slug.ts */
export function hubMarketplaceLineFromCategory(category: string): "food" | "mart" | null {
  const s = hubCategorySlug(category)
  if (s === "food" || s === "mart") return s
  return null
}
