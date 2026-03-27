"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, User, Mail, ChevronDown, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/utils/currency"
import { useOfficeData } from "@/hooks/use-office-data"
import { OfficeUsersSkeleton } from "@/components/office-users-skeleton"

const REFERRAL_PAYOUT_PREFIX = "REFERRAL_PAYOUT:"

const REFERRAL_REWARD_TYPE_LABEL: Record<string, string> = {
  threshold_unlock: "Threshold",
  percent_of_send: "Percent",
  tier_percent_of_send: "Tier",
}

interface ReferrerRow {
  id: string
  email: string
  first_name: string
  last_name: string
  referral_slug: string | null
  base_currency: string
  refereeCount: number
  totalEarnedPolicy: number
  policyCurrency: string
}

interface RefereeDetail {
  id: string
  first_name: string
  last_name: string
  email: string
  base_currency: string
  completedSendCount: number
  earnedPolicy: number
  sends: {
    transaction_id: string
    created_at: string
    send_amount: number
    send_currency: string
  }[]
  rewards: {
    id: string
    reward_type: string
    amount_policy_currency: number
    policy_currency: string
    source_transaction_id: string | null
    created_at: string
  }[]
}

export default function OfficeReferralsPage() {
  const { data, loading } = useOfficeData()
  const [searchTerm, setSearchTerm] = useState("")
  const [rewardTotals, setRewardTotals] = useState<Map<string, { policy: number; currency: string }>>(new Map())
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerRow | null>(null)
  const [refereeDetails, setRefereeDetails] = useState<RefereeDetail[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [expandedRefereeId, setExpandedRefereeId] = useState<string | null>(null)
  const [policyCurrency, setPolicyCurrency] = useState("USD")
  const [referralProgramMode, setReferralProgramMode] = useState<"threshold" | "percent" | "tier">("threshold")
  const [referrerDialogOpen, setReferrerDialogOpen] = useState(false)

  useEffect(() => {
    const loadRewards = async () => {
      const { data: rows } = await supabase.from("referral_rewards").select("referrer_user_id, amount_policy_currency, policy_currency")
      const map = new Map<string, { policy: number; currency: string }>()
      for (const r of rows || []) {
        const id = r.referrer_user_id as string
        const prev = map.get(id) || { policy: 0, currency: (r.policy_currency as string) || "USD" }
        prev.policy += Number(r.amount_policy_currency || 0)
        map.set(id, prev)
      }
      setRewardTotals(map)
    }
    loadRewards()
  }, [])

  useEffect(() => {
    const loadProgram = async () => {
      const { data: setting } = await supabase.from("system_settings").select("value").eq("key", "referral_program").maybeSingle()
      if (!setting?.value) return
      let raw: unknown = setting.value
      if (typeof raw === "string") {
        try {
          raw = JSON.parse(raw)
        } catch {
          return
        }
      }
      if (raw && typeof raw === "object") {
        const o = raw as Record<string, unknown>
        if (typeof o.policy_currency === "string") {
          setPolicyCurrency(o.policy_currency)
        }
        if (o.mode === "tier") setReferralProgramMode("tier")
        else if (o.mode === "percent") setReferralProgramMode("percent")
        else setReferralProgramMode("threshold")
      }
    }
    loadProgram()
  }, [])

  const referrers = useMemo((): ReferrerRow[] => {
    const users = data?.users || []
    const referredBy = new Set<string>()
    for (const u of users) {
      if (u.referred_by_user_id) referredBy.add(u.referred_by_user_id as string)
    }
    return users
      .filter((u: { id: string }) => referredBy.has(u.id))
      .map((u: Record<string, unknown>) => {
        const refereeCount = users.filter((c: { referred_by_user_id?: string }) => c.referred_by_user_id === u.id).length
        const rt = rewardTotals.get(u.id as string)
        return {
          id: u.id as string,
          email: u.email as string,
          first_name: (u.first_name as string) || "",
          last_name: (u.last_name as string) || "",
          referral_slug: (u.referral_slug as string | null) ?? null,
          base_currency: (u.base_currency as string) || "USD",
          refereeCount,
          totalEarnedPolicy: rt?.policy ?? 0,
          policyCurrency: rt?.currency || policyCurrency,
        }
      })
  }, [data?.users, rewardTotals, policyCurrency])

  const filtered = referrers.filter((r) => {
    const q = searchTerm.toLowerCase()
    if (!q) return true
    const name = `${r.first_name} ${r.last_name}`.toLowerCase()
    return name.includes(q) || r.email.toLowerCase().includes(q) || (r.referral_slug || "").toLowerCase().includes(q)
  })

  const formatTs = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" })
  }

  const loadReferrerDetail = async (row: ReferrerRow) => {
    setSelectedReferrer(row)
    setLoadingDetail(true)
    setRefereeDetails([])
    setExpandedRefereeId(null)
    try {
      const { data: referees } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, base_currency")
        .eq("referred_by_user_id", row.id)

      const { data: rewards } = await supabase
        .from("referral_rewards")
        .select("id, referee_user_id, reward_type, amount_policy_currency, policy_currency, source_transaction_id, created_at")
        .eq("referrer_user_id", row.id)

      const details: RefereeDetail[] = []
      for (const ref of referees || []) {
        const { data: txs } = await supabase
          .from("transactions")
          .select("transaction_id, created_at, send_amount, send_currency, reference, status")
          .eq("user_id", ref.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })

        const sends = (txs || []).filter((t) => !(t.reference as string | undefined)?.startsWith(REFERRAL_PAYOUT_PREFIX))
        const refRewards = (rewards || []).filter((r) => r.referee_user_id === ref.id)
        const earnedPolicy = refRewards.reduce((s, r) => s + Number(r.amount_policy_currency || 0), 0)

        details.push({
          id: ref.id,
          first_name: ref.first_name || "",
          last_name: ref.last_name || "",
          email: ref.email || "",
          base_currency: ref.base_currency || "USD",
          completedSendCount: sends.length,
          earnedPolicy,
          sends: sends.map((t) => ({
            transaction_id: t.transaction_id,
            created_at: t.created_at,
            send_amount: Number(t.send_amount),
            send_currency: t.send_currency,
          })),
          rewards: refRewards.map((r) => ({
            id: r.id,
            reward_type: r.reward_type,
            amount_policy_currency: Number(r.amount_policy_currency),
            policy_currency: r.policy_currency,
            source_transaction_id: r.source_transaction_id,
            created_at: r.created_at,
          })),
        })
      }
      setRefereeDetails(details)
    } catch (e) {
      console.error(e)
      setRefereeDetails([])
    } finally {
      setLoadingDetail(false)
    }
  }

  if (loading && (!data || !data.users?.length)) {
    return (
      <OfficeDashboardLayout>
        <OfficeUsersSkeleton />
      </OfficeDashboardLayout>
    )
  }

  if (!data) {
    return (
      <OfficeDashboardLayout>
        <div className="p-6 text-center text-gray-600">No data available.</div>
      </OfficeDashboardLayout>
    )
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
          <p className="text-gray-600">
            Referrers and their invited users. Rewards follow completed sends (send volume), not receive-side activity.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Program reward mode:{" "}
            <span className="font-medium text-gray-800">
              {referralProgramMode === "tier"
                ? "Tier"
                : referralProgramMode === "percent"
                  ? "Percent"
                  : "Threshold"}
            </span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search by name, email, or slug…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Link slug</TableHead>
                  <TableHead className="text-center">Referees</TableHead>
                  <TableHead className="text-right">Total rewards ({policyCurrency})</TableHead>
                  <TableHead className="w-[100px] text-center">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                      No referrers yet (users who have invited at least one account).
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.first_name} {r.last_name}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{r.email}</TableCell>
                      <TableCell>
                        {r.referral_slug ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">{r.referral_slug}</code>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{r.refereeCount}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(r.totalEarnedPolicy, r.policyCurrency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            loadReferrerDetail(r)
                            setReferrerDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={referrerDialogOpen} onOpenChange={setReferrerDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Referrer — {selectedReferrer?.first_name} {selectedReferrer?.last_name}
              </DialogTitle>
            </DialogHeader>
            {selectedReferrer && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Contact</label>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      {selectedReferrer.first_name} {selectedReferrer.last_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {selectedReferrer.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Referral link</label>
                    <p className="text-sm">
                      Slug:{" "}
                      {selectedReferrer.referral_slug ? (
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">{selectedReferrer.referral_slug}</code>
                      ) : (
                        "—"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total credited (policy): {formatCurrency(selectedReferrer.totalEarnedPolicy, selectedReferrer.policyCurrency)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Invited users &amp; activity</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Per referee: completed sends (excluding referral withdrawals) and rewards earned by the referrer from that referee&apos;s send
                    volume.
                  </p>
                  {loadingDetail ? (
                    <p className="text-sm text-gray-500 py-4">Loading…</p>
                  ) : refereeDetails.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No invited users yet.</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-8" />
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-center">Completed sends</TableHead>
                            <TableHead className="text-right">Rewards ({policyCurrency})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {refereeDetails.map((ref) => (
                            <Fragment key={ref.id}>
                              <TableRow
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => setExpandedRefereeId((id) => (id === ref.id ? null : ref.id))}
                              >
                                <TableCell>
                                  {expandedRefereeId === ref.id ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {ref.first_name} {ref.last_name}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">{ref.email}</TableCell>
                                <TableCell className="text-center">{ref.completedSendCount}</TableCell>
                                <TableCell className="text-right">{formatCurrency(ref.earnedPolicy, policyCurrency)}</TableCell>
                              </TableRow>
                              {expandedRefereeId === ref.id && (
                                <TableRow>
                                  <TableCell colSpan={5} className="bg-muted/30 p-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-medium text-gray-600 mb-2">Their completed sends</p>
                                        {ref.sends.length === 0 ? (
                                          <p className="text-xs text-gray-500">No completed sends yet.</p>
                                        ) : (
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead className="text-xs">Txn ID</TableHead>
                                                <TableHead className="text-xs">Date</TableHead>
                                                <TableHead className="text-xs text-right">Send</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {ref.sends.map((s) => (
                                                <TableRow key={s.transaction_id}>
                                                  <TableCell className="font-mono text-xs">{s.transaction_id}</TableCell>
                                                  <TableCell className="text-xs">{formatTs(s.created_at)}</TableCell>
                                                  <TableCell className="text-xs text-right">
                                                    {formatCurrency(s.send_amount, s.send_currency)}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-600 mb-2">Rewards to referrer from this user</p>
                                        {ref.rewards.length === 0 ? (
                                          <p className="text-xs text-gray-500">No rewards yet.</p>
                                        ) : (
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead className="text-xs">Type</TableHead>
                                                <TableHead className="text-xs">From txn</TableHead>
                                                <TableHead className="text-xs text-right">Amount</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {ref.rewards.map((rw) => (
                                                <TableRow key={rw.id}>
                                                  <TableCell className="text-xs">
                                                    <Badge variant="secondary" className="text-[10px]">
                                                      {REFERRAL_REWARD_TYPE_LABEL[rw.reward_type] ?? rw.reward_type}
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell className="font-mono text-xs">{rw.source_transaction_id || "—"}</TableCell>
                                                  <TableCell className="text-xs text-right">
                                                    {formatCurrency(rw.amount_policy_currency, rw.policy_currency)}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </OfficeDashboardLayout>
  )
}
