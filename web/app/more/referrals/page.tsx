"use client"

import { useEffect, useLayoutEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Check, Copy, Share2, Users, Wallet, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { ReferralsPageSkeleton } from "@/components/referrals-page-skeleton"
import { SEO_REFERRAL_SHARE_TITLE } from "@/lib/seo"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface ReferralRow {
  id: string
  name: string
  transactionCount: number
  earningsDisplay: string
  /** Present in percent mode after the referee's first qualifying send. */
  percentWindowEndsAt?: string
}

interface TierCommissionPayload {
  quarterLabel: string
  qualifiedRefereesThisQuarter: number
  currentTierIndex: number
  tiers: {
    minQualifiedRefereesInQuarter: number
    percentFraction: number
    percentDisplay: string
  }[]
}

interface MeResponse {
  slug: string
  shareUrl: string
  shareMessage: string
  shareTitle?: string
  shareDescription?: string
  programSummary: string
  program?: { mode?: string; percent_reward_duration_months?: number }
  tierCommission?: TierCommissionPayload
  balances: {
    availableDisplay: string
    lifetimeDisplay: string
    displayCurrency: string
    /** Available balance as a number in `displayCurrency` (base) */
    availableAmountBase?: number
  }
  referrals: ReferralRow[]
  pendingPayouts: { id: string; amount: number; currency: string; status: string }[]
}

const CACHE_TTL_MS = 5 * 60 * 1000

function referralsCacheKey(userId: string) {
  return `ciuna_referrals_me_v2_${userId}`
}

function readStaleReferralsCache(userId: string): MeResponse | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(referralsCacheKey(userId))
    if (!raw) return null
    const { value } = JSON.parse(raw) as { value?: MeResponse; timestamp?: number }
    return value && typeof value === "object" ? value : null
  } catch {
    return null
  }
}

function isReferralsCacheFresh(userId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(referralsCacheKey(userId))
    if (!raw) return false
    const { timestamp } = JSON.parse(raw) as { timestamp?: number }
    return typeof timestamp === "number" && Date.now() - timestamp < CACHE_TTL_MS
  } catch {
    return false
  }
}

function writeReferralsCache(userId: string, value: MeResponse) {
  try {
    localStorage.setItem(
      referralsCacheKey(userId),
      JSON.stringify({ value, timestamp: Date.now() }),
    )
  } catch {
    /* ignore quota */
  }
}

function currencySymbolForCode(
  code: string,
  currencies: { code?: string; symbol?: string }[] | undefined,
): string {
  const sym = currencies?.find((c) => c?.code === code)?.symbol
  if (sym) return sym
  try {
    return (
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? code
    )
  } catch {
    return code
  }
}

export default function ReferralsPage() {
  useRouteProtection({ requireAuth: true })
  const { userProfile, loading: authLoading, user } = useAuth()
  const { recipients, refreshRecipients, currencies, refreshTransactions } = useUserData()
  const router = useRouter()
  const [data, setData] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [recipientId, setRecipientId] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const fetchReferralsMe = useCallback(async (): Promise<MeResponse> => {
    const res = await fetchWithAuth("/api/referrals/me")
    const j = await res.json()
    if (!res.ok) {
      throw new Error(j.error || "Failed to load")
    }
    return j as MeResponse
  }, [])

  /** Refresh from network; `silent` avoids full-page loading state (e.g. after withdraw). */
  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const uid = userProfile?.id
      if (!uid) return
      if (!options?.silent) setLoading(true)
      setError(null)
      try {
        const j = await fetchReferralsMe()
        setData(j)
        writeReferralsCache(uid, j)
      } catch (e: any) {
        setError(e?.message || "Failed to load")
      } finally {
        if (!options?.silent) setLoading(false)
      }
    },
    [userProfile?.id, fetchReferralsMe],
  )

  // Seed from localStorage before paint; align loading with cache (same pattern as /transactions)
  useLayoutEffect(() => {
    if (authLoading || !user || !userProfile?.id) return

    setData(() => {
      const stale = readStaleReferralsCache(userProfile.id)
      return stale ?? null
    })

    const stale = readStaleReferralsCache(userProfile.id)
    const hasData = stale != null
    const cacheFresh = isReferralsCacheFresh(userProfile.id)

    if (!cacheFresh && !hasData) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [userProfile?.id, authLoading, user])

  // Always refresh from network: full load if no cache; background refresh when cache exists (stale or fresh)
  useEffect(() => {
    if (authLoading || !user || !userProfile?.id) return
    const stale = readStaleReferralsCache(userProfile.id)
    if (stale == null) {
      void load()
    } else {
      void load({ silent: true })
    }
  }, [userProfile?.id, authLoading, user, load])

  useEffect(() => {
    if (!userProfile?.id) return
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load({ silent: true })
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [userProfile?.id, load])

  useEffect(() => {
    if (!withdrawOpen) return
    void refreshRecipients?.()
  }, [withdrawOpen, refreshRecipients])

  useEffect(() => {
    if (!withdrawOpen) return
    if (!recipients.length) return
    if (!recipientId || !recipients.some((r) => r.id === recipientId)) {
      setRecipientId(recipients[0].id)
    }
  }, [withdrawOpen, recipients, recipientId])

  const copyLinkUrl = async () => {
    if (!data?.shareUrl) return
    try {
      await navigator.clipboard.writeText(data.shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const shareReferral = async () => {
    if (!data?.shareUrl) return
    // Single link: `text` already includes the URL; omit `url` or iOS/Messages shows two links.
    const payload: ShareData = {
      title: data.shareTitle ?? SEO_REFERRAL_SHARE_TITLE,
      text: data.shareMessage,
    }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload)
        return
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(data.shareMessage)
    } catch {
      /* ignore */
    }
  }

  const submitWithdraw = async () => {
    setWithdrawError(null)
    if (!recipientId || !withdrawAmount) {
      setWithdrawError("Choose a recipient and enter an amount.")
      return
    }
    const amt = Number.parseFloat(withdrawAmount)
    if (!(amt > 0)) {
      setWithdrawError("Enter an amount greater than zero.")
      return
    }
    const max = data?.balances.availableAmountBase
    if (max !== undefined && amt > max + 1e-6) {
      setWithdrawError(
        `That amount is more than your available balance (${data?.balances.availableDisplay}). Enter a lower amount.`,
      )
      return
    }
    setSubmitting(true)
    try {
      const res = await fetchWithAuth("/api/referrals/payout-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, amount: amt }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || "Request failed")
      setWithdrawOpen(false)
      setWithdrawAmount("")
      setWithdrawError(null)
      if (userProfile?.id) {
        await refreshTransactions?.(userProfile.id)
      }
      await load({ silent: true })
      const payoutTxId = j.payoutTransactionId as string | undefined
      if (payoutTxId) {
        router.push(`/send/${String(payoutTxId).toLowerCase()}`)
      }
    } catch (e: any) {
      setWithdrawError(e?.message || "Withdraw failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !data) {
    return <ReferralsPageSkeleton />
  }

  const baseCurrencyCode = userProfile?.base_currency || "USD"
  const baseCurrencySymbol = currencySymbolForCode(baseCurrencyCode, currencies)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppPageHeader title="Affiliates & Referrals" backHref="/more" />

      <div className="max-w-4xl mx-auto px-6 pt-6 pb-12 sm:pb-16 lg:px-8 lg:pb-10 space-y-6">
        <p className="text-base text-gray-600 -mt-1">
          Share your link and track rewards when friends send money.
        </p>
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-teal-50/90 to-white">
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Refer a friend</h2>
            <p className="text-sm text-gray-600 mb-4">{data?.programSummary}</p>
            {data?.tierCommission && data.tierCommission.tiers.length > 0 && (
              <div className="mb-4 rounded-xl border border-teal-200/70 bg-white/70 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">Commission rate rules</h3>
                <p className="text-sm text-gray-600 mt-1 mb-1">
                  Your rate depends on how many referred users qualify in the current calendar quarter.
                  The more friends qualify this quarter, the higher your commission rate.
                </p>
                <p className="text-xs text-gray-500 mb-3">{data.tierCommission.quarterLabel}</p>
                <ul className="rounded-lg border border-gray-200/80 divide-y divide-gray-100 overflow-hidden bg-white/90">
                  {data.tierCommission.tiers.map((t, i) => {
                    const active = i === data.tierCommission!.currentTierIndex
                    return (
                      <li
                        key={`${t.minQualifiedRefereesInQuarter}-${i}`}
                        className={`flex justify-between items-center gap-3 px-3 py-3 sm:px-4 ${
                          active ? "bg-primary/10" : ""
                        }`}
                      >
                        <span
                          className={`text-sm ${active ? "text-gray-900 font-medium" : "text-gray-700"}`}
                        >
                          {t.minQualifiedRefereesInQuarter} qualified referees this quarter
                        </span>
                        <span
                          className={`text-sm font-semibold tabular-nums shrink-0 ${active ? "text-primary" : "text-gray-900"}`}
                        >
                          {t.percentDisplay}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Referral link</Label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white/80 px-3 py-2">
                  <span className="font-mono text-sm truncate flex-1">{data?.shareUrl}</span>
                  <button
                    type="button"
                    onClick={() => void copyLinkUrl()}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                    aria-label={linkCopied ? "Copied" : "Copy link"}
                  >
                    {linkCopied ? (
                      <Check className="h-4 w-4 text-green-600" aria-hidden />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available to withdraw</p>
              <p className="text-2xl font-bold text-primary">{data?.balances.availableDisplay ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-1">
                Lifetime earned (incl. paid out): {data?.balances.lifetimeDisplay}
              </p>
            </div>
          </CardContent>
        </Card>

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">My referrals</p>
          <Card>
            <CardContent className="p-0">
              {!data?.referrals?.length ? (
                <div className="py-12 text-center text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>You have no referrals yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.referrals.map((r) => (
                    <li key={r.id} className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">
                          {Number(r.transactionCount ?? 0)} completed transactions
                        </p>
                        {r.percentWindowEndsAt &&
                          (data?.program?.mode === "percent" || data?.program?.mode === "tier") && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Reward window ends{" "}
                            {new Date(r.percentWindowEndsAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-primary">{r.earningsDisplay}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-row gap-3">
          <Button className="flex-1 min-w-0" onClick={() => void shareReferral()}>
            <Share2 className="h-4 w-4 mr-2" />
            Share link
          </Button>
          <Button
            variant="outline"
            className="flex-1 min-w-0"
            onClick={() => {
              setWithdrawError(null)
              setWithdrawOpen(true)
            }}
          >
            Withdraw
          </Button>
        </div>
      </div>

      <Dialog
        open={withdrawOpen}
        onOpenChange={(open) => {
          setWithdrawOpen(open)
          if (!open) setWithdrawError(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {withdrawError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {withdrawError}
              </div>
            )}
            <p className="text-sm text-gray-600">
              Choose a saved recipient and amount. Our team will process the transfer. Available:{" "}
              <strong>{data?.balances.availableDisplay}</strong>
            </p>
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select
                value={recipientId}
                onValueChange={(v) => {
                  setRecipientId(v)
                  setWithdrawError(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.full_name} — {r.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ({baseCurrencySymbol})</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => {
                  setWithdrawAmount(e.target.value)
                  setWithdrawError(null)
                }}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitWithdraw} disabled={submitting || !recipientId}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
