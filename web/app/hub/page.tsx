"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HubProductRow } from "@/lib/hub-types"
import { ChevronRight } from "lucide-react"

const HERO_TITLE = "Ciuna Hub"
const HERO_SUBTITLE = "A marketplace to order foreign services and products you need."

function formatPrice(amount: number | null, currency: string | null): string {
  if (amount == null) return "—"
  return `${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ""}`.trim()
}

export default function HubCatalogPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<HubProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const selectedCategory = (searchParams.get("category") || "").trim()

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

  const grouped = useMemo(() => {
    const map = new Map<string, HubProductRow[]>()
    for (const p of products) {
      const key = (p.category || "Other").trim() || "Other"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    const entries = Array.from(map.entries()).map(([category, rows]) => ({ category, rows }))
    entries.sort((a, b) => a.category.localeCompare(b.category))
    return entries
  }, [products])

  const visibleSections = selectedCategory
    ? grouped.filter((g) => g.category.toLowerCase() === selectedCategory.toLowerCase())
    : grouped

  if (authLoading || (!user && !loading)) {
    return (
      <div className="min-w-0">
        <div className="px-4 py-5 sm:px-6 mx-auto w-full max-w-5xl space-y-5 animate-pulse">
          <div className="rounded-2xl bg-gray-100 h-28" />
          <div className="space-y-3">
            <div className="h-8 w-40 rounded bg-gray-100" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[150px] h-[210px] rounded-xl bg-gray-100 shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <div className="px-4 py-5 sm:px-6 space-y-5 mx-auto w-full max-w-5xl">
        <section className="rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-5 py-6 text-white shadow-sm">
          <h2 className="text-2xl font-bold leading-tight">{HERO_TITLE}</h2>
          <p className="mt-2 text-sm/6 text-orange-50 max-w-xl">{HERO_SUBTITLE}</p>
        </section>

        {selectedCategory ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing category: <span className="font-semibold">{selectedCategory}</span>
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/hub">All categories</Link>
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2].map((row) => (
              <section key={row} className="space-y-3">
                <div className="h-8 w-36 rounded bg-gray-100" />
                <div className="flex gap-3 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`${row}-${i}`} className="w-[150px] h-[210px] rounded-xl bg-gray-100 shrink-0" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : products.length === 0 || visibleSections.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">No products available yet.</CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {visibleSections.map(({ category, rows }) => (
              <section key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">{category}</h3>
                  <Button asChild variant="ghost" size="sm" className="text-primary">
                    <Link href={`/hub?category=${encodeURIComponent(category)}`}>
                      All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
                  <div className="flex gap-3 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {(selectedCategory ? rows : rows.slice(0, 12)).map((p) => (
                      <Card
                        key={p.id}
                        className="group w-[31vw] max-w-[180px] min-w-[150px] sm:w-auto sm:max-w-none sm:min-w-0 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-0">
                          <Link href={`/hub/${p.id}`} className="block">
                            <div className="aspect-[4/3] w-full bg-gray-100">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                                  No image
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="p-2.5 space-y-2">
                            <Link href={`/hub/${p.id}`} className="block">
                              <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">{p.title}</p>
                              {p.short_description ? (
                                <p className="line-clamp-1 text-xs text-gray-500 mt-1">{p.short_description}</p>
                              ) : null}
                            </Link>
                            <div className="space-y-2">
                              {p.pricing_type === "fixed" ? (
                                <p className="text-base font-semibold text-gray-900">
                                  {formatPrice(p.fixed_amount, p.fixed_currency)}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-600">Set amount</p>
                              )}
                              <Button asChild size="sm" className="w-full h-8 text-xs">
                                <Link href={`/hub/${p.id}`}>{p.pricing_type === "fixed" ? "Buy" : "Order"}</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
