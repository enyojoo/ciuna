"use client"

import { useEffect, useMemo, useState } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { officeFetch } from "@/lib/api-client"

type AssistantRequest = {
  id: string
  status?: string
  created_at?: string
  summary?: string
  user_id?: string
}

type ExpertBooking = {
  id: string
  status?: string
  created_at?: string
  expert_profile_id?: string
  user_id?: string
  message?: string | null
}

type InboundRow =
  | { kind: "assistant"; service_line: "assistant"; id: string; created_at: string; status: string; title: string; user_id?: string }
  | { kind: "expert_booking"; service_line: "experts"; id: string; created_at: string; status: string; title: string; user_id?: string }

export default function OfficeOrdersPage() {
  const [assistant, setAssistant] = useState<AssistantRequest[]>([])
  const [bookings, setBookings] = useState<ExpertBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "assistant" | "experts">("all")

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const [ra, rb] = await Promise.all([
          officeFetch("/api/admin/assistant/requests"),
          officeFetch("/api/admin/expert/bookings"),
        ])
        const ja = ra.ok ? await ra.json() : { requests: [] }
        const jb = rb.ok ? await rb.json() : { bookings: [] }
        if (!c) {
          setAssistant(ja.requests || [])
          setBookings(jb.bookings || [])
        }
      } catch {
        if (!c) {
          setAssistant([])
          setBookings([])
        }
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [])

  const rows = useMemo(() => {
    const out: InboundRow[] = []
    for (const r of assistant) {
      out.push({
        kind: "assistant",
        service_line: "assistant",
        id: r.id,
        created_at: r.created_at || "",
        status: r.status || "—",
        title: r.summary || "Assistant request",
        user_id: r.user_id,
      })
    }
    for (const b of bookings) {
      out.push({
        kind: "expert_booking",
        service_line: "experts",
        id: b.id,
        created_at: b.created_at || "",
        status: b.status || "—",
        title: b.message?.trim() ? `Booking · ${b.message.slice(0, 60)}${b.message.length > 60 ? "…" : ""}` : "Expert booking",
        user_id: b.user_id,
      })
    }
    out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return out
  }, [assistant, bookings])

  const filtered = useMemo(() => {
    if (filter === "all") return rows
    if (filter === "assistant") return rows.filter((r) => r.kind === "assistant")
    return rows.filter((r) => r.kind === "expert_booking")
  }, [rows, filter])

  return (
    <OfficeDashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "assistant", "experts"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                filter === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {k === "all" ? "All" : k === "assistant" ? "Assistant" : "Experts"}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbound queue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service line</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={`${r.kind}-${r.id}`}>
                      <TableCell>
                        <Badge variant="secondary">{r.service_line}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{r.kind.replace("_", " ")}</TableCell>
                      <TableCell className="max-w-md truncate">{r.title}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
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
