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

/** Per-vendor, per-line in-memory mirrors so repeat opens of the same storefront skip localStorage too. */
const memFoodVendor = new Map<string, Entry<HubVendorRow | null>>()
const memMartVendor = new Map<string, Entry<HubVendorRow | null>>()
const memFoodVendorProducts = new Map<string, Entry<HubProductRow[]>>()
const memMartVendorProducts = new Map<string, Entry<HubProductRow[]>>()

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

/* -------------------------------------------------------------------------- */
/* Vendor storefront caches (per line × per vendor slug).                     */
/*                                                                            */
/* Each helper is hardcoded to its line. Food readers / writers cannot touch  */
/* mart entries and vice versa.                                               */
/* -------------------------------------------------------------------------- */

const FOOD_VENDOR_KEY = (slug: string) => `ciuna_food_vendor_${slug}_v3`
const FOOD_VENDOR_PRODUCTS_KEY = (slug: string) => `ciuna_food_vendor_${slug}_products_v3`
const MART_VENDOR_KEY = (slug: string) => `ciuna_mart_vendor_${slug}_v3`
const MART_VENDOR_PRODUCTS_KEY = (slug: string) => `ciuna_mart_vendor_${slug}_products_v3`

interface VendorMetaStored {
  vendor: HubVendorRow | null
  notFound: boolean
}

export interface VendorCacheRead {
  vendor: HubVendorRow | null
  notFound: boolean
  fresh: boolean
}

function readVendorEntry(
  storageKey: string,
  memMap: Map<string, Entry<HubVendorRow | null>>,
  memKey: string,
): VendorCacheRead | null {
  const fromMem = memMap.get(memKey)
  if (fromMem) {
    return { vendor: fromMem.value, notFound: fromMem.value === null, fresh: Date.now() - fromMem.t < TTL_MS }
  }
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: VendorMetaStored; t?: unknown }
    if (!parsed.value || typeof parsed.t !== "number") return null
    const v = parsed.value.vendor
    const isVendor =
      v && typeof v === "object" && typeof (v as HubVendorRow).id === "string" && typeof (v as HubVendorRow).slug === "string"
    if (!parsed.value.notFound && !isVendor) return null
    const vendor = parsed.value.notFound ? null : (v as HubVendorRow)
    memMap.set(memKey, { value: vendor, t: parsed.t })
    return { vendor, notFound: parsed.value.notFound, fresh: Date.now() - parsed.t < TTL_MS }
  } catch {
    return null
  }
}

function writeVendorEntry(
  storageKey: string,
  memMap: Map<string, Entry<HubVendorRow | null>>,
  memKey: string,
  vendor: HubVendorRow | null,
): void {
  const stored: VendorMetaStored = { vendor, notFound: vendor === null }
  const entry: Entry<HubVendorRow | null> = { value: vendor, t: Date.now() }
  memMap.set(memKey, entry)
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(storageKey, JSON.stringify({ value: stored, t: entry.t }))
  } catch {
    /* ignore */
  }
}

function readVendorProductsEntry(
  storageKey: string,
  memMap: Map<string, Entry<HubProductRow[]>>,
  memKey: string,
): CacheRead<HubProductRow[]> | null {
  const fromMem = memMap.get(memKey)
  if (fromMem) return { value: fromMem.value, fresh: Date.now() - fromMem.t < TTL_MS }
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; t?: unknown }
    if (!Array.isArray(parsed.value) || typeof parsed.t !== "number") return null
    const list = parsed.value as HubProductRow[]
    memMap.set(memKey, { value: list, t: parsed.t })
    return { value: list, fresh: Date.now() - parsed.t < TTL_MS }
  } catch {
    return null
  }
}

function writeVendorProductsEntry(
  storageKey: string,
  memMap: Map<string, Entry<HubProductRow[]>>,
  memKey: string,
  list: HubProductRow[],
): void {
  const entry: Entry<HubProductRow[]> = { value: list, t: Date.now() }
  memMap.set(memKey, entry)
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(storageKey, JSON.stringify({ value: list, t: entry.t }))
  } catch {
    /* ignore */
  }
}

export const readFoodVendorCache = (vendorSlug: string): VendorCacheRead | null =>
  readVendorEntry(FOOD_VENDOR_KEY(vendorSlug), memFoodVendor, vendorSlug)
export const writeFoodVendorCache = (vendorSlug: string, vendor: HubVendorRow | null): void =>
  writeVendorEntry(FOOD_VENDOR_KEY(vendorSlug), memFoodVendor, vendorSlug, vendor)

export const readMartVendorCache = (vendorSlug: string): VendorCacheRead | null =>
  readVendorEntry(MART_VENDOR_KEY(vendorSlug), memMartVendor, vendorSlug)
export const writeMartVendorCache = (vendorSlug: string, vendor: HubVendorRow | null): void =>
  writeVendorEntry(MART_VENDOR_KEY(vendorSlug), memMartVendor, vendorSlug, vendor)

export const readFoodVendorProductsCache = (vendorSlug: string): CacheRead<HubProductRow[]> | null =>
  readVendorProductsEntry(FOOD_VENDOR_PRODUCTS_KEY(vendorSlug), memFoodVendorProducts, vendorSlug)
export const writeFoodVendorProductsCache = (vendorSlug: string, list: HubProductRow[]): void =>
  writeVendorProductsEntry(FOOD_VENDOR_PRODUCTS_KEY(vendorSlug), memFoodVendorProducts, vendorSlug, list)

export const readMartVendorProductsCache = (vendorSlug: string): CacheRead<HubProductRow[]> | null =>
  readVendorProductsEntry(MART_VENDOR_PRODUCTS_KEY(vendorSlug), memMartVendorProducts, vendorSlug)
export const writeMartVendorProductsCache = (vendorSlug: string, list: HubProductRow[]): void =>
  writeVendorProductsEntry(MART_VENDOR_PRODUCTS_KEY(vendorSlug), memMartVendorProducts, vendorSlug, list)
