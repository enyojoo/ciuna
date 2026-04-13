"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil } from "lucide-react"
import { officeFetch } from "@/lib/api-client"

type HubProduct = {
  id: string
  title: string
  category: string
  status: string
  pricing_type: string
  fixed_amount: number | null
  fixed_currency: string | null
  fee_percent: number | null
  updated_at: string
}

export default function OfficeHubProductsPage() {
  const [products, setProducts] = useState<HubProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await officeFetch("/api/admin/hub/products")
        if (!res.ok) throw new Error("Failed to load")
        const data = await res.json()
        if (!cancelled) setProducts(data.products || [])
      } catch (e) {
        if (!cancelled) setError("Could not load Hub products")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <OfficeDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hub products</h1>
            <p className="text-gray-600">Create and publish marketplace services for the Ciuna app.</p>
          </div>
          <Button asChild>
            <Link href="/hub/new">
              <Plus className="h-4 w-4 mr-2" />
              New product
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500">No products yet. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price / fee</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.pricing_type === "user_input" ? "User input" : "Fixed"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            p.status === "live"
                              ? "bg-green-100 text-green-800"
                              : p.status === "archived"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-yellow-100 text-yellow-900"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {p.pricing_type === "fixed"
                          ? `${p.fixed_amount ?? "—"} ${p.fixed_currency ?? ""}`.trim()
                          : `Fee ${p.fee_percent ?? 0}%`}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/hub/${p.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </OfficeDashboardLayout>
  )
}
