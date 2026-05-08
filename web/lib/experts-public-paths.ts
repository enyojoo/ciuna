/** User-facing expert catalog + profiles + booking (no `/hub/experts`). */

export const EXPERTS_CATALOG_PATH = "/experts"

export function expertsProfilePath(profileId: string): string {
  return `/experts/${encodeURIComponent(profileId)}`
}

export function expertsBookPath(profileId: string, slotQuery?: string): string {
  const base = `/experts/${encodeURIComponent(profileId)}/book`
  const s = (slotQuery || "").trim()
  return s ? `${base}?slot=${encodeURIComponent(s)}` : base
}
