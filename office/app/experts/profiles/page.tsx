"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { officeFetch } from "@/lib/api-client"

type ExpertProfile = {
  id: string
  display_name: string
  headline: string | null
  category: string
  is_published: boolean
  fulfillment_type: string
  updated_at: string
}

export default function OfficeExpertProfilesPage() {
  const [rows, setRows] = useState<ExpertProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [category, setCategory] = useState("Other")
  const [published, setPublished] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await officeFetch("/api/admin/expert/profiles")
      if (!res.ok) throw new Error("load")
      const j = await res.json()
      setRows((j.profiles || []) as ExpertProfile[])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const resetForm = () => {
    setDisplayName("")
    setCategory("Other")
    setPublished(false)
  }

  const handleCreate = async () => {
    const name = displayName.trim()
    if (!name) return
    setSaving(true)
    try {
      const res = await officeFetch("/api/admin/expert/profiles", {
        method: "POST",
        body: JSON.stringify({
          display_name: name,
          category: category.trim() || "Other",
          is_published: published,
        }),
      })
      if (!res.ok) throw new Error("create")
      setOpen(false)
      resetForm()
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <OfficeDashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expert profiles</h1>
            <p className="text-gray-600">Create experts, then add services and offered time slots on each profile.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>New profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>New expert profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="ex-display">Display name</Label>
                    <Input
                      id="ex-display"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ex-cat">Category</Label>
                    <Input id="ex-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Coaching" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Published</p>
                      <p className="text-xs text-muted-foreground">Visible on hub discovery when enabled.</p>
                    </div>
                    <Switch checked={published} onCheckedChange={setPublished} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => void handleCreate()} disabled={saving || !displayName.trim()}>
                    {saving ? "Saving…" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No profiles yet. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.display_name}</TableCell>
                      <TableCell className="text-sm">{r.category}</TableCell>
                      <TableCell className="text-xs capitalize text-muted-foreground">{r.fulfillment_type?.replace("_", " ")}</TableCell>
                      <TableCell>
                        {r.is_published ? (
                          <Badge>Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/experts/profiles/${r.id}`}>Edit</Link>
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
