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
