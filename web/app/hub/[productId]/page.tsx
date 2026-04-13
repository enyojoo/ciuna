"use client"

import { useEffect, useLayoutEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HubProductRow } from "@/lib/hub-types"
import {
  isHubProductCacheFresh,
  readStaleHubProductCache,
  writeHubProductCache,
} from "@/lib/hub-client-cache"

export default function HubProductDetailPage() {
  const { t } = useTranslation("app")
  const params = useParams()
  const productId = params.productId as string
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<HubProductRow | null>(null)
  const [loading, setLoading] = useState(false)
  const cacheUserId = userProfile?.id ?? user?.id ?? ""

  useLayoutEffect(() => {
    if (!cacheUserId || !productId) return
    setProduct((prev) => {
      if (prev) return prev
      return readStaleHubProductCache(cacheUserId, productId)
    })
    const stale = readStaleHubProductCache(cacheUserId, productId)
    const hasProduct = Boolean(stale)
    const cacheFresh = isHubProductCacheFresh(cacheUserId, productId)
    if (!cacheFresh && !hasProduct) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [cacheUserId, productId])

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    if (!cacheUserId || !productId) return
    if (isHubProductCacheFresh(cacheUserId, productId)) {
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth(`/api/hub/products/${productId}`)
        if (!res.ok) throw new Error("404")
        const data = await res.json()
        const row = data.product as HubProductRow
        if (!cancelled) {
          setProduct(row)
          if (row) writeHubProductCache(cacheUserId, row)
        }
      } catch {
        if (!cancelled) setProduct(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, productId, router, cacheUserId])

  const showSkeleton = !user || (loading && !product)

  if (showSkeleton) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title={t("hub.hub")} backHref="/hub" />
        <div className="px-4 py-5 sm:px-6 max-w-2xl mx-auto space-y-4 animate-pulse">
          <div className="rounded-2xl bg-gray-100 h-60" />
          <div className="h-6 w-2/3 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
          <div className="h-10 w-full rounded bg-gray-100" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title={t("hub.hub")} backHref="/hub" />
        <div className="px-4 py-8">
          <p className="text-red-600">{t("hub.productNotFound")}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/hub">{t("hub.backToHub")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-0">
      <AppPageHeader title={product.title} backHref="/hub" />
      <div className="px-4 py-5 sm:px-6 max-w-2xl mx-auto space-y-4">
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                  {t("hub.noProductImage")}
                </div>
              )}
            </div>
            <p className="text-xs font-medium uppercase text-gray-500">{product.category}</p>
            {product.long_description || product.short_description ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.long_description || product.short_description}</p>
            ) : null}
            {product.sla_text ? <p className="text-sm text-gray-600 border-t pt-3">{product.sla_text}</p> : null}
            {product.pricing_type === "fixed" ? (
              <p className="text-lg font-semibold">
                {product.fixed_amount} {product.fixed_currency}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                {t("hub.userInputPricingHint", { currency: product.default_input_currency || "USD" })}
              </p>
            )}
          </CardContent>
        </Card>
        <Button asChild className="w-full">
          <Link href={`/hub/checkout/${productId}`}>
            {product.pricing_type === "fixed" ? t("hub.buyNow") : t("hub.orderNow")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
