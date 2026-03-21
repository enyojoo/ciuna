import type { MetadataRoute } from "next"

const ICON =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20favicon.png"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ciuna",
    short_name: "Ciuna",
    description: "Send money globally with Ciuna.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fafafa",
    theme_color: "#f97316",
    icons: [
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
