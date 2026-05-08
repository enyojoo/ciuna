"use client"

import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import type { HubProductRow } from "@/lib/hub-types"
import type { HubVendorRow } from "@/lib/hub-vendor-types"
import type { HubServiceLineRow } from "@/lib/hub-service-line-types"
import {
  isHubVendorCatalogCacheFresh,
  readStaleHubServiceLinesCache,
  readStaleHubVendorCatalogCache,
  writeHubServiceLinesCache,
  writeHubVendorCatalogCache,
} from "@/lib/hub-client-cache"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { VendorHubCatalog } from "@/components/hub/vendor-hub-catalog"
import { sortHubCatalogProducts } from "@/lib/hub-catalog-utils"

const MARKETPLACE = new Set(["food", "mart"])

function VendorCatalogInner({ lineSlug, vendorSlug, cacheUserId }: { lineSlug: string; vendorSlug: string; cacheUserId: string }) {
  const { t } = useTranslation("app")
  const vendorBasePath = `/hub/${lineSlug}/v/${encodeURIComponent(vendorSlug)}`
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [loading, setLoading] = useState(false)

  useLayoutEffect(() => {
    if (!cacheUserId) return
    setProducts((prev) => {
      if (prev.length > 0) return prev
      const stale = readStaleHubVendorCatalogCache(cacheUserId, lineSlug, vendorSlug)
      if (stale && stale.length > 0) return sortHubCatalogProducts(stale)
      return prev
    })
    const stale = readStaleHubVendorCatalogCache(cacheUserId, lineSlug, vendorSlug)
    const hasRows = (stale?.length ?? 0) > 0
    const fresh = isHubVendorCatalogCacheFresh(cacheUserId, lineSlug, vendorSlug)
    if (!fresh && !hasRows) setLoading(true)
    else setLoading(false)
  }, [cacheUserId, lineSlug, vendorSlug])

  useEffect(() => {
    if (!cacheUserId || !MARKETPLACE.has(lineSlug)) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth(
          `/api/hub/vendors/${encodeURIComponent(vendorSlug)}/products?service_line=${encodeURIComponent(lineSlug)}`,
          { cache: "no-store" },
        )
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        const list = sortHubCatalogProducts((data.products || []) as HubProductRow[])
        if (!cancelled) {
          setProducts(list)
          writeHubVendorCatalogCache(cacheUserId, lineSlug, vendorSlug, list)
        }
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [cacheUserId, lineSlug, vendorSlug])

  return <VendorHubCatalog products={products} loading={loading} vendorBasePath={vendorBasePath} />
}

export default function HubVendorStorefrontPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation("app")
  const lineSlug = String(params?.slug || "").trim().toLowerCase()
  const vendorSlug = String(params?.vendorSlug || "").trim().toLowerCase()
  const { user, userProfile, loading: authLoading } = useAuth()
  const cacheUserId = user?.id ?? userProfile?.id ?? ""
  const [lines, setLines] = useState<HubServiceLineRow[]>([])
  const [linesLoaded, setLinesLoaded] = useState(false)
  const [vendor, setVendor] = useState<HubVendorRow | null>(null)

  const line = useMemo(() => lines.find((l) => l.slug === lineSlug) ?? null, [lines, lineSlug])

  useLayoutEffect(() => {
    if (!cacheUserId) return
    const stale = readStaleHubServiceLinesCache(cacheUserId)
    if (stale !== null) {
      setLines(stale)
      setLinesLoaded(true)
    }
  }, [cacheUserId])

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    const userId = user.id
    let cancelled = false
    const silent = readStaleHubServiceLinesCache(userId) !== null
    ;(async () => {
      try {
        const res = await fetchWithAuth("/api/hub/service-lines", { cache: "no-store" })
        if (!res.ok) throw new Error("lines")
        const data = await res.json()
        const next = (data.serviceLines || []) as HubServiceLineRow[]
        if (!cancelled) {
          setLines(next)
          writeHubServiceLinesCache(userId, next)
        }
      } catch {
        if (!cancelled && !silent) setLines([])
      } finally {
        if (!cancelled) setLinesLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || !cacheUserId || !MARKETPLACE.has(lineSlug) || !vendorSlug) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth(`/api/hub/vendors?service_line=${encodeURIComponent(lineSlug)}`, { cache: "no-store" })
        if (!res.ok) throw new Error("vendors")
        const data = await res.json()
        const list = (data.vendors || []) as HubVendorRow[]
        const v = list.find((x) => x.slug === vendorSlug) ?? null
        if (!cancelled) setVendor(v)
      } catch {
        if (!cancelled) setVendor(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, cacheUserId, lineSlug, vendorSlug])

  useEffect(() => {
    if (lineSlug && !MARKETPLACE.has(lineSlug)) {
      router.replace("/hub")
    }
  }, [lineSlug, router])

  const title = vendor?.name || vendorSlug || t("hub.hub")
  const subtitle = vendor?.short_bio || line?.short_description || null

  if (!user) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!MARKETPLACE.has(lineSlug)) {
    return (
      <div className="min-w-0 px-4 py-8 text-center text-sm text-muted-foreground">
        {t("hub.redirecting", { defaultValue: "Redirecting…" })}
      </div>
    )
  }

  const unavailable = linesLoaded && (!line || !line.is_enabled)

  if (unavailable) {
    return (
      <HubLinePageShell
        title={t("hub.unavailableTitle")}
        subtitle={null}
        backToHubAriaLabel={t("hub.backToHub")}
      >
        <p className="text-center text-sm text-muted-foreground">{t("hub.serviceUnavailable")}</p>
      </HubLinePageShell>
    )
  }

  return (
    <HubLinePageShell title={title} subtitle={subtitle} backToHubAriaLabel={t("hub.backToHub")}>
      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-9 w-full max-w-xs rounded bg-muted" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <VendorCatalogInner lineSlug={lineSlug} vendorSlug={vendorSlug} cacheUserId={cacheUserId} />
      </Suspense>
    </HubLinePageShell>
  )
}
