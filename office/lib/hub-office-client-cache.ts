/** Keys shared by Hub admin list UIs (`office-hub-products-view`, `office-hub-vendors-view`). */
export const OFFICE_HUB_PRODUCTS_CACHE_KEY = "office_hub_products_cache"
export const OFFICE_HUB_VENDORS_CACHE_KEY = "office_hub_vendors_list_cache"

export function clearOfficeHubProductsListCache() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(OFFICE_HUB_PRODUCTS_CACHE_KEY)
  } catch {
    /* ignore */
  }
}

export function clearOfficeHubVendorsListCache() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(OFFICE_HUB_VENDORS_CACHE_KEY)
  } catch {
    /* ignore */
  }
}
