"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { stashRedirectAfterLogin } from "@/lib/auth-login-redirect"
import { expertsBookPath, expertsProfilePath, EXPERTS_CATALOG_PATH } from "@/lib/experts-public-paths"
import { HubLinePageShell } from "@/components/hub/hub-line-page-shell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  isExpertProfileDetailCacheFresh,
  readStaleExpertProfileDetailCache,
  writeExpertProfileDetailCache,
} from "@/lib/expert-profile-client-cache"

type ExpertProfile = {
  id: string
  display_name: string
  headline: string | null
  bio: string | null
  category?: string | null
  image_url?: string | null
  fulfillment_type?: string | null
  service_area?: string | null
  meeting_hint?: string | null
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

function servicePriceLabel(s: ExpertService, t: (k: string, o?: Record<string, string>) => string): string {
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
  return "—"
}

export function ExpertProfileView({ id }: { id: string }) {
  const { t } = useTranslation("app")
  const router = useRouter()
  const pathname = usePathname() || ""
  const { user } = useAuth()
  const [profile, setProfile] = useState<ExpertProfile | null>(null)
  const [services, setServices] = useState<ExpertService[]>([])
  const [loading, setLoading] = useState(true)

  const returnPath = pathname || expertsProfilePath(id)

  const onGuestBookNav = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      stashRedirectAfterLogin(returnPath)
      router.push("/auth/login")
    },
    [returnPath, router],
  )

  useLayoutEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    const stale = readStaleExpertProfileDetailCache(id)
    if (!stale) {
      setProfile(null)
      setServices([])
      setLoading(true)
      return
    }
    if (stale.notFound) {
      setProfile(null)
      setServices([])
      setLoading(false)
      return
    }
    setProfile((stale.profile || null) as ExpertProfile | null)
    setServices((stale.services || []) as ExpertService[])
    setLoading(false)
  }, [id])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    if (isExpertProfileDetailCacheFresh(id)) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/expert/profiles/${encodeURIComponent(id)}`, { cache: "no-store" })
        if (res.status === 404) {
          writeExpertProfileDetailCache(id, { profile: null, services: [], notFound: true })
          if (!cancelled) {
            setProfile(null)
            setServices([])
          }
          return
        }
        if (!res.ok) throw new Error("load")
        const data = await res.json()
        const profile = (data.profile || null) as ExpertProfile | null
        const services = (data.services || []) as ExpertService[]
        writeExpertProfileDetailCache(id, {
          profile: profile as unknown as Record<string, unknown>,
          services: services as unknown as Record<string, unknown>[],
          notFound: false,
        })
        if (!cancelled) {
          setProfile(profile)
          setServices(services)
        }
      } catch {
        if (!cancelled) {
          setProfile(null)
          setServices([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const fulfillmentLabel = useMemo(() => {
    const f = profile?.fulfillment_type || "online"
    if (f === "in_person") return t("experts.profile.fulfillmentInPerson")
    if (f === "both") return t("experts.profile.fulfillmentBoth")
    return t("experts.profile.fulfillmentOnline")
  }, [profile?.fulfillment_type, t])

  if (loading && !profile) {
    return (
      <HubLinePageShell
        title={t("experts.profile.loadingTitle", { defaultValue: "Expert" })}
        subtitle={null}
        backToHubAriaLabel={t("hub.backToHub")}
        backHref={EXPERTS_CATALOG_PATH}
        heroLoading={false}
      >
        <div className="animate-pulse space-y-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="h-24 w-24 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
              <div className="mx-auto h-6 w-48 max-w-full rounded bg-muted sm:mx-0" />
              <div className="mx-auto h-4 w-full max-w-md rounded bg-muted sm:mx-0" />
              <div className="mx-auto h-20 w-full max-w-lg rounded bg-muted sm:mx-0" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </HubLinePageShell>
    )
  }

  if (profile === null) {
    return (
      <HubLinePageShell
        title={t("hub.expertNotFound")}
        subtitle={null}
        backToHubAriaLabel={t("hub.backToHub")}
        backHref={EXPERTS_CATALOG_PATH}
      >
        <Button asChild variant="outline">
          <Link href={EXPERTS_CATALOG_PATH}>{t("hub.expertsAll")}</Link>
        </Button>
      </HubLinePageShell>
    )
  }

  const p = profile

  return (
    <HubLinePageShell
      title={p.display_name}
      subtitle={p.headline}
      backToHubAriaLabel={t("hub.backToHub")}
      backHref={EXPERTS_CATALOG_PATH}
    >
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {p.image_url ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold text-white">
              {p.display_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            {p.category ? (
              <p className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">{p.category}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">{fulfillmentLabel}</p>
            {p.service_area ? (
              <p className="text-xs text-muted-foreground">
                {t("experts.profile.serviceArea", { area: p.service_area })}
              </p>
            ) : null}
            {p.bio ? <p className="text-sm leading-relaxed text-muted-foreground">{p.bio}</p> : null}
            {p.meeting_hint ? <p className="text-xs text-muted-foreground">{p.meeting_hint}</p> : null}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          {services.length === 0 ? (
            <Button disabled className="rounded-full px-8" size="lg">
              {t("experts.profile.bookSession")}
            </Button>
          ) : user ? (
            <Button asChild className="rounded-full px-8" size="lg">
              <Link href={expertsBookPath(id)}>{t("experts.profile.bookSession")}</Link>
            </Button>
          ) : (
            <Button asChild className="rounded-full px-8" size="lg">
              <Link href="/auth/login" onClick={onGuestBookNav}>
                {t("experts.profile.bookSession")}
              </Link>
            </Button>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{t("experts.profile.servicesHeading")}</h2>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("experts.profile.noServices")}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.id} className={cn("rounded-2xl border border-border bg-card p-4 text-left")}>
                  <p className="font-semibold text-foreground">{s.title}</p>
                  <p className="mt-1 text-sm font-medium text-orange-700 dark:text-orange-300">{servicePriceLabel(s, t)}</p>
                  {s.default_duration_minutes != null && Number(s.default_duration_minutes) > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("experts.profile.typicalSession", { minutes: String(s.default_duration_minutes) })}
                    </p>
                  ) : null}
                  {s.short_description ? (
                    <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{s.short_description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap justify-center sm:justify-start">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={EXPERTS_CATALOG_PATH}>{t("experts.booking.backCatalog")}</Link>
          </Button>
        </div>
      </div>
    </HubLinePageShell>
  )
}
