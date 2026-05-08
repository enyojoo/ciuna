"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { officeFetch } from "@/lib/api-client"

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type DayRow = { enabled: boolean; start: string; end: string }

type Props = {
  serviceId: string
  onScheduleSaved?: () => void
}

export function ExpertServiceScheduleEditor({ serviceId, onScheduleSaved }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenBusy, setRegenBusy] = useState(false)
  const [timezone, setTimezone] = useState("America/New_York")
  const [windowStart, setWindowStart] = useState("")
  const [windowEnd, setWindowEnd] = useState("")
  const [slotDur, setSlotDur] = useState("")
  const [days, setDays] = useState<DayRow[]>(() =>
    Array.from({ length: 7 }, () => ({ enabled: false, start: "09:00", end: "17:00" })),
  )

  const load = useCallback(async () => {
    if (!serviceId) return
    setLoading(true)
    try {
      const res = await officeFetch(`/api/admin/expert/services/${serviceId}/schedule`)
      if (!res.ok) throw new Error("sched")
      const j = await res.json()
      const next = Array.from({ length: 7 }, () => ({ enabled: false, start: "09:00", end: "17:00" }))
      if (j.schedule) {
        setTimezone(String(j.schedule.timezone || "America/New_York"))
        setWindowStart(String(j.schedule.window_start_date || ""))
        setWindowEnd(String(j.schedule.window_end_date || ""))
        setSlotDur(j.schedule.slot_duration_minutes != null ? String(j.schedule.slot_duration_minutes) : "")
        for (const r of j.weekly_rules || []) {
          const dow = Number(r.day_of_week)
          if (dow >= 0 && dow <= 6) {
            const ls = String(r.local_start_time || "09:00").slice(0, 5)
            const le = String(r.local_end_time || "17:00").slice(0, 5)
            next[dow] = { enabled: true, start: ls, end: le }
          }
        }
      } else {
        setTimezone("America/New_York")
        setWindowStart("")
        setWindowEnd("")
        setSlotDur("")
      }
      setDays(next)
    } catch {
      setDays(Array.from({ length: 7 }, () => ({ enabled: false, start: "09:00", end: "17:00" })))
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    if (!serviceId) return
    setSaving(true)
    try {
      const weekly_rules = days.flatMap((d, dow) => {
        if (!d.enabled) return []
        return [{ day_of_week: dow, local_start_time: d.start, local_end_time: d.end, sort_order: 0 }]
      })
      const res = await officeFetch(`/api/admin/expert/services/${serviceId}/schedule`, {
        method: "PATCH",
        body: JSON.stringify({
          timezone: timezone.trim(),
          window_start_date: windowStart.trim(),
          window_end_date: windowEnd.trim(),
          slot_duration_minutes: slotDur.trim() ? Number(slotDur) : null,
          weekly_rules,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        window.alert((err as { error?: string }).error || "Save failed")
        return
      }
      onScheduleSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const regenerate = async () => {
    if (!serviceId) return
    setRegenBusy(true)
    try {
      const res = await officeFetch(`/api/admin/expert/services/${serviceId}/schedule/regenerate`, { method: "POST" })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        window.alert((j as { error?: string }).error || "Regenerate failed")
        return
      }
      window.alert(`Generated ${(j as { inserted?: number }).inserted ?? 0} slots`)
      onScheduleSaved?.()
    } finally {
      setRegenBusy(false)
    }
  }

  if (!serviceId) {
    return <p className="text-sm text-muted-foreground">Select a service above.</p>
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading schedule…</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Set a date window and weekly hours (like Calendly). Save the schedule, then <strong>Regenerate slots</strong> to
        create bookable time blocks. Manual one-off slots stay under the Manual tab.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>IANA timezone</Label>
          <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="America/New_York" />
        </div>
        <div className="space-y-2">
          <Label>Window start (date)</Label>
          <Input type="date" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Window end (date)</Label>
          <Input type="date" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Slot length override (minutes)</Label>
          <Input
            type="number"
            min={5}
            step={5}
            value={slotDur}
            onChange={(e) => setSlotDur(e.target.value)}
            placeholder="Leave empty to use service default duration"
          />
        </div>
      </div>
      <div className="space-y-3">
        <Label>Weekly hours (local time in timezone above)</Label>
        <div className="space-y-2 rounded-lg border p-3">
          {DOW_LABELS.map((label, dow) => (
            <div key={dow} className="flex flex-wrap items-center gap-3 border-b border-border/60 py-2 last:border-0">
              <div className="flex w-28 items-center gap-2">
                <Checkbox
                  checked={days[dow].enabled}
                  onCheckedChange={(v) =>
                    setDays((prev) => {
                      const n = [...prev]
                      n[dow] = { ...n[dow], enabled: Boolean(v) }
                      return n
                    })
                  }
                />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <Input
                type="time"
                className="w-36"
                disabled={!days[dow].enabled}
                value={days[dow].start}
                onChange={(e) =>
                  setDays((prev) => {
                    const n = [...prev]
                    n[dow] = { ...n[dow], start: e.target.value }
                    return n
                  })
                }
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="time"
                className="w-36"
                disabled={!days[dow].enabled}
                value={days[dow].end}
                onChange={(e) =>
                  setDays((prev) => {
                    const n = [...prev]
                    n[dow] = { ...n[dow], end: e.target.value }
                    return n
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void load()} disabled={saving || regenBusy}>
          Reload
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving || regenBusy}>
          {saving ? "Saving…" : "Save schedule"}
        </Button>
        <Button type="button" onClick={() => void regenerate()} disabled={saving || regenBusy}>
          {regenBusy ? "Working…" : "Regenerate slots"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Regenerate removes future <Badge variant="outline">schedule</Badge> slots that are still{" "}
        <Badge variant="outline">available</Badge> and re-creates them from this template. Booked slots are never deleted.
      </p>
    </div>
  )
}
