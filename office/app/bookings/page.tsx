"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { officeFetch } from "@/lib/api-client"

type ExpertProfileEmbed = { id: string; display_name: string; category: string } | null
type ExpertServiceEmbed = { id: string; title: string; pricing_type: string } | null
type ExpertSlotEmbed = { id: string; slot_start: string; slot_end: string; status: string } | null

type BookingRow = {
  id: string
  user_id: string
  expert_profile_id: string
  expert_service_id: string | null
  expert_service_slot_id: string | null
  status: string
  slot_start: string | null
  slot_end: string | null
  pricing_type_snapshot: string | null
  message: string | null
  created_at: string
  expert_profiles: ExpertProfileEmbed
  expert_services: ExpertServiceEmbed
  expert_service_slots: ExpertSlotEmbed
}

type ProfileOption = { id: string; display_name: string }

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"] as const

export default function OfficeBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([])
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [filterProfileId, setFilterProfileId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadProfiles = useCallback(async () => {
    try {
      const res = await officeFetch("/api/admin/expert/profiles")
      if (!res.ok) return
      const j = await res.json()
      const list = (j.profiles || []) as { id: string; display_name: string }[]
      setProfiles(list.map((p) => ({ id: p.id, display_name: p.display_name })))
    } catch {
      setProfiles([])
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = filterProfileId.trim() ? `?expert_profile_id=${encodeURIComponent(filterProfileId.trim())}` : ""
      const res = await officeFetch(`/api/admin/expert/bookings${q}`)
      if (!res.ok) throw new Error("load")
      const j = await res.json()
      setRows((j.bookings || []) as BookingRow[])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [filterProfileId])

  useEffect(() => {
    void loadProfiles()
  }, [loadProfiles])

  useEffect(() => {
    void load()
  }, [load])

  const displaySlot = (r: BookingRow) => {
    const sl = r.expert_service_slots
    if (sl?.slot_start && sl?.slot_end) {
      return `${new Date(sl.slot_start).toLocaleString()} → ${new Date(sl.slot_end).toLocaleString()}`
    }
    if (r.slot_start && r.slot_end) {
      return `${new Date(r.slot_start).toLocaleString()} → ${new Date(r.slot_end).toLocaleString()}`
    }
    return "—"
  }

  const patchStatus = async (id: string, status: string, message?: string) => {
    setUpdatingId(id)
    try {
      const res = await officeFetch(`/api/admin/expert/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(message !== undefined ? { message } : {}) }),
      })
      if (res.ok) await load()
    } finally {
      setUpdatingId(null)
    }
  }

  const profileNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of profiles) m.set(p.id, p.display_name)
    return m
  }, [profiles])

  return (
    <OfficeDashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expert bookings</h1>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <CardTitle>Bookings</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="ex-filter-profile" className="text-xs text-muted-foreground">
                Expert
              </Label>
              <Select value={filterProfileId || "__all__"} onValueChange={(v) => setFilterProfileId(v === "__all__" ? "" : v)}>
                <SelectTrigger id="ex-filter-profile" className="w-[220px]">
                  <SelectValue placeholder="All experts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All experts</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expert bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Expert</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const expertName = r.expert_profiles?.display_name ?? profileNameById.get(r.expert_profile_id) ?? r.expert_profile_id
                      const svcTitle = r.expert_services?.title ?? (r.expert_service_id ? r.expert_service_id.slice(0, 8) : "—")
                      const busy = updatingId === r.id
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                          <TableCell className="max-w-[120px] truncate font-mono text-xs">{r.user_id}</TableCell>
                          <TableCell className="max-w-[140px] text-sm">{expertName}</TableCell>
                          <TableCell className="max-w-[160px] text-xs">{svcTitle}</TableCell>
                          <TableCell className="min-w-[200px] text-xs">{displaySlot(r)}</TableCell>
                          <TableCell className="text-xs capitalize">{r.pricing_type_snapshot || r.expert_services?.pricing_type || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.status}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <Textarea
                              className="min-h-[60px] text-xs"
                              defaultValue={r.message ?? ""}
                              id={`msg-${r.id}`}
                              disabled={busy}
                            />
                          </TableCell>
                          <TableCell className="space-y-2 text-right">
                            <Select
                              value={r.status}
                              disabled={busy}
                              onValueChange={(v) => {
                                const msgEl = document.getElementById(`msg-${r.id}`) as HTMLTextAreaElement | null
                                const msg = msgEl?.value
                                void patchStatus(r.id, v, msg)
                              }}
                            >
                              <SelectTrigger className="h-8 w-[130px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OfficeDashboardLayout>
  )
}
