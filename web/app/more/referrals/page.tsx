"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ChevronLeft, Copy, Share2, Users, Wallet, Loader2 } from "lucide-react"
import type { Recipient } from "@/types"
import { useAuth } from "@/lib/auth-context"
import { useRouteProtection } from "@/hooks/use-route-protection"
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

export default function ReferralsPage() {
  useRouteProtection({ requireAuth: true })
  const { userProfile } = useAuth()
  const [data, setData] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [recipientId, setRecipientId] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<"link" | "share" | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/referrals/me", { credentials: "include" })
      const j = await res.json()
      if (!res.ok) {
        throw new Error(j.error || "Failed to load")
      }
      setData(j)
    } catch (e: any) {
      setError(e?.message || "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const loadRecipients = async () => {
    try {
      const res = await fetch("/api/recipients", { credentials: "include" })
      if (!res.ok) return
      const j = await res.json()
      setRecipients(j.recipients || [])
      if (j.recipients?.length && !recipientId) {
        setRecipientId(j.recipients[0].id)
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (withdrawOpen) loadRecipients()
  }, [withdrawOpen])

  const copyText = async (text: string, kind: "link" | "share") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(null), 2000)
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
      const res = await fetch("/api/referrals/payout-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId, amount: amt }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || "Request failed")
      setWithdrawOpen(false)
      setWithdrawAmount("")
      await load()
    } catch (e: any) {
      setError(e?.message || "Withdraw failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <div className="bg-white p-5 sm:p-6 border-b border-gray-200">
        <Link
          href="/more"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Affiliates &amp; Referrals</h1>
        <p className="text-base text-gray-600">Share your link and track rewards when friends send money.</p>
      </div>

      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-8 space-y-5">
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
                    onClick={() => data?.shareUrl && copyText(data.shareUrl, "link")}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                    aria-label="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copied === "link" && <p className="text-xs text-green-600 mt-1">Copied</p>}
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1"
            onClick={() => data?.shareMessage && copyText(data.shareMessage, "share")}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share link
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setWithdrawOpen(true)}>
            Withdraw / Payout
          </Button>
        </div>
        {copied === "share" && <p className="text-xs text-green-600 text-center">Message copied to clipboard</p>}
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
