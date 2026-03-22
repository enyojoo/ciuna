import type { MetadataRoute } from "next"

import { PWA_APP_ICON_URL } from "@/lib/pwa-brand"

/**
 * Web App Manifest — keep `display: "standalone"` unless product explicitly wants
 * `fullscreen` (more immersive, worse OS ergonomics; QA on real devices required).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Omit `id`: a hardcoded production URL breaks on other origins (e.g. ciuna.vercel.app) and is ignored.
    name: "Ciuna",
    short_name: "Ciuna",
    description: "Send money globally with Ciuna.",
    start_url: "/dashboard?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fafafa",
    theme_color: "#f97316",
    categories: ["finance", "business"],
    icons: [
      {
        src: PWA_APP_ICON_URL,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_APP_ICON_URL,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_APP_ICON_URL,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
