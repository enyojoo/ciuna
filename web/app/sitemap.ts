import type { MetadataRoute } from "next"

import { SEO_SITE_URL } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEO_SITE_URL

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/auth/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/auth/forgot-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/auth/reset-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]
}
