import { supabase } from "@/lib/supabase"
import { HUB_ASSETS_BUCKET } from "@/lib/hub-assets-bucket"

const HUB_ICON_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const

function isHubIconSvg(file: File): boolean {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
}

function isAllowedHubIconFile(file: File): boolean {
  if ((HUB_ICON_ALLOWED_MIME as readonly string[]).includes(file.type)) return true
  if (isHubIconSvg(file) && (file.type === "" || file.type === "application/octet-stream")) return true
  return false
}

function hubIconExtension(file: File): string {
  if (isHubIconSvg(file)) return "svg"
  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"
  if (file.type === "image/jpeg") return "jpg"
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName === "jpeg" || fromName === "jpg") return "jpg"
  if (fromName === "png" || fromName === "webp" || fromName === "svg") return fromName
  return "png"
}

function hubIconContentType(file: File, ext: string): string {
  if (file.type && file.type !== "application/octet-stream") return file.type
  if (ext === "svg") return "image/svg+xml"
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"
  return "image/jpeg"
}

async function uploadToHubAssets(path: string, file: File, contentType: string): Promise<string> {
  const { error } = await supabase.storage.from(HUB_ASSETS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  })
  if (error) throw error
  const {
    data: { publicUrl },
  } = supabase.storage.from(HUB_ASSETS_BUCKET).getPublicUrl(path)
  return publicUrl
}

const PRODUCT_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const

function isProductSvg(file: File): boolean {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
}

function isAllowedProductFile(file: File): boolean {
  if ((PRODUCT_ALLOWED_MIME as readonly string[]).includes(file.type)) return true
  return isProductSvg(file) && (file.type === "" || file.type === "application/octet-stream")
}

function productExt(file: File): string {
  if (isProductSvg(file)) return "svg"
  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"
  if (file.type === "image/jpeg") return "jpg"
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName === "jpeg" || fromName === "jpg") return "jpg"
  if (fromName === "png" || fromName === "webp" || fromName === "svg") return fromName
  return "png"
}

function productContentType(file: File, ext: string): string {
  if (file.type && file.type !== "application/octet-stream") return file.type
  if (ext === "svg") return "image/svg+xml"
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"
  return "image/jpeg"
}

/** Hub product hero/grid image (JPG, PNG, WebP, SVG). Always uploaded to the hub-assets bucket, not payment QR storage. */
export async function uploadHubProductImage(file: File): Promise<string> {
  if (!isAllowedProductFile(file)) {
    throw new Error("Only JPG, PNG, WebP, or SVG files are allowed.")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or less.")
  }
  const ext = productExt(file)
  const path = `hub-products/hub_${Date.now()}.${ext}`
  return uploadToHubAssets(path, file, productContentType(file, ext))
}

/** Hub vendor logo / photo in Office admin (JPG, PNG, WebP, SVG). */
export async function uploadHubVendorPhoto(file: File): Promise<string> {
  if (!isAllowedProductFile(file)) {
    throw new Error("Only JPG, PNG, WebP, or SVG files are allowed.")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or less.")
  }
  const ext = productExt(file)
  const path = `hub-vendors/vendor_${Date.now()}.${ext}`
  return uploadToHubAssets(path, file, productContentType(file, ext))
}

/** Expert profile photo in Office admin (JPG, PNG, WebP, SVG). */
export async function uploadHubExpertPhoto(file: File): Promise<string> {
  if (!isAllowedProductFile(file)) {
    throw new Error("Only JPG, PNG, WebP, or SVG files are allowed.")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or less.")
  }
  const ext = productExt(file)
  const path = `hub-experts/expert_${Date.now()}.${ext}`
  return uploadToHubAssets(path, file, productContentType(file, ext))
}

/** Hub service line tile icon (JPG, PNG, WebP, SVG). */
export async function uploadHubServiceLineIcon(file: File): Promise<string> {
  if (!isAllowedHubIconFile(file)) {
    throw new Error("Only JPG, PNG, WebP, or SVG files are allowed.")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File must be 5MB or less.")
  }
  const ext = hubIconExtension(file)
  const path = `hub-service-lines/line_${Date.now()}.${ext}`
  return uploadToHubAssets(path, file, hubIconContentType(file, ext))
}
