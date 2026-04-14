"use client"

import { useEffect, useMemo, useState } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pencil, Loader2, ImagePlus } from "lucide-react"
import { officeFetch } from "@/lib/api-client"
import { useOfficeData } from "@/hooks/use-office-data"
import { supabase } from "@/lib/supabase"

type HubProduct = {
  id: string
  title: string
  image_url?: string | null
  category: string
  status: string
  pricing_type: string
  fixed_amount: number | null
  fixed_currency: string | null
  fee_percent: number | null
  is_featured?: boolean
  updated_at: string
}

function parseSlaTextToTimer(sla: string | null | undefined): { hours: number; minutes: number; seconds: number } {
  const raw = String(sla || "").trim()
  if (!raw) return { hours: 1, minutes: 0, seconds: 0 }

  const hhmmss = raw.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/)
  if (hhmmss) {
    return {
      hours: Math.max(0, Number.parseInt(hhmmss[1], 10) || 0),
      minutes: Math.max(0, Math.min(59, Number.parseInt(hhmmss[2], 10) || 0)),
      seconds: Math.max(0, Math.min(59, Number.parseInt(hhmmss[3], 10) || 0)),
    }
  }

  const h = raw.match(/(\d+)\s*h/i)
  const m = raw.match(/(\d+)\s*m/i)
  const s = raw.match(/(\d+)\s*s/i)
  if (h || m || s) {
    return {
      hours: Math.max(0, Number.parseInt(h?.[1] || "0", 10) || 0),
      minutes: Math.max(0, Math.min(59, Number.parseInt(m?.[1] || "0", 10) || 0)),
      seconds: Math.max(0, Math.min(59, Number.parseInt(s?.[1] || "0", 10) || 0)),
    }
  }

  return { hours: 1, minutes: 0, seconds: 0 }
}

export default function OfficeHubProductsPage() {
  const { data: officeData } = useOfficeData()
  const [products, setProducts] = useState<HubProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [slaTimer, setSlaTimer] = useState({ hours: 1, minutes: 0, seconds: 0 })
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    category: "Other",
    status: "draft",
    pricing_type: "fixed",
    fixed_amount: "",
    fixed_currency: "USD",
    default_input_currency: "USD",
    fee_percent: "5",
    funded_min: "",
    funded_max: "",
    sla_text: "",
    image_url: "",
    is_featured: false,
  })

  const DEFAULT_CATEGORIES = ["Connectivity", "Card Payment", "AI Tools", "Entertainment"]
  const CATEGORIES = useMemo(() => {
    const fromProducts = products
      .map((p) => String(p.category || "").trim())
      .filter(Boolean)
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]))
  }, [products])
  const filteredCategories = useMemo(() => {
    const q = form.category.trim().toLowerCase()
    if (!q) return CATEGORIES
    // When a known category is selected, show full list on focus/click.
    if (CATEGORIES.some((c) => c.toLowerCase() === q)) return CATEGORIES
    return CATEGORIES.filter((c) => c.toLowerCase().includes(q))
  }, [form.category])

  const resetForm = () => {
    setForm({
      title: "",
      short_description: "",
      category: "Other",
      status: "draft",
      pricing_type: "fixed",
      fixed_amount: "",
      fixed_currency: "USD",
      default_input_currency: "USD",
      fee_percent: "5",
      funded_min: "",
      funded_max: "",
      sla_text: "",
      image_url: "",
      is_featured: false,
    })
    setSlaTimer({ hours: 1, minutes: 0, seconds: 0 })
  }

  const loadProducts = async () => {
    const res = await officeFetch("/api/admin/hub/products")
    if (!res.ok) throw new Error("Failed to load")
    const data = await res.json()
    setProducts(data.products || [])
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadProducts()
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

  const uploadProductImage = async (file: File): Promise<string> => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) throw new Error("Only JPG, PNG, or WEBP files are allowed.")
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5MB or less.")
    const ext = file.name.split(".").pop() || "png"
    const path = `hub-products/hub_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("payment-qr-codes").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })
    if (error) throw error
    const {
      data: { publicUrl },
    } = supabase.storage.from("payment-qr-codes").getPublicUrl(path)
    return publicUrl
  }

  const openCreate = () => {
    setEditingId(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = async (id: string) => {
    try {
      const res = await officeFetch(`/api/admin/hub/products/${id}`)
      if (!res.ok) throw new Error("Failed to load product")
      const { product } = await res.json()
      setEditingId(id)
      setForm({
        title: product.title || "",
        short_description: product.short_description || "",
        category: product.category || "Other",
        status: product.status || "draft",
        pricing_type: product.pricing_type || "fixed",
        fixed_amount: product.fixed_amount != null ? String(product.fixed_amount) : "",
        fixed_currency: product.fixed_currency || "USD",
        default_input_currency: product.default_input_currency || "USD",
        fee_percent: product.fee_percent != null ? String(product.fee_percent) : "0",
        funded_min: product.funded_min != null ? String(product.funded_min) : "",
        funded_max: product.funded_max != null ? String(product.funded_max) : "",
        sla_text: product.sla_text || "",
        image_url: product.image_url || "",
        is_featured: Boolean(product.is_featured),
      })
      setSlaTimer(parseSlaTextToTimer(product.sla_text))
      setDialogOpen(true)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not load product")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        short_description: form.short_description || null,
        category: form.category,
        status: form.status,
        pricing_type: form.pricing_type,
        fixed_amount: form.pricing_type === "fixed" ? Number(form.fixed_amount) || null : null,
        fixed_currency: form.pricing_type === "fixed" ? form.fixed_currency : null,
        default_input_currency: form.default_input_currency,
        fee_percent: Number(form.fee_percent) || 0,
        funded_min: form.funded_min ? Number(form.funded_min) : null,
        funded_max: form.funded_max ? Number(form.funded_max) : null,
        sla_text: `${slaTimer.hours}:${String(slaTimer.minutes).padStart(2, "0")}:${String(slaTimer.seconds).padStart(2, "0")}`,
        image_url: form.image_url || null,
        is_featured: form.is_featured,
      }

      const path = editingId ? `/api/admin/hub/products/${editingId}` : "/api/admin/hub/products"
      const method = editingId ? "PATCH" : "POST"
      const res = await officeFetch(path, { method, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || (editingId ? "Update failed" : "Create failed"))
      }
      await loadProducts()
      setDialogOpen(false)
      setEditingId(null)
      resetForm()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hub products</h1>
            <p className="text-gray-600">Create and publish marketplace services for the Ciuna app.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                New product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&_input[type=number]]:[-moz-appearance:textfield] [&_input[type=number]::-webkit-inner-spin-button]:appearance-none [&_input[type=number]::-webkit-outer-spin-button]:appearance-none">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Hub product" : "New Hub product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="short">Short description</Label>
                  <Input id="short" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
                  <div className="space-y-2 flex flex-col">
                  <Label htmlFor="image">Product image</Label>
                  <label
                    htmlFor="image"
                    className="flex h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center hover:bg-gray-100"
                  >
                    <ImagePlus className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {uploadingImage ? "Uploading..." : "Click to upload product image"}
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, WEBP - max 5MB. Recommended 4:3 ratio (1200 x 900px), not square.
                    </span>
                  </label>
                  <Input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setUploadingImage(true)
                        const url = await uploadProductImage(file)
                        setForm((prev) => ({ ...prev, image_url: url }))
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Image upload failed")
                      } finally {
                        setUploadingImage(false)
                      }
                    }}
                  />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label>Preview</Label>
                    <div className="h-[220px] w-full overflow-hidden rounded-lg border bg-gray-100">
                      {form.image_url ? (
                        <div className="h-full w-full flex items-center justify-center p-2">
                          <div className="h-full w-full overflow-hidden rounded-md bg-gray-200">
                            <img src={form.image_url} alt="Product preview" className="h-full w-full object-contain" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-2">
                          <div className="aspect-[4/3] w-full max-h-full rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                            4:3 preview area
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <div className="relative">
                      <Input
                        value={form.category}
                        onFocus={() => setCategoryMenuOpen(true)}
                        onBlur={() => setTimeout(() => setCategoryMenuOpen(false), 120)}
                        onChange={(e) => {
                          setForm({ ...form, category: e.target.value })
                          setCategoryMenuOpen(true)
                        }}
                        placeholder="Select or type category"
                      />
                      {categoryMenuOpen ? (
                        <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-white shadow-sm">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((c) => (
                              <button
                                key={c}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setForm({ ...form, category: c })
                                  setCategoryMenuOpen(false)
                                }}
                              >
                                {c}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No suggestion. Press save to use custom value.</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  <Checkbox
                    id="hub-featured"
                    checked={form.is_featured}
                    onCheckedChange={(v) => setForm({ ...form, is_featured: v === true })}
                  />
                  <Label htmlFor="hub-featured" className="text-sm font-normal cursor-pointer">
                    Featured (shows first in app Hub catalog)
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pricing type</Label>
                    <Select value={form.pricing_type} onValueChange={(v) => setForm({ ...form, pricing_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed amount</SelectItem>
                        <SelectItem value="user_input">User input amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fee %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.fee_percent}
                      onChange={(e) => setForm({ ...form, fee_percent: e.target.value })}
                    />
                  </div>
                </div>
                {form.pricing_type === "fixed" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <Input type="number" step="0.01" value={form.fixed_amount} onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Currency</Label>
                        <Select value={form.fixed_currency} onValueChange={(v) => setForm({ ...form, fixed_currency: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[220px] overflow-y-auto">
                            {(officeData?.currencies?.length ? officeData.currencies.filter((c: { code?: string; status?: string }) => c?.code && c.status !== "inactive") : [{ code: "USD", name: "US Dollar", flag_svg: "" }]).map((c: any) => (
                              <SelectItem key={c.code} value={c.code}>
                                <span className="inline-flex items-center gap-2">
                                  {c.flag_svg ? <span className="h-4 w-4 shrink-0" dangerouslySetInnerHTML={{ __html: c.flag_svg }} /> : null}
                                  <span>{c.code}</span>
                                  {c.name ? <span className="text-gray-500">— {c.name}</span> : null}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default input currency</Label>
                      <Select value={form.default_input_currency} onValueChange={(v) => setForm({ ...form, default_input_currency: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[220px] overflow-y-auto">
                          {(officeData?.currencies?.length ? officeData.currencies.filter((c: { code?: string; status?: string }) => c?.code && c.status !== "inactive") : [{ code: "USD", name: "US Dollar", flag_svg: "" }]).map((c: any) => (
                            <SelectItem key={c.code} value={c.code}>
                              <span className="inline-flex items-center gap-2">
                                {c.flag_svg ? <span className="h-4 w-4 shrink-0" dangerouslySetInnerHTML={{ __html: c.flag_svg }} /> : null}
                                <span>{c.code}</span>
                                {c.name ? <span className="text-gray-500">— {c.name}</span> : null}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Funded min (optional)</Label>
                      <Input type="number" step="0.01" value={form.funded_min} onChange={(e) => setForm({ ...form, funded_min: e.target.value })} />
                    </div>
                    <div>
                      <Label>Funded max (optional)</Label>
                      <Input type="number" step="0.01" value={form.funded_max} onChange={(e) => setForm({ ...form, funded_max: e.target.value })} />
                    </div>
                  </div>
                )}
                <div>
                  <Label>Delivery time</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">H</Label>
                      <Input
                        type="number"
                        min={0}
                        value={slaTimer.hours}
                        onChange={(e) =>
                          setSlaTimer((prev) => ({
                            ...prev,
                            hours: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">M</Label>
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        value={slaTimer.minutes}
                        onChange={(e) =>
                          setSlaTimer((prev) => ({
                            ...prev,
                            minutes: Math.max(0, Math.min(59, Number.parseInt(e.target.value, 10) || 0)),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">S</Label>
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        value={slaTimer.seconds}
                        onChange={(e) =>
                          setSlaTimer((prev) => ({
                            ...prev,
                            seconds: Math.max(0, Math.min(59, Number.parseInt(e.target.value, 10) || 0)),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingId ? "Save changes" : "Create product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Price / fee</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                      </TableCell>
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
                      <TableCell>
                        {p.is_featured ? (
                          <Badge className="bg-orange-100 text-orange-900">Yes</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {p.pricing_type === "fixed"
                          ? `${p.fixed_amount ?? "—"} ${p.fixed_currency ?? ""}`.trim()
                          : `Fee ${p.fee_percent ?? 0}%`}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => void openEdit(p.id)}>
                          <Pencil className="h-4 w-4" />
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
