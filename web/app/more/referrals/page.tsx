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
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReferralRow {
  id: string
  name: string
  transactionCount: number
  earningsDisplay: string
}

interface MeResponse {
  slug: string
  shareUrl: string
  shareMessage: string
  programSummary: string
  balances: {
    availableDisplay: string
    lifetimeDisplay: string
    displayCurrency: string
  }
  referrals: ReferralRow[]
  pendingPayouts: { id: string; amount: number; currency: string; status: string }[]
}

const CACHE_TTL_MS = 5 * 60 * 1000

function referralsCacheKey(userId: string) {
  return `ciuna_referrals_me_${userId}`
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

export default function ReferralsPage() {
  useRouteProtection({ requireAuth: true })
  const { userProfile, loading: authLoading, user } = useAuth()
  const { recipients, refreshRecipients } = useUserData()
  const [data, setData] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
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

  // Fetch only when cache missing or stale (fresh cache → no network on revisit)
  useEffect(() => {
    if (authLoading || !user || !userProfile?.id) return
    if (isReferralsCacheFresh(userProfile.id)) return

    const stale = readStaleReferralsCache(userProfile.id)
    void load({ silent: !!stale })
  }, [userProfile?.id, authLoading, user, load])

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
    const payload: ShareData = {
      title: "Ciuna referral",
      text: data.shareMessage,
      url: data.shareUrl,
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
      await navigator.clipboard.writeText(`${data.shareMessage}\n${data.shareUrl}`)
    } catch {
      /* ignore */
    }
  }

  const submitWithdraw = async () => {
    if (!recipientId || !withdrawAmount) return
    const amt = Number.parseFloat(withdrawAmount)
    if (!(amt > 0)) return
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
      await load({ silent: true })
    } catch (e: any) {
      setError(e?.message || "Withdraw failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppPageHeader title="Affiliates & Referrals" backHref="/more" />
        <div className="flex items-center justify-center min-h-[40vh] max-w-4xl mx-auto px-6 pb-12 sm:pb-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

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
                        <p className="text-xs text-gray-500">{r.transactionCount} completed sends</p>
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
          <Button variant="outline" className="flex-1 min-w-0" onClick={() => setWithdrawOpen(true)}>
            Withdraw
          </Button>
        </div>
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Choose a saved recipient and amount. Our team will process the transfer. Available:{" "}
              <strong>{data?.balances.availableDisplay}</strong>
            </p>
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
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
              <Label>Amount ({userProfile?.base_currency || "USD"})</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
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
