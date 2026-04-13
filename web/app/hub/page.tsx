"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HubProductRow } from "@/lib/hub-types"

export default function HubCatalogPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<HubProductRow[]>([])
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
        const res = await fetchWithAuth("/api/hub/products")
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        if (!cancelled) setProducts(data.products || [])
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, router])

  if (authLoading || (!user && !loading)) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title="Hub" backHref="/dashboard" />
        <div className="px-4 py-8 text-gray-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-0">
      <AppPageHeader title="Hub" backHref="/dashboard" />
      <div className="px-4 py-5 sm:px-6 space-y-4 max-w-3xl mx-auto">
        <p className="text-sm text-gray-600">Services you can order and pay for through Ciuna.</p>
        {loading ? (
          <p className="text-gray-500">Loading products…</p>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">No products available yet.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <Link key={p.id} href={`/hub/${p.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase text-gray-500">{p.category}</p>
                        <h2 className="text-lg font-semibold text-gray-900 truncate">{p.title}</h2>
                        {p.short_description ? (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.short_description}</p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        {p.pricing_type === "fixed" ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {p.fixed_amount} {p.fixed_currency}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">You set amount + fee</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
