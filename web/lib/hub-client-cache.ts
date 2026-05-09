import type { HubProductRow } from "@/lib/hub-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"

/** Catalog list changes rarely; align with comfortable SPA revisits (not 5m polling). */
const CATALOG_TTL_MS = 60 * 60 * 1000
const PRODUCT_TTL_MS = 60 * 60 * 1000
const SERVICE_LINES_TTL_MS = 60 * 60 * 1000

/** Signed-out marketplace browsing; avoids empty userId and uses a shorter slice TTL. */
export const HUB_PUBLIC_HUB_CACHE_USER_ID = "__ciuna_public__"

const PUBLIC_HUB_SLICE_TTL_MS = 5 * 60 * 1000

/** Stable cache key for hub catalog / service-lines slices (signed-in id, else public bucket). */
export function hubClientCacheUserId(userId?: string | null, profileUserId?: string | null): string {
  const id = (userId ?? profileUserId ?? "").trim()
  if (id) return id
  return HUB_PUBLIC_HUB_CACHE_USER_ID
}

/** Stable id for JSON that is identical for every visitor (public hub APIs). Avoids a second fetch when auth hydrates after first paint. */
export function hubPublicHubJsonCacheUserId(): string {
  return HUB_PUBLIC_HUB_CACHE_USER_ID
}

/**
 * Dedicated cache bucket per marketplace line so Food and Mart never share catalog / vendor list / storefront JSON
 * in memory or localStorage (even if a caller mixes up scope arguments).
 */
export function hubMarketplaceSliceCacheUserId(lineSlug: "food" | "mart"): string {
  return `${HUB_PUBLIC_HUB_CACHE_USER_ID}::market::${lineSlug}`
}

/** Public hub slices use the shorter TTL; per-line marketplace buckets inherit the same behavior. */
function usesPublicHubSliceTtl(userId: string): boolean {
  return userId === HUB_PUBLIC_HUB_CACHE_USER_ID || userId.startsWith(`${HUB_PUBLIC_HUB_CACHE_USER_ID}::`)
}

function serviceLinesTtlForUser(userId: string): number {
  return usesPublicHubSliceTtl(userId) ? PUBLIC_HUB_SLICE_TTL_MS : SERVICE_LINES_TTL_MS
}

function vendorCatalogTtlForUser(userId: string): number {
  return usesPublicHubSliceTtl(userId) ? PUBLIC_HUB_SLICE_TTL_MS : CATALOG_TTL_MS
}

function catalogTtlForUser(userId: string): number {
  return usesPublicHubSliceTtl(userId) ? PUBLIC_HUB_SLICE_TTL_MS : CATALOG_TTL_MS
}

/** Scope for hub catalog list cache (`all` = full catalog; `food` / `mart` = marketplace slice). */
export type HubCatalogCacheScope = "all" | "food" | "mart"

/** Isolated food/mart buckets (`__ciuna_public__::market::food`); bump suffix to invalidate bad legacy localStorage. */
function marketplaceHubCacheKeySuffix(userId: string): string {
  return userId.includes("::market::") ? "_v2" : ""
}

function catalogKey(userId: string, scope: HubCatalogCacheScope = "all") {
  return `ciuna_hub_products_${userId}_${scope}${marketplaceHubCacheKeySuffix(userId)}`
}

function catalogMemoryKey(userId: string, scope: HubCatalogCacheScope) {
  return `${userId}::${scope}${marketplaceHubCacheKeySuffix(userId)}`
}

function serviceLinesKey(userId: string) {
  return `ciuna_hub_service_lines_${userId}`
}

function productKey(userId: string, productId: string) {
  return `ciuna_hub_product_${userId}_${productId}`
}

function vendorCatalogStorageKey(userId: string, lineSlug: string, vendorSlug: string) {
  return `ciuna_hub_vendor_products_${userId}_${lineSlug}_${vendorSlug}${marketplaceHubCacheKeySuffix(userId)}`
}

function vendorCatalogMemoryKey(userId: string, lineSlug: string, vendorSlug: string) {
  return `${userId}::${lineSlug}::${vendorSlug}${marketplaceHubCacheKeySuffix(userId)}`
}

function productMemoryKey(userId: string, productId: string) {
  return `${userId}::${productId}`
}

/** Marketplace vendor directory (`GET /api/hub/vendors?service_line=`) — food / mart only. */
function vendorListStorageKey(userId: string, lineSlug: string) {
  return `ciuna_hub_vendor_list_${userId}_${lineSlug}${marketplaceHubCacheKeySuffix(userId)}`
}

function vendorListMemoryKey(userId: string, lineSlug: string) {
  return `${userId}::vendorList::${lineSlug}${marketplaceHubCacheKeySuffix(userId)}`
}

/** In-memory mirror so repeat client navigations skip network without re-reading LS each time. */
const memoryCatalogByUser = new Map<string, { value: HubProductRow[]; timestamp: number }>()
const memoryProductByKey = new Map<string, { value: HubProductRow; timestamp: number }>()
const memoryServiceLinesByUser = new Map<string, { value: HubServiceLineRow[]; timestamp: number }>()
const memoryVendorCatalogByKey = new Map<string, { value: HubProductRow[]; timestamp: number }>()
const memoryVendorListByKey = new Map<string, { value: HubVendorRow[]; timestamp: number }>()

/** Clears session memory (call on sign-out). localStorage entries remain per-user keys. */
export function clearHubClientMemory() {
  memoryCatalogByUser.clear()
  memoryProductByKey.clear()
  memoryServiceLinesByUser.clear()
  memoryVendorCatalogByKey.clear()
  memoryVendorListByKey.clear()
  memoryVendorMetaByKey.clear()
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
  const ttl = serviceLinesTtlForUser(userId)
  const mem = memoryServiceLinesByUser.get(userId)
  if (mem) return Date.now() - mem.timestamp < ttl
  const ls = readServiceLinesEntryFromStorage(userId)
  if (ls) {
    memoryServiceLinesByUser.set(userId, ls)
    return Date.now() - ls.timestamp < ttl
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

function hubServiceLinesJsonStable(lines: HubServiceLineRow[] | null): string {
  return JSON.stringify(lines ?? [])
}

/**
 * When service-lines cache is still within TTL, refetch in the background and update cache + UI if the payload changed.
 */
export function scheduleHubServiceLinesStaleWhileRevalidate(
  userId: string,
  fetchLines: () => Promise<HubServiceLineRow[] | null>,
  onUpdated?: (lines: HubServiceLineRow[]) => void,
): void {
  if (typeof window === "undefined" || !userId) return
  if (!isHubServiceLinesCacheFresh(userId)) return

  const run = () => {
    void (async () => {
      try {
        const next = await fetchLines()
        if (!next || !Array.isArray(next)) return
        const stale = readStaleHubServiceLinesCache(userId)
        if (hubServiceLinesJsonStable(next) !== hubServiceLinesJsonStable(stale)) {
          writeHubServiceLinesCache(userId, next)
          onUpdated?.(next)
        }
      } catch {
        /* ignore */
      }
    })()
  }

  const ric = window.requestIdleCallback
  if (typeof ric === "function") {
    ric(() => run(), { timeout: 2500 })
  } else {
    setTimeout(run, 0)
  }
}

function readCatalogEntryFromStorage(
  userId: string,
  scope: HubCatalogCacheScope = "all",
): { value: HubProductRow[]; timestamp: number } | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = localStorage.getItem(catalogKey(userId, scope))
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

export function readStaleHubCatalogCache(userId: string, scope: HubCatalogCacheScope = "all"): HubProductRow[] | null {
  if (!userId) return null
  const mkey = catalogMemoryKey(userId, scope)
  const mem = memoryCatalogByUser.get(mkey)
  if (mem) return mem.value
  const ls = readCatalogEntryFromStorage(userId, scope)
  if (ls) {
    memoryCatalogByUser.set(mkey, ls)
    return ls.value
  }
  return null
}

export function isHubCatalogCacheFresh(userId: string, scope: HubCatalogCacheScope = "all"): boolean {
  if (!userId) return false
  const ttl = catalogTtlForUser(userId)
  const mkey = catalogMemoryKey(userId, scope)
  const mem = memoryCatalogByUser.get(mkey)
  if (mem) return Date.now() - mem.timestamp < ttl
  const ls = readCatalogEntryFromStorage(userId, scope)
  if (ls) {
    memoryCatalogByUser.set(mkey, ls)
    return Date.now() - ls.timestamp < ttl
  }
  return false
}

export function writeHubCatalogCache(userId: string, products: HubProductRow[], scope: HubCatalogCacheScope = "all") {
  if (typeof window === "undefined" || !userId) return
  const mkey = catalogMemoryKey(userId, scope)
  const entry = { value: products, timestamp: Date.now() }
  memoryCatalogByUser.set(mkey, entry)
  try {
    localStorage.setItem(catalogKey(userId, scope), JSON.stringify(entry))
  } catch {}
}

export function clearHubCatalogCache(userId: string, scope: HubCatalogCacheScope) {
  if (!userId) return
  const mkey = catalogMemoryKey(userId, scope)
  memoryCatalogByUser.delete(mkey)
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(catalogKey(userId, scope))
  } catch {}
}

export function clearHubVendorListCache(userId: string, lineSlug: string) {
  if (!userId || !lineSlug) return
  const mkey = vendorListMemoryKey(userId, lineSlug)
  memoryVendorListByKey.delete(mkey)
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(vendorListStorageKey(userId, lineSlug))
  } catch {}
}

export function clearHubVendorCatalogCache(userId: string, lineSlug: string, vendorSlug: string) {
  if (!userId || !lineSlug || !vendorSlug) return
  const mkey = vendorCatalogMemoryKey(userId, lineSlug, vendorSlug)
  memoryVendorCatalogByKey.delete(mkey)
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(vendorCatalogStorageKey(userId, lineSlug, vendorSlug))
  } catch {}
}

function parseHubVendorList(value: unknown): HubVendorRow[] | null {
  if (!Array.isArray(value)) return null
  const out: HubVendorRow[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string" || typeof o.slug !== "string" || typeof o.name !== "string") continue
    out.push(item as HubVendorRow)
  }
  return out
}

function readVendorListFromStorage(
  userId: string,
  lineSlug: string,
): { value: HubVendorRow[]; timestamp: number } | null {
  if (typeof window === "undefined" || !userId || !lineSlug) return null
  try {
    const raw = localStorage.getItem(vendorListStorageKey(userId, lineSlug))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: unknown; timestamp?: unknown }
    const list = parseHubVendorList(parsed.value)
    if (list === null || typeof parsed.timestamp !== "number") return null
    return { value: list, timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

export function readStaleHubVendorListCache(userId: string, lineSlug: string): HubVendorRow[] | null {
  if (!userId || !lineSlug) return null
  const mkey = vendorListMemoryKey(userId, lineSlug)
  const mem = memoryVendorListByKey.get(mkey)
  if (mem) return mem.value
  const ls = readVendorListFromStorage(userId, lineSlug)
  if (ls) {
    memoryVendorListByKey.set(mkey, ls)
    return ls.value
  }
  return null
}

export function isHubVendorListCacheFresh(userId: string, lineSlug: string): boolean {
  if (!userId || !lineSlug) return false
  const ttl = catalogTtlForUser(userId)
  const mkey = vendorListMemoryKey(userId, lineSlug)
  const mem = memoryVendorListByKey.get(mkey)
  if (mem) return Date.now() - mem.timestamp < ttl
  const ls = readVendorListFromStorage(userId, lineSlug)
  if (ls) {
    memoryVendorListByKey.set(mkey, ls)
    return Date.now() - ls.timestamp < ttl
  }
  return false
}

export function writeHubVendorListCache(userId: string, lineSlug: string, vendors: HubVendorRow[]) {
  if (typeof window === "undefined" || !userId || !lineSlug) return
  const mkey = vendorListMemoryKey(userId, lineSlug)
  const entry = { value: vendors, timestamp: Date.now() }
  memoryVendorListByKey.set(mkey, entry)
  try {
    localStorage.setItem(vendorListStorageKey(userId, lineSlug), JSON.stringify(entry))
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
  const ttl = vendorCatalogTtlForUser(userId)
  const mkey = vendorCatalogMemoryKey(userId, lineSlug, vendorSlug)
  const mem = memoryVendorCatalogByKey.get(mkey)
  if (mem) return Date.now() - mem.timestamp < ttl
  const ls = readVendorCatalogFromStorage(userId, lineSlug, vendorSlug)
  if (ls) {
    memoryVendorCatalogByKey.set(mkey, ls)
    return Date.now() - ls.timestamp < ttl
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

/** Single vendor row for storefront hero (`GET /api/hub/vendors/[slug]?service_line=`). */
function vendorMetaStorageKey(userId: string, lineSlug: string, vendorSlug: string) {
  return `ciuna_hub_vendor_meta_${userId}_${lineSlug}_${vendorSlug}${marketplaceHubCacheKeySuffix(userId)}`
}

function vendorMetaMemoryKey(userId: string, lineSlug: string, vendorSlug: string) {
  return `${userId}::meta::${lineSlug}::${vendorSlug}${marketplaceHubCacheKeySuffix(userId)}`
}

type HubVendorMetaCacheEntry = { vendor: HubVendorRow | null; notFound: boolean; timestamp: number }

const memoryVendorMetaByKey = new Map<string, HubVendorMetaCacheEntry>()

function parseVendorMetaEntry(raw: string): HubVendorMetaCacheEntry | null {
  try {
    const parsed = JSON.parse(raw) as { vendor?: unknown; notFound?: unknown; timestamp?: unknown }
    if (typeof parsed.timestamp !== "number") return null
    if (parsed.notFound === true) {
      return { vendor: null, notFound: true, timestamp: parsed.timestamp }
    }
    const v = parsed.vendor
    if (!v || typeof v !== "object") return null
    const o = v as Record<string, unknown>
    if (typeof o.id !== "string" || typeof o.slug !== "string" || typeof o.name !== "string") return null
    return { vendor: v as HubVendorRow, notFound: false, timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

function readVendorMetaEntryFromStorage(
  userId: string,
  lineSlug: string,
  vendorSlug: string,
): HubVendorMetaCacheEntry | null {
  if (typeof window === "undefined" || !userId || !lineSlug || !vendorSlug) return null
  try {
    const raw = localStorage.getItem(vendorMetaStorageKey(userId, lineSlug, vendorSlug))
    if (!raw) return null
    return parseVendorMetaEntry(raw)
  } catch {
    return null
  }
}

function readVendorMetaEntry(userId: string, lineSlug: string, vendorSlug: string): HubVendorMetaCacheEntry | null {
  if (!userId || !lineSlug || !vendorSlug) return null
  const mkey = vendorMetaMemoryKey(userId, lineSlug, vendorSlug)
  const mem = memoryVendorMetaByKey.get(mkey)
  if (mem) return mem
  const ls = readVendorMetaEntryFromStorage(userId, lineSlug, vendorSlug)
  if (ls) memoryVendorMetaByKey.set(mkey, ls)
  return ls
}

export type HubVendorMetaStaleRead = { kind: "none" } | { kind: "found"; vendor: HubVendorRow } | { kind: "not_found" }

export function readStaleHubVendorMetaCache(
  userId: string,
  lineSlug: string,
  vendorSlug: string,
): HubVendorMetaStaleRead {
  const e = readVendorMetaEntry(userId, lineSlug, vendorSlug)
  if (!e) return { kind: "none" }
  if (e.notFound) return { kind: "not_found" }
  if (e.vendor) return { kind: "found", vendor: e.vendor }
  return { kind: "none" }
}

export function isHubVendorMetaCacheFresh(userId: string, lineSlug: string, vendorSlug: string): boolean {
  if (!userId || !lineSlug || !vendorSlug) return false
  const ttl = vendorCatalogTtlForUser(userId)
  const e = readVendorMetaEntry(userId, lineSlug, vendorSlug)
  if (!e) return false
  return Date.now() - e.timestamp < ttl
}

/** `vendor === null` caches a resolved 404 from the vendor-by-slug API. */
export function writeHubVendorMetaCache(userId: string, lineSlug: string, vendorSlug: string, vendor: HubVendorRow | null) {
  if (typeof window === "undefined" || !userId || !lineSlug || !vendorSlug) return
  const mkey = vendorMetaMemoryKey(userId, lineSlug, vendorSlug)
  const entry: HubVendorMetaCacheEntry = {
    vendor,
    notFound: !vendor,
    timestamp: Date.now(),
  }
  memoryVendorMetaByKey.set(mkey, entry)
  try {
    localStorage.setItem(vendorMetaStorageKey(userId, lineSlug, vendorSlug), JSON.stringify(entry))
  } catch {}
}
