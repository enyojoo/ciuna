import type { MetadataRoute } from "next"

const ICON =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20favicon.png"

/**
 * Web App Manifest — keep `display: "standalone"` unless product explicitly wants
 * `fullscreen` (more immersive, worse OS ergonomics; QA on real devices required).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "https://app.ciuna.com/",
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
        src: ICON,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
