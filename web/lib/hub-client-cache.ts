import type { HubProductRow } from "@/lib/hub-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"

/** Catalog list changes rarely; align with comfortable SPA revisits (not 5m polling). */
const CATALOG_TTL_MS = 60 * 60 * 1000
const PRODUCT_TTL_MS = 60 * 60 * 1000
const SERVICE_LINES_TTL_MS = 60 * 60 * 1000

function catalogKey(userId: string) {
  return `ciuna_hub_products_${userId}`
}

function serviceLinesKey(userId: string) {
  return `ciuna_hub_service_lines_${userId}`
}

function productKey(userId: string, productId: string) {
  return `ciuna_hub_product_${userId}_${productId}`
}

function vendorCatalogStorageKey(userId: string, lineSlug: string, vendorSlug: string) {
  return `ciuna_hub_vendor_products_${userId}_${lineSlug}_${vendorSlug}`
}

function vendorCatalogMemoryKey(userId: string, lineSlug: string, vendorSlug: string) {
  return `${userId}::${lineSlug}::${vendorSlug}`
}

function productMemoryKey(userId: string, productId: string) {
  return `${userId}::${productId}`
}

/** In-memory mirror so repeat client navigations skip network without re-reading LS each time. */
const memoryCatalogByUser = new Map<string, { value: HubProductRow[]; timestamp: number }>()
const memoryProductByKey = new Map<string, { value: HubProductRow; timestamp: number }>()
const memoryServiceLinesByUser = new Map<string, { value: HubServiceLineRow[]; timestamp: number }>()
const memoryVendorCatalogByKey = new Map<string, { value: HubProductRow[]; timestamp: number }>()

/** Clears session memory (call on sign-out). localStorage entries remain per-user keys. */
export function clearHubClientMemory() {
  memoryCatalogByUser.clear()
  memoryProductByKey.clear()
  memoryServiceLinesByUser.clear()
  memoryVendorCatalogByKey.clear()
}

function readServiceLinesEntryFromStorage(
  userId: string,
): { value: HubServiceLineRow[]; timestamp: number } | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = localStorage.getItem(serviceLinesKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; timestamp?: unknown }
    if (!Array.isArray(parsed.value) || typeof parsed.timestamp !== "number") return null
    return { value: parsed.value as HubServiceLineRow[], timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

export function readStaleHubServiceLinesCache(userId: string): HubServiceLineRow[] | null {
  if (!userId) return null
  const mem = memoryServiceLinesByUser.get(userId)
  if (mem) return mem.value
  const ls = readServiceLinesEntryFromStorage(userId)
  if (ls) {
    memoryServiceLinesByUser.set(userId, ls)
    return ls.value
  }
  return null
}

export function isHubServiceLinesCacheFresh(userId: string): boolean {
  if (!userId) return false
  const mem = memoryServiceLinesByUser.get(userId)
  if (mem) return Date.now() - mem.timestamp < SERVICE_LINES_TTL_MS
  const ls = readServiceLinesEntryFromStorage(userId)
  if (ls) {
    memoryServiceLinesByUser.set(userId, ls)
    return Date.now() - ls.timestamp < SERVICE_LINES_TTL_MS
  }
  return false
}

export function writeHubServiceLinesCache(userId: string, lines: HubServiceLineRow[]) {
  if (typeof window === "undefined" || !userId) return
  const entry = { value: lines, timestamp: Date.now() }
  memoryServiceLinesByUser.set(userId, entry)
  try {
    localStorage.setItem(serviceLinesKey(userId), JSON.stringify(entry))
  } catch {}
}

function readCatalogEntryFromStorage(userId: string): { value: HubProductRow[]; timestamp: number } | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = localStorage.getItem(catalogKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; timestamp?: unknown }
    if (!Array.isArray(parsed.value) || typeof parsed.timestamp !== "number") return null
    return { value: parsed.value as HubProductRow[], timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

function readProductEntryFromStorage(
  userId: string,
  productId: string,
): { value: HubProductRow; timestamp: number } | null {
  if (typeof window === "undefined" || !userId || !productId) return null
  try {
    const raw = localStorage.getItem(productKey(userId, productId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; timestamp?: unknown }
    const row = parsed.value
    if (!row || typeof row !== "object" || typeof (row as HubProductRow).id !== "string") return null
    if (typeof parsed.timestamp !== "number") return null
    return { value: row as HubProductRow, timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

export function readStaleHubCatalogCache(userId: string): HubProductRow[] | null {
  if (!userId) return null
  const mem = memoryCatalogByUser.get(userId)
  if (mem) return mem.value
  const ls = readCatalogEntryFromStorage(userId)
  if (ls) {
    memoryCatalogByUser.set(userId, ls)
    return ls.value
  }
  return null
}

export function isHubCatalogCacheFresh(userId: string): boolean {
  if (!userId) return false
  const mem = memoryCatalogByUser.get(userId)
  if (mem) return Date.now() - mem.timestamp < CATALOG_TTL_MS
  const ls = readCatalogEntryFromStorage(userId)
  if (ls) {
    memoryCatalogByUser.set(userId, ls)
    return Date.now() - ls.timestamp < CATALOG_TTL_MS
  }
  return false
}

export function writeHubCatalogCache(userId: string, products: HubProductRow[]) {
  if (typeof window === "undefined" || !userId) return
  const entry = { value: products, timestamp: Date.now() }
  memoryCatalogByUser.set(userId, entry)
  try {
    localStorage.setItem(catalogKey(userId), JSON.stringify(entry))
  } catch {}
}

export function readStaleHubProductCache(userId: string, productId: string): HubProductRow | null {
  if (!userId || !productId) return null
  const mkey = productMemoryKey(userId, productId)
  const mem = memoryProductByKey.get(mkey)
  if (mem) return mem.value
  const ls = readProductEntryFromStorage(userId, productId)
  if (ls) {
    memoryProductByKey.set(mkey, ls)
    return ls.value
  }
  return null
}

export function isHubProductCacheFresh(userId: string, productId: string): boolean {
  if (!userId || !productId) return false
  const mkey = productMemoryKey(userId, productId)
  const mem = memoryProductByKey.get(mkey)
  if (mem) return Date.now() - mem.timestamp < PRODUCT_TTL_MS
  const ls = readProductEntryFromStorage(userId, productId)
  if (ls) {
    memoryProductByKey.set(mkey, ls)
    return Date.now() - ls.timestamp < PRODUCT_TTL_MS
  }
  return false
}

export function writeHubProductCache(userId: string, product: HubProductRow) {
  if (typeof window === "undefined" || !userId || !product?.id) return
  const mkey = productMemoryKey(userId, product.id)
  const entry = { value: product, timestamp: Date.now() }
  memoryProductByKey.set(mkey, entry)
  try {
    localStorage.setItem(productKey(userId, product.id), JSON.stringify(entry))
  } catch {}
}

function readVendorCatalogFromStorage(
  userId: string,
  lineSlug: string,
  vendorSlug: string,
): { value: HubProductRow[]; timestamp: number } | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = localStorage.getItem(vendorCatalogStorageKey(userId, lineSlug, vendorSlug))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; timestamp?: unknown }
    if (!Array.isArray(parsed.value) || typeof parsed.timestamp !== "number") return null
    return { value: parsed.value as HubProductRow[], timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

export function readStaleHubVendorCatalogCache(
  userId: string,
  lineSlug: string,
  vendorSlug: string,
): HubProductRow[] | null {
  if (!userId || !lineSlug || !vendorSlug) return null
  const mkey = vendorCatalogMemoryKey(userId, lineSlug, vendorSlug)
  const mem = memoryVendorCatalogByKey.get(mkey)
  if (mem) return mem.value
  const ls = readVendorCatalogFromStorage(userId, lineSlug, vendorSlug)
  if (ls) {
    memoryVendorCatalogByKey.set(mkey, ls)
    return ls.value
  }
  return null
}

export function isHubVendorCatalogCacheFresh(userId: string, lineSlug: string, vendorSlug: string): boolean {
  if (!userId || !lineSlug || !vendorSlug) return false
  const mkey = vendorCatalogMemoryKey(userId, lineSlug, vendorSlug)
  const mem = memoryVendorCatalogByKey.get(mkey)
  if (mem) return Date.now() - mem.timestamp < CATALOG_TTL_MS
  const ls = readVendorCatalogFromStorage(userId, lineSlug, vendorSlug)
  if (ls) {
    memoryVendorCatalogByKey.set(mkey, ls)
    return Date.now() - ls.timestamp < CATALOG_TTL_MS
  }
  return false
}

export function writeHubVendorCatalogCache(userId: string, lineSlug: string, vendorSlug: string, products: HubProductRow[]) {
  if (typeof window === "undefined" || !userId || !lineSlug || !vendorSlug) return
  const mkey = vendorCatalogMemoryKey(userId, lineSlug, vendorSlug)
  const entry = { value: products, timestamp: Date.now() }
  memoryVendorCatalogByKey.set(mkey, entry)
  try {
    localStorage.setItem(vendorCatalogStorageKey(userId, lineSlug, vendorSlug), JSON.stringify(entry))
  } catch {}
}
