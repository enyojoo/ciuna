"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HubProductRow } from "@/lib/hub-types"

export default function HubProductDetailPage() {
  const params = useParams()
  const productId = params.productId as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<HubProductRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/auth/login")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth(`/api/hub/products/${productId}`)
        if (!res.ok) throw new Error("404")
        const data = await res.json()
        if (!cancelled) setProduct(data.product)
      } catch {
        if (!cancelled) setProduct(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, productId, router])

  if (authLoading || loading) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title="Hub" backHref="/hub" />
        <div className="px-4 py-8 text-gray-500">Loading…</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title="Hub" backHref="/hub" />
        <div className="px-4 py-8">
          <p className="text-red-600">Product not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/hub">Back to Hub</Link>
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
                  No product image
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
              <p className="text-sm text-gray-600">You choose the amount to cover ({product.default_input_currency || "USD"}). A service fee applies.</p>
            )}
          </CardContent>
        </Card>
        <Button asChild className="w-full">
          <Link href={`/hub/checkout/${productId}`}>{product.pricing_type === "fixed" ? "Buy now" : "Order now"}</Link>
        </Button>
      </div>
    </div>
  )
}
