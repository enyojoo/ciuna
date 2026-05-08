export interface HubVendorRow {
  id: string
  service_line_slug: string
  name: string
  slug: string
  photo_url: string | null
  short_bio: string | null
  /** Shown on the hub vendor storefront (e.g. city or “Online”). */
  location?: string | null
  is_published: boolean
  /** Ciuna-verified vendor badge on product cards (optional until DB column exists). */
  is_verified?: boolean | null
  created_at: string
  updated_at: string
}
