import type { HubProductRow } from "@/lib/hub-types"

/** Catalog list changes rarely; align with comfortable SPA revisits (not 5m polling). */
const CATALOG_TTL_MS = 60 * 60 * 1000
const PRODUCT_TTL_MS = 60 * 60 * 1000

function catalogKey(userId: string) {
  return `ciuna_hub_products_${userId}`
}

function productKey(userId: string, productId: string) {
  return `ciuna_hub_product_${userId}_${productId}`
}

function productMemoryKey(userId: string, productId: string) {
  return `${userId}::${productId}`
}

/** In-memory mirror so repeat client navigations skip network without re-reading LS each time. */
const memoryCatalogByUser = new Map<string, { value: HubProductRow[]; timestamp: number }>()
const memoryProductByKey = new Map<string, { value: HubProductRow; timestamp: number }>()

/** Clears session memory (call on sign-out). localStorage entries remain per-user keys. */
export function clearHubClientMemory() {
  memoryCatalogByUser.clear()
  memoryProductByKey.clear()
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
