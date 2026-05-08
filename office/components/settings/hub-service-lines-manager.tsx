"use client"

import { useCallback, useRef, useState } from "react"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { officeFetch } from "@/lib/api-client"
import { uploadHubServiceLineIcon } from "@/lib/upload-hub-assets"
import { Pencil, Plus, Loader2, Store } from "lucide-react"

export type HubServiceLine = {
  id: string
  slug: string
  title: string
  short_description: string | null
  sort_order: number
  is_enabled: boolean
  grid_kind: string
  route_path: string | null
  href: string | null
  icon_url: string | null
  icon_key: string | null
  updated_at?: string
}

const emptyForm = {
  slug: "",
  title: "",
  short_description: "",
  sort_order: "0",
  is_enabled: true,
  grid_kind: "hub_category" as string,
  route_path: "",
  href: "",
  icon_url: "",
}

function lineToForm(line: HubServiceLine) {
  return {
    slug: line.slug,
    title: line.title,
    short_description: line.short_description ?? "",
    sort_order: String(line.sort_order),
    is_enabled: line.is_enabled,
    grid_kind: line.grid_kind,
    route_path: line.route_path ?? "",
    href: line.href ?? "",
    icon_url: line.icon_url ?? "",
  }
}

function HubServiceLinesTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[72px]">On</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="min-w-[160px] max-w-[min(100%,28rem)]">Description</TableHead>
            <TableHead className="w-[56px]">Icon</TableHead>
            <TableHead className="w-[88px] text-right">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-9 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full max-w-xs" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-9 w-9 rounded-md" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-9 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export type HubServiceLinesManagerProps = {
  lines: HubServiceLine[]
  onReload: () => Promise<void>
  /** False until the first settings boot `loadAllData` run finishes (matches other tabs’ data timing). */
  settingsBootComplete: boolean
}

export function HubServiceLinesManager({ lines, onReload, settingsBootComplete }: HubServiceLinesManagerProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [listRefreshing, setListRefreshing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reloadList = useCallback(async () => {
    setListRefreshing(true)
    try {
      await onReload()
    } finally {
      setListRefreshing(false)
    }
  }, [onReload])

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await officeFetch(`/api/admin/hub/service-lines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("patch")
    await reloadList()
  }

  const openEdit = (line: HubServiceLine) => {
    setFormError(null)
    setEditingId(line.id)
    setForm(lineToForm(line))
    setEditOpen(true)
  }

  const openAdd = () => {
    setFormError(null)
    setEditingId(null)
    setForm({ ...emptyForm })
    setAddOpen(true)
  }

  const closeDialogs = () => {
    setEditOpen(false)
    setAddOpen(false)
    setEditingId(null)
    setFormError(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setFormError(null)
    setSaving(true)
    try {
      const n = Number.parseInt(form.sort_order, 10)
      await patch(editingId, {
        slug: form.slug.trim(),
        title: form.title.trim(),
        short_description: form.short_description.trim() || null,
        sort_order: Number.isFinite(n) ? n : 0,
        is_enabled: form.is_enabled,
        grid_kind: form.grid_kind,
        route_path: form.route_path.trim() || null,
        href: form.href.trim() || null,
        icon_url: form.icon_url.trim() || null,
      })
      closeDialogs()
    } catch {
      setFormError("Save failed. Check slug is unique and fields are valid.")
    } finally {
      setSaving(false)
    }
  }

  const saveAdd = async () => {
    setFormError(null)
    if (!form.slug.trim()) {
      setFormError("Slug is required (e.g. food, mart).")
      return
    }
    setSaving(true)
    try {
      const n = Number.parseInt(form.sort_order, 10)
      const res = await officeFetch("/api/admin/hub/service-lines", {
        method: "POST",
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim() || "Untitled",
          short_description: form.short_description.trim() || null,
          sort_order: Number.isFinite(n) ? n : 0,
          is_enabled: form.is_enabled,
          grid_kind: form.grid_kind,
          route_path: form.route_path.trim() || null,
          href: form.href.trim() || null,
          icon_url: form.icon_url.trim() || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setFormError(typeof j.error === "string" ? j.error : "Create failed.")
        return
      }
      await reloadList()
      closeDialogs()
    } catch {
      setFormError("Create failed.")
    } finally {
      setSaving(false)
    }
  }

  const onPickIcon = async (file: File | null) => {
    if (!file) return
    setFormError(null)
    setUploading(true)
    try {
      const url = await uploadHubServiceLineIcon(file)
      setForm((f) => ({ ...f, icon_url: url }))
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const formFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          disabled={Boolean(editingId)}
          className="font-mono text-sm"
        />
        {editingId ? (
          <p className="text-xs text-muted-foreground">Slug is fixed after create (links and hub routes depend on it).</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label>Sort order</Label>
        <Input
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Short description</Label>
        <Textarea
          rows={3}
          value={form.short_description}
          onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
          placeholder="Shown under the title on the customer hub."
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Icon image</Label>
        <div className="flex flex-wrap items-center gap-3">
          {form.icon_url ? (
            <img src={form.icon_url} alt="" className="h-14 w-14 rounded-lg border object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
              None
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Input
              className="font-mono text-xs"
              placeholder="https://… or upload"
              value={form.icon_url}
              onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))}
            />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
                className="sr-only"
                onChange={(e) => {
                  void onPickIcon(e.target.files?.[0] ?? null)
                  e.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  "Upload JPG, PNG, WebP, or SVG"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Grid kind</Label>
        <Select value={form.grid_kind} onValueChange={(v) => setForm((f) => ({ ...f, grid_kind: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hub_category">hub_category</SelectItem>
            <SelectItem value="app_link">app_link</SelectItem>
            <SelectItem value="external_url">external_url</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end pb-1">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, is_enabled: v }))} />
          <Label className="text-sm font-normal">Enabled</Label>
        </div>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>route_path</Label>
        <Input
          className="font-mono text-sm"
          placeholder="/food/products or /send"
          value={form.route_path}
          onChange={(e) => setForm((f) => ({ ...f, route_path: e.target.value }))}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>href (external URL only)</Label>
        <Input
          className="font-mono text-sm"
          placeholder="https://…"
          value={form.href}
          onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
        />
      </div>
    </div>
  )

  const showSkeleton = !settingsBootComplete
  const showEmpty = settingsBootComplete && lines.length === 0
  const showTable = settingsBootComplete && lines.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hub Services</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Configure hub home tiles—titles, descriptions, icons, and where each tile links for customers.
        </p>
        <CardAction>
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90"
            onClick={openAdd}
            disabled={!settingsBootComplete}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service Line
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {showSkeleton ? <HubServiceLinesTableSkeleton /> : null}

        {showTable ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[72px]">On</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="min-w-[160px] max-w-[min(100%,28rem)]">Description</TableHead>
                  <TableHead className="w-[56px]">Icon</TableHead>
                  <TableHead className="w-[88px] text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Switch
                        checked={row.is_enabled}
                        disabled={listRefreshing}
                        onCheckedChange={(v) => void patch(row.id, { is_enabled: v })}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="max-w-[min(100%,28rem)] truncate text-xs text-gray-600">
                      {row.short_description || "—"}
                    </TableCell>
                    <TableCell>
                      {row.icon_url ? (
                        <img src={row.icon_url} alt="" className="h-9 w-9 rounded-md border object-cover" />
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={listRefreshing}
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {showEmpty ? (
          <div className="py-8 text-center text-gray-500">
            <Store className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>No hub service lines yet</p>
            <p className="mt-1 text-sm text-gray-400">Add a line to show tiles on the customer hub home screen.</p>
          </div>
        ) : null}

        <Dialog open={editOpen} onOpenChange={(o) => !o && closeDialogs()}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit hub service line</DialogTitle>
            </DialogHeader>
            {formFields}
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeDialogs}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void saveEdit()} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addOpen} onOpenChange={(o) => !o && closeDialogs()}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add hub service line</DialogTitle>
            </DialogHeader>
            {formFields}
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeDialogs}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void saveAdd()} disabled={saving}>
                {saving ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
