"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchWithAuth } from "@/lib/fetch-with-auth"

type ExpertProfile = { id: string; display_name: string; headline: string | null; bio: string | null }

export default function ExpertBookingPage() {
  const { t } = useTranslation("app")
  const [profiles, setProfiles] = useState<ExpertProfile[]>([])
  const [expertId, setExpertId] = useState("")
  const [slotStart, setSlotStart] = useState("")
  const [slotEnd, setSlotEnd] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let c = false
    void fetchWithAuth("/api/expert/profiles", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { profiles?: ExpertProfile[] }) => {
        const list = j.profiles || []
        if (!c) {
          setProfiles(list)
          if (list[0]) setExpertId(list[0].id)
        }
      })
      .catch(() => {
        if (!c) setProfiles([])
      })
      .finally(() => {
        if (!c) setLoading(false)
      })
    return () => {
      c = true
    }
  }, [])

  const submit = async () => {
    if (!expertId) return
    setSaving(true)
    try {
      const res = await fetchWithAuth("/api/expert/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expert_profile_id: expertId,
          slot_start: slotStart || null,
          slot_end: slotEnd || null,
          message: message || null,
        }),
      })
      if (!res.ok) throw new Error("save")
      window.alert(t("experts.booking.success"))
    } catch {
      window.alert(t("experts.booking.failed"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0 pb-8">
      <AppPageHeader title={t("experts.booking.title")} backHref="/hub/experts" />
      <div className="mx-auto max-w-lg space-y-5 px-4 py-4 sm:px-6">
        <p className="text-sm text-muted-foreground">{t("experts.booking.intro")}</p>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("experts.booking.loading")}</p>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {t("experts.booking.noExperts")}
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label>{t("experts.booking.expert")}</Label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={expertId}
                  onChange={(e) => setExpertId(e.target.value)}
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start">{t("experts.booking.slotStart")}</Label>
                  <input
                    id="start"
                    type="datetime-local"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">{t("experts.booking.slotEnd")}</Label>
                  <input
                    id="end"
                    type="datetime-local"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="msg">{t("experts.booking.message")}</Label>
                <Textarea id="msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button className="w-full h-11 rounded-xl" disabled={saving || !expertId} onClick={() => void submit()}>
                {saving ? t("experts.booking.saving") : t("experts.booking.submit")}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/hub/experts">{t("experts.booking.backCatalog")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
