"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { APP_URLS } from "@ciuna/shared"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { expertsBookPath, EXPERTS_CATALOG_PATH } from "@/lib/experts-public-paths"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ExpertProfile = {
  id: string
  display_name: string
  headline: string | null
}

type ExpertService = {
  id: string
  title: string
  short_description: string | null
  pricing_type: string
  hourly_rate: number | null
  hourly_currency: string | null
  fixed_amount: number | null
  fixed_currency: string | null
  package_label: string | null
  default_duration_minutes?: number | null
}

type SlotRow = { id: string; slot_start: string; slot_end: string }

type Preflight = {
  slot: { id: string; slot_start: string; slot_end: string }
  service: ExpertService
  profile: ExpertProfile
}

function priceLine(s: ExpertService, t: (k: string, o?: Record<string, string>) => string): string {
  if (s.pricing_type === "quote") return t("experts.bookingWizard.priceQuote")
  if (s.pricing_type === "hourly" && s.hourly_rate != null && s.hourly_currency)
    return t("experts.bookingWizard.priceHourly", { rate: String(s.hourly_rate), currency: s.hourly_currency })
  if (s.pricing_type === "fixed" && s.fixed_amount != null && s.fixed_currency) {
    return s.package_label
      ? t("experts.bookingWizard.priceFixedWithLabel", {
          amount: String(s.fixed_amount),
          currency: s.fixed_currency,
          label: s.package_label,
        })
      : t("experts.bookingWizard.priceFixed", { amount: String(s.fixed_amount), currency: s.fixed_currency })
  }
  return t("experts.bookingWizard.priceDash")
}

function primaryCtaLabel(s: ExpertService, t: (k: string, o?: Record<string, string>) => string): string {
  if (s.pricing_type === "fixed" && s.fixed_amount != null && s.fixed_currency) {
    return t("experts.bookingWizard.payAmount", { amount: `${s.fixed_amount} ${s.fixed_currency}` })
  }
  return t("experts.bookingWizard.confirmBooking")
}

function slotDayLocalKey(iso: string): string {
  return format(new Date(iso), "yyyy-MM-dd")
}

export function ExpertBookingWizard() {
  const { t } = useTranslation("app")
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = String(params?.id || "").trim()
  const slotFromQuery = (searchParams.get("slot") || "").trim()

  const { user, userProfile, loading: authLoading } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3 | "success">(1)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ExpertProfile | null>(null)
  const [services, setServices] = useState<ExpertService[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [slots, setSlots] = useState<SlotRow[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [preflight, setPreflight] = useState<Preflight | null>(null)
  const [message, setMessage] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deepLinkError, setDeepLinkError] = useState(false)
  const [deepLinkPending, setDeepLinkPending] = useState(false)

  useEffect(() => {
    if (!userProfile) return
    const fn = (userProfile.first_name || "").trim()
    const ln = (userProfile.last_name || "").trim()
    setContactName([fn, ln].filter(Boolean).join(" ").trim())
  }, [userProfile])

  useEffect(() => {
    if (user?.email) setContactEmail(user.email)
  }, [user?.email])

  useEffect(() => {
    if (!slotFromQuery) {
      setDeepLinkError(false)
      setDeepLinkPending(false)
    }
  }, [slotFromQuery])

  const loadProfile = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    try {
      const res = await fetchWithAuth(`/api/expert/profiles/${encodeURIComponent(profileId)}`, { cache: "no-store" })
      if (!res.ok) {
        setProfile(null)
        setServices([])
        return
      }
      const data = await res.json()
      setProfile((data.profile || null) as ExpertProfile | null)
      setServices((data.services || []) as ExpertService[])
    } catch {
      setProfile(null)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    void loadProfile()
  }, [user, authLoading, router, loadProfile])

  useEffect(() => {
    if (!user || !slotFromQuery || !profileId) return
    let cancelled = false
    setDeepLinkPending(true)
    ;(async () => {
      try {
        const res = await fetchWithAuth(`/api/expert/slots/${encodeURIComponent(slotFromQuery)}`, { cache: "no-store" })
        if (!res.ok) {
          if (!cancelled) setDeepLinkError(true)
          return
        }
        const data = (await res.json()) as Preflight
        if (cancelled) return
        if (data.profile.id !== profileId) {
          router.replace(expertsBookPath(data.profile.id, slotFromQuery))
          return
        }
        setPreflight(data)
        setProfile((prev) => (prev ? prev : (data.profile as ExpertProfile)))
        setSelectedServiceId(data.service.id)
        setSelectedSlotId(data.slot.id)
        setStep(3)
      } catch {
        if (!cancelled) setDeepLinkError(true)
      } finally {
        if (!cancelled) setDeepLinkPending(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, slotFromQuery, profileId, router])

  const loadSlots = useCallback(async (serviceId: string) => {
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlotId(null)
    try {
      const res = await fetchWithAuth(`/api/expert/services/${encodeURIComponent(serviceId)}/slots`, { cache: "no-store" })
      if (!res.ok) throw new Error("slots")
      const data = await res.json()
      setSlots((data.slots || []) as SlotRow[])
    } catch {
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    if (step !== 2 || !selectedServiceId) return
    void loadSlots(selectedServiceId)
  }, [step, selectedServiceId, loadSlots])

  const slotDayKeys = useMemo(() => {
    const s = new Set<string>()
    for (const sl of slots) s.add(slotDayLocalKey(sl.slot_start))
    return s
  }, [slots])

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDay) return []
    const key = format(selectedDay, "yyyy-MM-dd")
    return slots.filter((sl) => slotDayLocalKey(sl.slot_start) === key)
  }, [slots, selectedDay])

  const refreshPreflight = useCallback(async () => {
    if (!selectedSlotId) return
    const res = await fetchWithAuth(`/api/expert/slots/${encodeURIComponent(selectedSlotId)}`, { cache: "no-store" })
    if (res.ok) setPreflight((await res.json()) as Preflight)
  }, [selectedSlotId])

  useEffect(() => {
    if (step === 3 && selectedSlotId) void refreshPreflight()
  }, [step, selectedSlotId, refreshPreflight])

  const goConfirm = async () => {
    if (!selectedServiceId || !selectedSlotId) return
    setSubmitError(null)
    const res = await fetchWithAuth(`/api/expert/slots/${encodeURIComponent(selectedSlotId)}`, { cache: "no-store" })
    if (!res.ok) {
      setSubmitError(t("experts.bookingWizard.slotTaken"))
      return
    }
    setPreflight((await res.json()) as Preflight)
    setStep(3)
  }

  const submitBooking = async () => {
    if (!selectedSlotId) return
    if (!termsAccepted) {
      setSubmitError(t("experts.bookingWizard.acceptTerms"))
      return
    }
    if (!contactName.trim()) {
      setSubmitError(t("experts.bookingWizard.nameRequired"))
      return
    }
    setSaving(true)
    setSubmitError(null)
    try {
      const res = await fetchWithAuth("/api/expert/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expert_service_slot_id: selectedSlotId, message: message.trim() || null }),
      })
      if (res.status === 409) {
        setSubmitError(t("experts.bookingWizard.slotTaken"))
        return
      }
      if (!res.ok) throw new Error("book")
      setStep("success")
    } catch {
      setSubmitError(t("experts.booking.failed"))
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!profileId) {
    return null
  }

  if (loading || deepLinkPending) {
    return (
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (deepLinkError) {
    return (
      <HubLinePageShell
        title={t("experts.bookingWizard.slotUnavailable")}
        subtitle={profile?.display_name ?? null}
        backToHubAriaLabel={t("hub.backToHub")}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          {profile ? (
            <Button asChild variant="default" className="rounded-xl">
              <Link href={expertsBookPath(profileId)}>{t("experts.bookingWizard.tryAgain")}</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={EXPERTS_CATALOG_PATH}>{t("hub.expertsAll")}</Link>
          </Button>
        </div>
      </HubLinePageShell>
    )
  }

  if (!profile) {
    return (
      <HubLinePageShell title={t("hub.expertNotFound")} subtitle={null} backToHubAriaLabel={t("hub.backToHub")}>
        <Button asChild variant="outline">
          <Link href={EXPERTS_CATALOG_PATH}>{t("hub.expertsAll")}</Link>
        </Button>
      </HubLinePageShell>
    )
  }

  const p = profile
  const stepper = (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-4 sm:text-sm">
      {[
        { n: 1, label: t("experts.bookingWizard.stepSession") },
        { n: 2, label: t("experts.bookingWizard.stepTime") },
        { n: 3, label: t("experts.bookingWizard.stepConfirm") },
      ].map((s, idx) => {
        const active = step === "success" ? idx < 3 : typeof step === "number" ? step >= s.n : false
        const current = typeof step === "number" && step === s.n
        return (
          <div key={s.n} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                current || (step === "success" && s.n <= 3)
                  ? "border-orange-500 bg-orange-500 text-white"
                  : active
                    ? "border-orange-300 text-orange-700 dark:text-orange-300"
                    : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {s.n}
            </span>
            <span className={cn("hidden font-medium sm:inline", current ? "text-foreground" : "text-muted-foreground")}>
              {s.label}
            </span>
            {idx < 2 ? <span className="hidden h-px w-6 bg-border sm:block" /> : null}
          </div>
        )
      })}
    </div>
  )

  if (step === "success" && preflight) {
    return (
      <HubLinePageShell title={t("experts.bookingWizard.successTitle")} subtitle={p.display_name} backToHubAriaLabel={t("hub.backToHub")}>
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <CheckCircle2 className="mx-auto size-14 text-green-600 dark:text-green-500" aria-hidden />
          <p className="text-sm text-muted-foreground">{t("experts.bookingWizard.successBody", { name: p.display_name })}</p>
          <Card className="rounded-2xl border-border text-left">
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-semibold text-foreground">{preflight.service.title}</p>
              <p className="text-muted-foreground">
                {new Date(preflight.slot.slot_start).toLocaleString()} — {new Date(preflight.slot.slot_end).toLocaleString()}
              </p>
              <p className="font-medium text-orange-700 dark:text-orange-300">{priceLine(preflight.service, t)}</p>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            {t("experts.bookingWizard.confirmationEmail", { email: contactEmail || user?.email || "" })}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-xl">
              <Link href={expertsBookPath(profileId)}>{t("experts.bookingWizard.bookAnother")}</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-xl">
              <Link href={EXPERTS_CATALOG_PATH}>{t("hub.expertsAll")}</Link>
            </Button>
          </div>
        </div>
      </HubLinePageShell>
    )
  }

  return (
    <HubLinePageShell title={t("experts.bookingWizard.pageTitle", { name: p.display_name })} subtitle={p.headline} backToHubAriaLabel={t("hub.backToHub")}>
      <div className="mx-auto max-w-3xl">
        {stepper}

        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">{t("experts.bookingWizard.chooseService")}</h2>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("experts.bookingWizard.noServices")}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServiceId(s.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition hover:border-orange-300/70",
                      selectedServiceId === s.id ? "border-orange-400 ring-1 ring-orange-400/40" : "border-border bg-card",
                    )}
                  >
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p className="mt-1 text-sm font-medium text-orange-700 dark:text-orange-300">{priceLine(s, t)}</p>
                    {s.short_description ? <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{s.short_description}</p> : null}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                className="rounded-xl"
                disabled={!selectedServiceId}
                onClick={() => {
                  setStep(2)
                  setSelectedDay(undefined)
                  setSelectedSlotId(null)
                }}
              >
                {t("experts.bookingWizard.continue")}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-foreground">{t("experts.bookingWizard.chooseTime")}</h2>
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="shrink-0">
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  onSelect={(d) => {
                    setSelectedDay(d)
                    setSelectedSlotId(null)
                  }}
                  disabled={(date) => !slotDayKeys.has(format(date, "yyyy-MM-dd"))}
                  modifiers={{
                    hasSlots: (date) => slotDayKeys.has(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersClassNames={{
                    hasSlots: "font-semibold text-orange-700 dark:text-orange-300",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {selectedDay ? format(selectedDay, "EEEE, MMM d") : t("experts.bookingWizard.pickDay")}
                </p>
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">{t("experts.bookingWizard.loadingSlots")}</p>
                ) : !selectedDay ? (
                  <p className="text-sm text-muted-foreground">{t("experts.bookingWizard.selectDayHint")}</p>
                ) : slotsForSelectedDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("experts.bookingWizard.noSlotsDay")}</p>
                ) : (
                  <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                    {slotsForSelectedDay.map((sl) => (
                      <button
                        key={sl.id}
                        type="button"
                        onClick={() => setSelectedSlotId(sl.id)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-left text-sm transition hover:border-orange-300/70",
                          selectedSlotId === sl.id ? "border-orange-400 ring-1 ring-orange-400/40" : "border-border bg-card",
                        )}
                      >
                        {new Date(sl.slot_start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} —{" "}
                        {new Date(sl.slot_end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setStep(1)
                  setPreflight(null)
                  setSelectedSlotId(null)
                }}
              >
                {t("experts.bookingWizard.back")}
              </Button>
              <Button className="rounded-xl" disabled={!selectedSlotId} onClick={() => void goConfirm()}>
                {t("experts.bookingWizard.continue")}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 && !preflight ? (
          <p className="text-sm text-muted-foreground">{t("experts.bookingWizard.loadingConfirm")}</p>
        ) : null}

        {step === 3 && preflight ? (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-foreground">{t("experts.bookingWizard.confirmTitle")}</h2>
            <Card className="rounded-2xl border-border">
              <CardContent className="space-y-2 p-4 text-sm">
                <p className="font-medium text-foreground">{preflight.service.title}</p>
                <p className="text-muted-foreground">
                  {new Date(preflight.slot.slot_start).toLocaleString()} — {new Date(preflight.slot.slot_end).toLocaleString()}
                </p>
                <p className="font-medium text-orange-700 dark:text-orange-300">{priceLine(preflight.service, t)}</p>
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bk-name">{t("experts.bookingWizard.yourName")}</Label>
                <Input id="bk-name" value={contactName} onChange={(e) => setContactName(e.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bk-email">{t("experts.bookingWizard.email")}</Label>
                <Input id="bk-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bk-msg">{t("experts.booking.message")}</Label>
              <Textarea id="bk-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {preflight.service.pricing_type === "quote" ? (
              <p className="text-xs leading-relaxed text-muted-foreground">{t("experts.bookingWizard.quoteNote")}</p>
            ) : null}
            <div className="flex items-start gap-2">
              <Checkbox id="bk-terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(Boolean(v))} />
              <label htmlFor="bk-terms" className="text-xs leading-snug text-muted-foreground">
                {t("experts.bookingWizard.termsPrefix")}{" "}
                <a href={`${APP_URLS.website}/terms`} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  {t("experts.bookingWizard.terms")}
                </a>{" "}
                {t("experts.bookingWizard.and")}{" "}
                <a href={`${APP_URLS.website}/privacy`} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  {t("experts.bookingWizard.privacy")}
                </a>
                .
              </label>
            </div>
            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
            <p className="text-xs text-muted-foreground">{t("experts.bookingWizard.paymentStubNote")}</p>
            <div className="flex flex-wrap justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSubmitError(null)
                  setStep(2)
                }}
              >
                {t("experts.bookingWizard.back")}
              </Button>
              <Button className="min-w-[10rem] rounded-xl" disabled={saving} onClick={() => void submitBooking()}>
                {saving ? t("experts.booking.saving") : primaryCtaLabel(preflight.service, t)}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </HubLinePageShell>
  )
}
