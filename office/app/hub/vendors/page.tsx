"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react"
import { officeFetch } from "@/lib/api-client"

type HubVendor = {
  id: string
  service_line_slug: string
  name: string
  slug: string
  photo_url: string | null
  short_bio: string | null
  is_published: boolean
}

export default function OfficeHubVendorsPage() {
  const searchParams = useSearchParams()
  const lineFilter = (searchParams.get("line") || "").trim().toLowerCase()
  const lineScoped = lineFilter === "food" || lineFilter === "mart"

  const [vendors, setVendors] = useState<HubVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    service_line_slug: "food",
    name: "",
    slug: "",
    photo_url: "",
    short_bio: "",
    is_published: false,
  })

  const load = async () => {
    const res = await officeFetch("/api/admin/hub/vendors")
    if (!res.ok) throw new Error("load")
    const data = await res.json()
    setVendors(data.vendors || [])
  }

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        await load()
      } catch {
        if (!c) setVendors([])
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [])

  const defaultServiceLine = lineScoped ? lineFilter : "food"

  const visibleVendors = useMemo(
    () => (lineScoped ? vendors.filter((v) => v.service_line_slug === lineFilter) : vendors),
    [vendors, lineScoped, lineFilter],
  )

  const reset = () => {
    setForm({
      service_line_slug: defaultServiceLine,
      name: "",
      slug: "",
      photo_url: "",
      short_bio: "",
      is_published: false,
    })
    setEditingId(null)
  }

  const openCreate = () => {
    reset()
    setDialogOpen(true)
  }

  const openEdit = (v: HubVendor) => {
    setEditingId(v.id)
    setForm({
      service_line_slug: v.service_line_slug,
      name: v.name,
      slug: v.slug,
      photo_url: v.photo_url || "",
      short_bio: v.short_bio || "",
      is_published: v.is_published,
    })
    setDialogOpen(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        service_line_slug: form.service_line_slug,
        name: form.name,
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        photo_url: form.photo_url || null,
        short_bio: form.short_bio || null,
        is_published: form.is_published,
      }
      const path = editingId ? `/api/admin/hub/vendors/${editingId}` : "/api/admin/hub/vendors"
      const method = editingId ? "PATCH" : "POST"
      const res = await officeFetch(path, { method, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Save failed")
      }
      await load()
      setDialogOpen(false)
      reset()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this vendor?")) return
    const res = await officeFetch(`/api/admin/hub/vendors/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert("Delete failed")
      return
    }
    await load()
  }

  return (
    <OfficeDashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hub vendors</h1>
            <p className="text-gray-600">Food and Mart storefronts. Link products to vendors from Hub products.</p>
            {lineScoped ? (
              <p className="text-sm text-muted-foreground">Showing vendors for the {lineFilter} line only.</p>
            ) : null}
            <Button variant="link" className="mt-1 h-auto p-0" asChild>
              <Link href={lineScoped ? `/hub?line=${encodeURIComponent(lineFilter)}` : "/hub"}>Back to Hub products</Link>
            </Button>
          </div>
          <div className="flex shrink-0">
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New vendor
            </Button>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit vendor" : "New vendor"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label>Service line</Label>
                  <Select value={form.service_line_slug} onValueChange={(v) => setForm({ ...form, service_line_slug: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="mart">Mart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label>URL slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="acme-kitchen"
                    required
                  />
                </div>
                <div>
                  <Label>Photo URL</Label>
                  <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label>Short bio</Label>
                  <Textarea value={form.short_bio} onChange={(e) => setForm({ ...form, short_bio: e.target.value })} rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pub"
                    checked={form.is_published}
                    onCheckedChange={(c) => setForm({ ...form, is_published: Boolean(c) })}
                  />
                  <Label htmlFor="pub">Published</Label>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </form>
            </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : visibleVendors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {vendors.length === 0 ? "No vendors yet." : lineScoped ? `No vendors for the ${lineFilter} line.` : "No vendors yet."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleVendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.service_line_slug}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell className="font-mono text-xs">{v.slug}</TableCell>
                      <TableCell>{v.is_published ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => openEdit(v)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => remove(v.id)}>
                          <Trash2 className="h-4 w-4" />
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
