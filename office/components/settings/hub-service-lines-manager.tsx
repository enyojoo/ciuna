"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { officeFetch } from "@/lib/api-client"

type Line = {
  id: string
  slug: string
  title: string
  short_description: string | null
  sort_order: number
  is_enabled: boolean
  grid_kind: string
  route_path: string | null
  href: string | null
}

export function HubServiceLinesManager() {
  const [lines, setLines] = useState<Line[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await officeFetch("/api/admin/hub/service-lines")
      if (!res.ok) throw new Error("load")
      const j = await res.json()
      setLines((j.serviceLines || []) as Line[])
    } catch {
      setError("Failed to load hub service lines.")
      setLines([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await officeFetch(`/api/admin/hub/service-lines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("patch")
    await load()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle>Hub services</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enabled</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Route / href</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Switch checked={row.is_enabled} onCheckedChange={(v) => void patch(row.id, { is_enabled: v })} />
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <Input
                      type="number"
                      className="h-8"
                      defaultValue={row.sort_order}
                      onBlur={(e) => {
                        const n = Number(e.target.value)
                        if (!Number.isFinite(n) || n === row.sort_order) return
                        void patch(row.id, { sort_order: n })
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.slug}</TableCell>
                  <TableCell className="min-w-[140px]">
                    <Input
                      className="h-8"
                      defaultValue={row.title}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (!v || v === row.title) return
                        void patch(row.id, { title: v })
                      }}
                    />
                  </TableCell>
                  <TableCell className="w-[140px]">
                    <Select
                      value={row.grid_kind}
                      onValueChange={(v) => void patch(row.id, { grid_kind: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hub_category">hub_category</SelectItem>
                        <SelectItem value="app_link">app_link</SelectItem>
                        <SelectItem value="external_url">external_url</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="min-w-[180px] space-y-1">
                    <Label className="text-[10px] text-muted-foreground">route_path</Label>
                    <Input
                      className="h-8 font-mono text-xs"
                      defaultValue={row.route_path || ""}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v === (row.route_path || "")) return
                        void patch(row.id, { route_path: v || null })
                      }}
                    />
                    <Label className="text-[10px] text-muted-foreground">href (external)</Label>
                    <Input
                      className="h-8 font-mono text-xs"
                      defaultValue={row.href || ""}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v === (row.href || "")) return
                        void patch(row.id, { href: v || null })
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
