import type { HubProductRow } from "@/lib/hub-types"

const CATALOG_TTL_MS = 5 * 60 * 1000
const PRODUCT_TTL_MS = 5 * 60 * 1000

function catalogKey(userId: string) {
  return `ciuna_hub_products_${userId}`
}

function productKey(userId: string, productId: string) {
  return `ciuna_hub_product_${userId}_${productId}`
}

export function readStaleHubCatalogCache(userId: string): HubProductRow[] | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = localStorage.getItem(catalogKey(userId))
    if (!raw) return null
    const { value } = JSON.parse(raw)
    return Array.isArray(value) ? (value as HubProductRow[]) : null
  } catch {
    return null
  }
}

export function isHubCatalogCacheFresh(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false
  try {
    const raw = localStorage.getItem(catalogKey(userId))
    if (!raw) return false
    const { timestamp } = JSON.parse(raw)
    return Date.now() - timestamp < CATALOG_TTL_MS
  } catch {
    return false
  }
}

export function writeHubCatalogCache(userId: string, products: HubProductRow[]) {
  if (typeof window === "undefined" || !userId) return
  try {
    localStorage.setItem(
      catalogKey(userId),
      JSON.stringify({ value: products, timestamp: Date.now() }),
    )
  } catch {}
}

export function readStaleHubProductCache(userId: string, productId: string): HubProductRow | null {
  if (typeof window === "undefined" || !userId || !productId) return null
  try {
    const raw = localStorage.getItem(productKey(userId, productId))
    if (!raw) return null
    const { value } = JSON.parse(raw)
    return value && typeof value === "object" && typeof (value as HubProductRow).id === "string"
      ? (value as HubProductRow)
      : null
  } catch {
    return null
  }
}

export function isHubProductCacheFresh(userId: string, productId: string): boolean {
  if (typeof window === "undefined" || !userId || !productId) return false
  try {
    const raw = localStorage.getItem(productKey(userId, productId))
    if (!raw) return false
    const { timestamp } = JSON.parse(raw)
    return Date.now() - timestamp < PRODUCT_TTL_MS
  } catch {
    return false
  }
}

export function writeHubProductCache(userId: string, product: HubProductRow) {
  if (typeof window === "undefined" || !userId || !product?.id) return
  try {
    localStorage.setItem(
      productKey(userId, product.id),
      JSON.stringify({ value: product, timestamp: Date.now() }),
    )
  } catch {}
}
