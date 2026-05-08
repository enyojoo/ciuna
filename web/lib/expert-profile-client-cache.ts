import { hubPublicHubJsonCacheUserId } from "@/lib/hub-client-cache"

const PUBLIC_JSON_TTL_MS = 5 * 60 * 1000

const cacheUserId = hubPublicHubJsonCacheUserId()

const PROFILES_LIST_STORAGE_KEY = `ciuna_expert_profiles_list_${cacheUserId}`

let memoryProfilesList: { value: unknown[]; timestamp: number } | null = null

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

export function readStaleExpertProfileDetailCache(profileId: string): ExpertProfileDetailCachePayload | null {
  if (!profileId) return null
  return readEntry(profileId)
}

export function isExpertProfileDetailCacheFresh(profileId: string): boolean {
  const e = readEntry(profileId)
  if (!e) return false
  return Date.now() - e.timestamp < PUBLIC_JSON_TTL_MS
}

export function writeExpertProfileDetailCache(
  profileId: string,
  payload: { profile: Record<string, unknown> | null; services: Record<string, unknown>[]; notFound: boolean },
) {
  if (typeof window === "undefined" || !profileId) return
  const mkey = memoryKey(profileId)
  const entry: ExpertProfileDetailCachePayload = {
    ...payload,
    timestamp: Date.now(),
  }
  memoryByKey.set(mkey, entry)
  try {
    localStorage.setItem(storageKey(profileId), JSON.stringify(entry))
  } catch {}
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

export function clearExpertProfileDetailMemory() {
  memoryByKey.clear()
  memoryProfilesList = null
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(PROFILES_LIST_STORAGE_KEY)
    } catch {}
  }
}
