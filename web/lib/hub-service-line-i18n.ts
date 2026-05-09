import type { HubServiceLineRow } from "@/lib/hub-service-line-types"

/** Normalize DB slug for locale keys (`gift_packs` → `gift-packs`). */
export function normalizedHubServiceLineSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/_/g, "-")
}

/**
 * Hub grid tiles use DB title/description by default. When `hub.serviceLineTiles.{slug}` exists
 * in `app` locales, those strings override for the active language.
 */
export function hubServiceLineTileCopy(
  line: HubServiceLineRow,
  t: (key: string, options?: { defaultValue?: string }) => string,
): { title: string; shortDescription: string | null } {
  let slug = normalizedHubServiceLineSlug(line.slug)
  if (slug === "send-money") slug = "send"

  const base = `hub.serviceLineTiles.${slug}`
  const title = t(`${base}.title`, { defaultValue: line.title })
  const dbDesc = line.short_description?.trim() ?? ""
  const shortDescriptionRaw = t(`${base}.shortDescription`, { defaultValue: dbDesc })
  const shortDescription = shortDescriptionRaw.trim() || null
  return { title, shortDescription }
}
