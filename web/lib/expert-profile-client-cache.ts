import { isUuidLike, normalizePublicSlug } from "@ciuna/shared"
import type { ExpertCatalogService } from "@/components/hub/hub-expert-service-catalog-card"
import { hubPublicHubJsonCacheUserId } from "@/lib/hub-client-cache"

const PUBLIC_JSON_TTL_MS = 5 * 60 * 1000

const cacheUserId = hubPublicHubJsonCacheUserId()

const PROFILES_LIST_STORAGE_KEY = `ciuna_expert_profiles_list_${cacheUserId}`
const CATALOG_SERVICES_LIST_STORAGE_KEY = `ciuna_expert_catalog_services_${cacheUserId}`

let memoryProfilesList: { value: unknown[]; timestamp: number } | null = null
let memoryCatalogServicesList: { value: ExpertCatalogService[]; timestamp: number } | null = null

function storageKey(profileId: string) {
  return `ciuna_expert_profile_detail_${cacheUserId}_${profileId}`
}

function memoryKey(profileId: string) {
  return `${cacheUserId}::${profileId}`
}

export type ExpertProfileDetailCachePayload = {
  profile: Record<string, unknown> | null
  services: Record<string, unknown>[]
  notFound: boolean
  timestamp: number
}

const memoryByKey = new Map<string, ExpertProfileDetailCachePayload>()

function readFromStorage(profileId: string): ExpertProfileDetailCachePayload | null {
  if (typeof window === "undefined" || !profileId) return null
  try {
    const raw = localStorage.getItem(storageKey(profileId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExpertProfileDetailCachePayload
    if (typeof parsed.timestamp !== "number") return null
    if (typeof parsed.notFound !== "boolean") return null
    if (!Array.isArray(parsed.services)) return null
    return parsed
  } catch {
    return null
  }
}

function readEntry(profileId: string): ExpertProfileDetailCachePayload | null {
  const mkey = memoryKey(profileId)
  const mem = memoryByKey.get(mkey)
  if (mem) return mem
  const ls = readFromStorage(profileId)
  if (ls) memoryByKey.set(mkey, ls)
  return ls
}

/** Keys derived from the URL segment (raw + normalized slug when not a UUID). */
function expertDetailCacheLookupKeys(segment: string): string[] {
  const raw = String(segment || "").trim()
  if (!raw) return []
  const keys = new Set<string>()
  keys.add(raw)
  if (!isUuidLike(raw)) {
    const norm = normalizePublicSlug(raw)
    if (norm) keys.add(norm)
  }
  return [...keys]
}

/** All storage keys to update so `/experts/uuid` and `/experts/slug` share one payload (avoids blink on canonical replace). */
function expertDetailCacheWriteKeys(
  segment: string,
  payload: { profile: Record<string, unknown> | null; services: Record<string, unknown>[]; notFound: boolean },
): string[] {
  const keys = new Set<string>(expertDetailCacheLookupKeys(segment))
  if (!payload.notFound && payload.profile) {
    const p = payload.profile
    const id = typeof p.id === "string" ? p.id.trim() : ""
    const slugRaw = typeof p.slug === "string" ? p.slug.trim() : ""
    if (id) keys.add(id)
    if (slugRaw) {
      keys.add(slugRaw)
      const norm = normalizePublicSlug(slugRaw)
      if (norm) keys.add(norm)
    }
  }
  return [...keys].filter(Boolean)
}

export function readStaleExpertProfileDetailCache(segment: string): ExpertProfileDetailCachePayload | null {
  if (!String(segment || "").trim()) return null
  for (const key of expertDetailCacheLookupKeys(segment)) {
    const e = readEntry(key)
    if (e) return e
  }
  return null
}

export function isExpertProfileDetailCacheFresh(segment: string): boolean {
  if (!String(segment || "").trim()) return false
  for (const key of expertDetailCacheLookupKeys(segment)) {
    const e = readEntry(key)
    if (e && Date.now() - e.timestamp < PUBLIC_JSON_TTL_MS) return true
  }
  return false
}

export function writeExpertProfileDetailCache(
  segment: string,
  payload: { profile: Record<string, unknown> | null; services: Record<string, unknown>[]; notFound: boolean },
) {
  if (typeof window === "undefined") return
  const keys = expertDetailCacheWriteKeys(segment, payload)
  if (keys.length === 0) return
  const timestamp = Date.now()
  const entry: ExpertProfileDetailCachePayload = {
    profile: payload.profile,
    services: payload.services,
    notFound: payload.notFound,
    timestamp,
  }
  for (const key of keys) {
    const mkey = memoryKey(key)
    memoryByKey.set(mkey, entry)
    try {
      localStorage.setItem(storageKey(key), JSON.stringify(entry))
    } catch {}
  }
}

function parseExpertProfileList(value: unknown): unknown[] | null {
  if (!Array.isArray(value)) return null
  const out: unknown[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string" || typeof o.display_name !== "string") continue
    out.push(item)
  }
  return out
}

function readProfilesListFromStorage(): { value: unknown[]; timestamp: number } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(PROFILES_LIST_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; timestamp?: unknown }
    const list = parseExpertProfileList(parsed.value)
    if (list === null || typeof parsed.timestamp !== "number") return null
    return { value: list, timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

export function readStaleExpertProfilesListCache(): unknown[] | null {
  if (memoryProfilesList) return memoryProfilesList.value
  const ls = readProfilesListFromStorage()
  if (ls) {
    memoryProfilesList = ls
    return ls.value
  }
  return null
}

export function isExpertProfilesListCacheFresh(): boolean {
  if (memoryProfilesList) return Date.now() - memoryProfilesList.timestamp < PUBLIC_JSON_TTL_MS
  const ls = readProfilesListFromStorage()
  if (ls) {
    memoryProfilesList = ls
    return Date.now() - ls.timestamp < PUBLIC_JSON_TTL_MS
  }
  return false
}

export function writeExpertProfilesListCache(profiles: unknown[]) {
  if (typeof window === "undefined") return
  const entry = { value: profiles, timestamp: Date.now() }
  memoryProfilesList = entry
  try {
    localStorage.setItem(PROFILES_LIST_STORAGE_KEY, JSON.stringify(entry))
  } catch {}
}

function parseExpertCatalogServicesList(value: unknown): ExpertCatalogService[] | null {
  if (!Array.isArray(value)) return null
  const out: ExpertCatalogService[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    const ex = o.expert
    if (!ex || typeof ex !== "object") continue
    const e = ex as Record<string, unknown>
    if (typeof o.id !== "string" || typeof o.title !== "string" || typeof o.pricing_type !== "string") continue
    if (typeof e.id !== "string" || typeof e.display_name !== "string") continue
    out.push(item as ExpertCatalogService)
  }
  return out
}

function readCatalogServicesListFromStorage(): { value: ExpertCatalogService[]; timestamp: number } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CATALOG_SERVICES_LIST_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; timestamp?: unknown }
    const list = parseExpertCatalogServicesList(parsed.value)
    if (list === null || typeof parsed.timestamp !== "number") return null
    return { value: list, timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

/** Stale-OK read for `/experts` services grid (same pattern as hub marketplace catalog). */
export function readStaleExpertCatalogServicesListCache(): ExpertCatalogService[] | null {
  if (memoryCatalogServicesList) return memoryCatalogServicesList.value
  const ls = readCatalogServicesListFromStorage()
  if (ls) {
    memoryCatalogServicesList = ls
    return ls.value
  }
  return null
}

export function isExpertCatalogServicesListCacheFresh(): boolean {
  if (memoryCatalogServicesList) return Date.now() - memoryCatalogServicesList.timestamp < PUBLIC_JSON_TTL_MS
  const ls = readCatalogServicesListFromStorage()
  if (ls) {
    memoryCatalogServicesList = ls
    return Date.now() - ls.timestamp < PUBLIC_JSON_TTL_MS
  }
  return false
}

export function writeExpertCatalogServicesListCache(services: ExpertCatalogService[]) {
  if (typeof window === "undefined") return
  const entry = { value: services, timestamp: Date.now() }
  memoryCatalogServicesList = entry
  try {
    localStorage.setItem(CATALOG_SERVICES_LIST_STORAGE_KEY, JSON.stringify(entry))
  } catch {}
}

export function clearExpertProfileDetailMemory() {
  memoryByKey.clear()
  memoryProfilesList = null
  memoryCatalogServicesList = null
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(PROFILES_LIST_STORAGE_KEY)
      localStorage.removeItem(CATALOG_SERVICES_LIST_STORAGE_KEY)
    } catch {}
  }
}
