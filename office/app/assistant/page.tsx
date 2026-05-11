"use client"

import { useCallback, useEffect, useState } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { officeFetch } from "@/lib/api-client"

type AssistantRequest = {
  id: string
  user_id: string
  request_type: string
  status: string
  payload: Record<string, unknown>
  quote_amount: number | null
  quote_currency: string | null
  admin_notes: string | null
  created_at: string
}

const STATUSES = ["draft", "submitted", "quoted", "paid", "in_progress", "completed", "cancelled"] as const

export default function OfficeAssistantQueuePage() {
  const [rows, setRows] = useState<AssistantRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await officeFetch("/api/admin/assistant/requests")
      if (!res.ok) throw new Error("load")
      const j = await res.json()
      setRows((j.requests || []) as AssistantRequest[])
    } catch {
      setError("Could not load Assistant requests.")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const patchRow = async (id: string, body: Record<string, unknown>) => {
    const res = await officeFetch(`/api/admin/assistant/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("patch")
    await load()
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assistant</h1>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No Assistant requests yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Quote</TableHead>
                    <TableHead className="w-[280px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{r.request_type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs font-mono">
                        {JSON.stringify(r.payload)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.quote_amount != null ? `${r.quote_amount} ${r.quote_currency || ""}` : "—"}
                      </TableCell>
                      <TableCell className="space-y-2 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Select
                            value={r.status}
                            onValueChange={(v) => void patchRow(r.id, { status: v })}
                          >
                            <SelectTrigger className="h-8 w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8"
                            onClick={() => {
                              const amt = window.prompt("Quote amount (number)", r.quote_amount?.toString() ?? "")
                              if (amt == null) return
                              const cur = window.prompt("Currency (e.g. USD)", r.quote_currency || "USD")
                              if (cur == null) return
                              void patchRow(r.id, {
                                status: "quoted",
                                quote_amount: Number(amt),
                                quote_currency: cur,
                              })
                            }}
                          >
                            Set quote
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Admin notes</Label>
                          <Textarea
                            className="min-h-[52px] text-xs"
                            defaultValue={r.admin_notes || ""}
                            onBlur={(e) => {
                              const v = e.target.value
                              if (v === (r.admin_notes || "")) return
                              void patchRow(r.id, { admin_notes: v })
                            }}
                          />
                        </div>
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
