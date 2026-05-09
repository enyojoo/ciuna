/**
 * Per-line client cache for /food and /mart.
 *
 * IMPORTANT: each line has its own hardcoded localStorage / memory key.
 * There are no parameterized helpers and no shared scope — Food reads
 * `ciuna_food_*` only, Mart reads `ciuna_mart_*` only, so no cross-line
 * cache bleed is possible from this module.
 *
 * UX target matches /experts and /send: instant render from cache when
 * fresh; fall back to fetch + skeleton when stale or empty.
 */

import type { HubProductRow } from "@/lib/hub-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"

const TTL_MS = 60 * 60 * 1000

type Entry<T> = { value: T; t: number }

interface MemoryCache {
  foodProducts: Entry<HubProductRow[]> | null
  foodVendors: Entry<HubVendorRow[]> | null
  martProducts: Entry<HubProductRow[]> | null
  martVendors: Entry<HubVendorRow[]> | null
}

const mem: MemoryCache = {
  foodProducts: null,
  foodVendors: null,
  martProducts: null,
  martVendors: null,
}

function readEntry<T>(storageKey: string): Entry<T> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; t?: unknown }
    if (!Array.isArray(parsed.value) || typeof parsed.t !== "number") return null
    return { value: parsed.value as T, t: parsed.t }
  } catch {
    return null
  }
}

function writeEntry<T>(storageKey: string, value: T): Entry<T> {
  const entry: Entry<T> = { value, t: Date.now() }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entry))
    } catch {
      /* quota / private mode — fall back to memory only */
    }
  }
  return entry
}

export interface CacheRead<T> {
  value: T
  fresh: boolean
}

function read<T>(storageKey: string, memSlot: keyof MemoryCache): CacheRead<T> | null {
  const memEntry = mem[memSlot] as Entry<T> | null
  const entry = memEntry ?? readEntry<T>(storageKey)
  if (!entry) return null
  if (!memEntry) (mem[memSlot] as Entry<T> | null) = entry
  return { value: entry.value, fresh: Date.now() - entry.t < TTL_MS }
}

function write<T>(storageKey: string, memSlot: keyof MemoryCache, value: T): void {
  const entry = writeEntry<T>(storageKey, value)
  ;(mem[memSlot] as Entry<T>) = entry
}

const FOOD_PRODUCTS_KEY = "ciuna_food_products_v3"
const FOOD_VENDORS_KEY = "ciuna_food_vendors_v3"
const MART_PRODUCTS_KEY = "ciuna_mart_products_v3"
const MART_VENDORS_KEY = "ciuna_mart_vendors_v3"

export const readFoodProductsCache = (): CacheRead<HubProductRow[]> | null =>
  read<HubProductRow[]>(FOOD_PRODUCTS_KEY, "foodProducts")
export const writeFoodProductsCache = (value: HubProductRow[]): void =>
  write(FOOD_PRODUCTS_KEY, "foodProducts", value)

export const readFoodVendorsCache = (): CacheRead<HubVendorRow[]> | null =>
  read<HubVendorRow[]>(FOOD_VENDORS_KEY, "foodVendors")
export const writeFoodVendorsCache = (value: HubVendorRow[]): void =>
  write(FOOD_VENDORS_KEY, "foodVendors", value)

export const readMartProductsCache = (): CacheRead<HubProductRow[]> | null =>
  read<HubProductRow[]>(MART_PRODUCTS_KEY, "martProducts")
export const writeMartProductsCache = (value: HubProductRow[]): void =>
  write(MART_PRODUCTS_KEY, "martProducts", value)

export const readMartVendorsCache = (): CacheRead<HubVendorRow[]> | null =>
  read<HubVendorRow[]>(MART_VENDORS_KEY, "martVendors")
export const writeMartVendorsCache = (value: HubVendorRow[]): void =>
  write(MART_VENDORS_KEY, "martVendors", value)
