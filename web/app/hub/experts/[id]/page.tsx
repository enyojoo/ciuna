"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ExpertProfile = {
  id: string
  display_name: string
  headline: string | null
  bio: string | null
}

export default function HubExpertProfilePage() {
  const params = useParams()
  const id = String(params?.id || "").trim()
  const { t } = useTranslation("app")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<ExpertProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [slotStart, setSlotStart] = useState("")
  const [slotEnd, setSlotEnd] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth(`/api/expert/profiles/${encodeURIComponent(id)}`, { cache: "no-store" })
        if (res.status === 404) {
          if (!cancelled) setProfile(null)
          return
        }
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        if (!cancelled) setProfile((data.profile || null) as ExpertProfile | null)
      } catch {
        if (!cancelled) setProfile(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, router, id])

  const submit = useCallback(async () => {
    if (!profile?.id) return
    setSaving(true)
    try {
      const res = await fetchWithAuth("/api/expert/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expert_profile_id: profile.id,
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
  }, [profile?.id, slotStart, slotEnd, message, t])

  if (!user) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (profile === null) {
    return (
      <HubLinePageShell
        title={t("hub.expertNotFound", { defaultValue: "Expert not found" })}
        subtitle={null}
        backToHubAriaLabel={t("hub.backToHub")}
      >
        <Button asChild variant="outline">
          <Link href="/hub/experts">{t("hub.expertsAll", { defaultValue: "All experts" })}</Link>
        </Button>
      </HubLinePageShell>
    )
  }

  const p = profile

  return (
    <HubLinePageShell title={p.display_name} subtitle={p.headline} backToHubAriaLabel={t("hub.backToHub")}>
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold text-white">
            {p.display_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            {p.bio ? <p className="text-sm leading-relaxed text-muted-foreground">{p.bio}</p> : null}
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{t("experts.booking.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("experts.booking.intro")}</p>
          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expert-book-start">{t("experts.booking.slotStart")}</Label>
                  <input
                    id="expert-book-start"
                    type="datetime-local"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expert-book-end">{t("experts.booking.slotEnd")}</Label>
                  <input
                    id="expert-book-end"
                    type="datetime-local"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expert-book-msg">{t("experts.booking.message")}</Label>
                <Textarea id="expert-book-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button className="h-11 w-full rounded-xl" disabled={saving} onClick={() => void submit()}>
                {saving ? t("experts.booking.saving") : t("experts.booking.submit")}
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="flex flex-wrap justify-center sm:justify-start">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/hub/experts">{t("experts.booking.backCatalog")}</Link>
          </Button>
        </div>
      </div>
    </HubLinePageShell>
  )
}
