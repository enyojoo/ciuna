export type HubMarketplaceLineSlug = "food" | "mart"

export function hubProductsPath(line: HubMarketplaceLineSlug): string {
  return `/${line}/products`
}

export function hubVendorsPath(line: HubMarketplaceLineSlug): string {
  return `/${line}/vendors`
}

export function hubProductNewPath(line: HubMarketplaceLineSlug): string {
  return `/${line}/products/new`
}

export function hubProductEditPath(productId: string): string {
  return `/products/${productId}/edit`
}
