"use client"

import { useState, useEffect, useLayoutEffect } from "react"
import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { roundMoney } from "@/utils/currency"
import { TransactionsListSkeleton } from "@/components/transactions-skeleton"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { userDataStore } from "@/lib/user-data-store"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { REFERRAL_PAYOUT_PREFIX } from "@/lib/referral-reward-service"
import { formatLocaleDateShort } from "@/lib/format-date-locale"

interface CombinedTransaction {
  id: string
  transaction_id: string
  type: "send" | "hub"
  status: string
  created_at: string
  reference?: string | null
  transaction_source?: string | null
  hub_snapshot?: Record<string, unknown> | null
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  fulfillment_type?: "bank_transfer" | "cash_hand"
  delivery_address_line?: string | null
  delivery_phone?: string | null
  recipient?: {
    full_name: string
    account_number: string
    bank_name: string
  }
}

function sendRowRecipientLabel(tx: CombinedTransaction, fallback: string) {
  if (tx.type === "hub" && tx.hub_snapshot && typeof tx.hub_snapshot.productTitle === "string") {
    return String(tx.hub_snapshot.productTitle)
  }
  if (tx.recipient?.full_name?.trim()) return tx.recipient.full_name
  if (tx.fulfillment_type === "cash_hand" && tx.delivery_address_line?.trim()) {
    return tx.delivery_address_line.trim()
  }
  return fallback
}

const CACHE_TTL_MS = 5 * 60 * 1000

function readStaleTransactionsCache(userId: string): CombinedTransaction[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(`ciuna_combined_transactions_${userId}`)
    if (!raw) return null
    const { value } = JSON.parse(raw)
    return Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

function isTransactionsCacheFresh(userId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(`ciuna_combined_transactions_${userId}`)
    if (!raw) return false
    const { timestamp } = JSON.parse(raw)
    return Date.now() - timestamp < CACHE_TTL_MS
  } catch {
    return false
  }
}

function isReferralPayoutRow(t: CombinedTransaction): boolean {
  return typeof t.reference === "string" && t.reference.startsWith(REFERRAL_PAYOUT_PREFIX)
}

function isHubTx(t: CombinedTransaction): boolean {
  return t.type === "hub" || t.transaction_source === "hub"
}

type ChipFilter = "all" | "send" | "hub" | "referral" | "completed"

function matchesChip(t: CombinedTransaction, chip: ChipFilter): boolean {
  if (chip === "all") return true
  if (chip === "referral") return isReferralPayoutRow(t)
  if (chip === "hub") return isHubTx(t) && !isReferralPayoutRow(t)
  if (chip === "send") return !isHubTx(t) && !isReferralPayoutRow(t)
  if (chip === "completed") return t.status === "completed" || t.status === "deposited"
  return true
}

function calendarDayKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function OrdersPage() {
  const { t, i18n } = useTranslation("app")
  const dateLocale = i18n.resolvedLanguage || i18n.language || "en"
  const { userProfile } = useAuth()
  const { transactions: userTransactions, currencies, refreshTransactions, completedVolume } = useUserData()
  const [searchTerm, setSearchTerm] = useState("")
  const [chip, setChip] = useState<ChipFilter>("all")

  const [transactions, setTransactions] = useState<CombinedTransaction[]>([])
  const [loading, setLoading] = useState(false)

  // Seed from localStorage (stale OK) + in-memory store before paint; set loading before first paint when a fetch is needed
  useLayoutEffect(() => {
    if (!userProfile?.id) return
    setTransactions((prev) => {
      if (prev.length > 0) return prev
      const stale = readStaleTransactionsCache(userProfile.id)
      if (stale && stale.length > 0) return stale
      const fromStore = userDataStore.getData().transactions as CombinedTransaction[]
      if (fromStore && fromStore.length > 0) return fromStore
      const ut = (userTransactions || []) as CombinedTransaction[]
      if (ut.length > 0) return ut
      return prev
    })

    const stale = readStaleTransactionsCache(userProfile.id)
    const storeLen = userDataStore.getData().transactions?.length ?? 0
    const utLen = (userTransactions || []).length
    const hasRows = (stale?.length ?? 0) > 0 || storeLen > 0 || utLen > 0
    const cacheFresh = isTransactionsCacheFresh(userProfile.id)

    if (!cacheFresh && !hasRows) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [userProfile?.id, userTransactions])

  // Fetch combined transactions when cache is stale or missing (never drop full-page chrome)
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `ciuna_combined_transactions_${userProfile.id}`

    const setCachedTransactions = (value: CombinedTransaction[]) => {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            value,
            timestamp: Date.now(),
          }),
        )
      } catch {}
    }

    if (isTransactionsCacheFresh(userProfile.id)) {
      return
    }

    const fetchCombinedTransactions = async () => {
      try {
        const txResponse = await fetchWithAuth(`/api/transactions?type=all&limit=100`)
        if (txResponse.ok) {
          const txData = await txResponse.json()
          const transactionsList = txData.transactions || []
          setTransactions(transactionsList)
          setCachedTransactions(transactionsList)
        } else {
          console.warn("API fetch failed, using in-memory store transactions")
          const fallbackTransactions = (userDataStore.getData().transactions ||
            []) as CombinedTransaction[]
          setTransactions(fallbackTransactions)
          if (fallbackTransactions.length > 0) {
            setCachedTransactions(fallbackTransactions)
          }
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
        const fallbackTransactions = (userDataStore.getData().transactions ||
          []) as CombinedTransaction[]
        setTransactions(fallbackTransactions)
        if (fallbackTransactions.length > 0) {
          setCachedTransactions(fallbackTransactions)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCombinedTransactions()
  }, [userProfile?.id])

  // Real-time subscription for transaction updates
  useEffect(() => {
    if (!userProfile?.id) return

    const CACHE_KEY = `ciuna_combined_transactions_${userProfile.id}`
    
    const setCachedTransactions = (value: CombinedTransaction[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    const fetchCombinedTransactions = async () => {
      try {
        const txResponse = await fetchWithAuth(`/api/transactions?type=all&limit=100`)
        if (txResponse.ok) {
          const txData = await txResponse.json()
          const transactionsList = txData.transactions || []
          // Update state immediately to trigger re-render
          setTransactions((prev) => {
            // Only update if data actually changed
            if (JSON.stringify(prev) !== JSON.stringify(transactionsList)) {
              return transactionsList
            }
            return prev
          })
          setCachedTransactions(transactionsList)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }

    // Subscribe to send transactions table changes
    const sendTransactionsChannel = supabase
      .channel(`user-transactions-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userProfile.id}`,
        },
        async (payload) => {
          console.log('User transaction change received via Realtime:', payload.eventType)
          // Refresh both local state and userDataStore
          if (userProfile?.id) {
            await refreshTransactions(userProfile.id)
          }
          // Also update local state
          await fetchCombinedTransactions()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to user send transactions real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('User send transactions subscription error, will refetch on next interaction')
        }
      })

    return () => {
      supabase.removeChannel(sendTransactionsChannel)
    }
  }, [userProfile?.id, refreshTransactions])

  const baseCurrency = userProfile?.base_currency || "NGN"
  const completedCount = transactions.filter((t) => t && (t.status === "completed" || t.status === "deposited")).length

  const formatCurrencyValue = (amount: number, currencyCode: string) => {
    try {
      const currency = currencies?.find((c) => c && c.code === currencyCode)
      const a = roundMoney(amount)
      return `${currency?.symbol || ""}${a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } catch {
      return `${currencyCode} ${roundMoney(amount).toFixed(2)}`
    }
  }

  const chipFiltered = transactions.filter((transaction) => {
    if (!transaction) return false
    return matchesChip(transaction, chip)
  })

  const filteredTransactions = chipFiltered.filter((transaction) => {
    if (!transaction) return false
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    const hubTitle =
      transaction.type === "hub" && transaction.hub_snapshot && typeof transaction.hub_snapshot.productTitle === "string"
        ? String(transaction.hub_snapshot.productTitle).toLowerCase()
        : ""
    const amt = String(transaction.send_amount ?? "")
    const matchesSearch =
      transaction.transaction_id?.toLowerCase().includes(searchLower) ||
      transaction.recipient?.full_name?.toLowerCase().includes(searchLower) ||
      transaction.delivery_address_line?.toLowerCase().includes(searchLower) ||
      transaction.delivery_phone?.replace(/\s/g, "").toLowerCase().includes(searchLower.replace(/\s/g, "")) ||
      hubTitle.includes(searchLower) ||
      amt.includes(searchLower) ||
      (isReferralPayoutRow(transaction) &&
        searchLower.length >= 4 &&
        /referral|payout|withdraw/i.test(searchLower))
    return matchesSearch
  })

  const sortedFiltered = [...filteredTransactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const groups: { dayKey: string; items: CombinedTransaction[] }[] = []
  for (const tx of sortedFiltered) {
    const key = calendarDayKey(tx.created_at)
    const last = groups[groups.length - 1]
    if (last && last.dayKey === key) last.items.push(tx)
    else groups.push({ dayKey: key, items: [tx] })
  }

  const chips: { id: ChipFilter; label: string }[] = [
    { id: "all", label: t("orders.chipAll") },
    { id: "send", label: t("orders.chipSend") },
    { id: "hub", label: t("orders.chipHub") },
    { id: "referral", label: t("orders.chipReferral") },
    { id: "completed", label: t("orders.chipCompleted") },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "deposited":
        return "#10b981" // green
      case "processing":
      case "converting":
      case "converted":
        return "#f59e0b" // yellow
      case "pending":
      case "confirmed":
        return "#6b7280" // gray
      case "failed":
        return "#ef4444" // red
      case "cancelled":
        return "#6b7280" // gray
      default:
        return "#6b7280"
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencyData = currencies.find((c) => c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => formatLocaleDateShort(dateString, dateLocale)

  const renderTransactionCard = (transaction: CombinedTransaction) => {
    if (!transaction) return null
    const statusColor = getStatusColor(transaction.status)
    const payout = isReferralPayoutRow(transaction)
    const isHub = transaction.type === "hub" || transaction.transaction_source === "hub"
    const detailUrl = isHub
      ? `/hub/orders/${transaction.transaction_id.toLowerCase()}`
      : `/send/${transaction.transaction_id.toLowerCase()}`

    if (payout) {
      return (
        <Link href={detailUrl} className="block">
          <Card className="overflow-hidden border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Wallet className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
                      {t("transactions.referralPayout")}
                    </span>
                    <p className="text-app-tx-amount mt-1.5 font-bold tabular-nums text-gray-900">
                      {formatAmount(transaction.send_amount || 0, transaction.send_currency || "")}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-gray-500 truncate">{transaction.transaction_id}</p>
                  </div>
                </div>
                <span
                  className="shrink-0 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                  }}
                >
                  {transaction.status.toUpperCase()}
                </span>
              </div>

              <div className="rounded-xl border border-indigo-100/90 bg-white/70 p-3 sm:p-4 mb-4">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {t("transactions.withdrawalTo")}
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {sendRowRecipientLabel(transaction, t("transactions.recipientFallback"))}
                </p>
                {transaction.recipient?.bank_name && (
                  <p className="text-sm text-gray-600 mt-0.5">{transaction.recipient.bank_name}</p>
                )}
                {transaction.fulfillment_type === "cash_hand" &&
                  transaction.delivery_phone?.trim() &&
                  !transaction.recipient?.full_name && (
                    <p className="mt-0.5 text-sm text-gray-600">{transaction.delivery_phone}</p>
                  )}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-indigo-100/80 pt-3 text-[clamp(0.875rem,2.5vmin,1.125rem)] sm:text-lg">
                  <span className="min-w-0 text-gray-600">{t("transactions.recipientReceives")}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-indigo-800">
                    {formatAmount(transaction.receive_amount || 0, transaction.receive_currency || "")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs sm:text-sm text-gray-500">{formatDate(transaction.created_at)}</span>
                <span className="text-lg sm:text-xl text-indigo-300/80 font-light">›</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      )
    }

    return (
      <Link href={detailUrl} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {isHub ? (
                  <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                    {t("dashboard.hub")}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900">
                    {t("transactions.sendBadge")}
                  </span>
                )}
                <span className="text-xs sm:text-sm text-gray-500 font-mono">{transaction.transaction_id}</span>
              </div>
              <span
                className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                style={{
                  backgroundColor: `${statusColor}20`,
                  color: statusColor,
                }}
              >
                {transaction.status.toUpperCase()}
              </span>
            </div>

            <div className="mb-4 sm:mb-5">
              <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-1">
                {isHub ? t("transactions.orderLabel") : t("transactions.to")}
              </div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">
                {sendRowRecipientLabel(transaction, t("transactions.unknownRecipient"))}
              </div>
              {transaction.fulfillment_type === "cash_hand" &&
                transaction.delivery_phone?.trim() &&
                !transaction.recipient?.full_name && (
                  <div className="mt-1 text-sm text-gray-600">{transaction.delivery_phone}</div>
                )}
            </div>

            <div className="mb-4 space-y-2 sm:mb-5 sm:space-y-3">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 text-xs uppercase tracking-wide text-gray-600 sm:text-sm">
                  {isHub ? t("transactions.amountPaid") : t("transactions.sendAmount")}
                </span>
                <span className="shrink-0 text-right text-app-tx-amount font-semibold tabular-nums text-gray-900">
                  {formatAmount(transaction.send_amount || 0, transaction.send_currency || "")}
                </span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 text-xs uppercase tracking-wide text-gray-600 sm:text-sm">
                  {isHub ? t("transactions.orderAmount") : t("transactions.receiveAmount")}
                </span>
                <span className="shrink-0 text-right text-app-tx-amount font-semibold tabular-nums text-green-600">
                  {formatAmount(transaction.receive_amount || 0, transaction.receive_currency || "")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
              <span className="text-xs sm:text-sm text-gray-500">{formatDate(transaction.created_at)}</span>
              <span className="text-lg sm:text-xl text-gray-300 font-light">›</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const groupHeading = (dayKey: string) => {
    const [y, m, d] = dayKey.split("-").map(Number)
    const date = new Date(y, m - 1, d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    date.setHours(0, 0, 0, 0)
    if (date.getTime() === today.getTime()) return t("orders.groupToday")
    if (date.getTime() === yesterday.getTime()) return t("orders.groupYesterday")
    return formatLocaleDateShort(`${dayKey}T12:00:00`, dateLocale).toUpperCase()
  }

  return (
    <div className="min-w-0 space-y-0">
      <AppPageHeader title={t("orders.title")} backHref="/hub" />

      <div className="grid grid-cols-2 gap-3 px-4 pt-4 sm:gap-4 sm:px-6 sm:pt-5">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("orders.totalVolume")}
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums text-primary sm:text-xl">
              {formatCurrencyValue(completedVolume, baseCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("orders.totalTransactions")}
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums text-foreground sm:text-xl">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {chips.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant={chip === c.id ? "default" : "outline"}
              size="sm"
              className={cn("shrink-0 rounded-full", chip === c.id ? "" : "border-border bg-background")}
              onClick={() => setChip(c.id)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3 pt-2 sm:px-6 sm:pb-4 sm:pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder={t("orders.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 border-border pl-10"
          />
        </div>
      </div>

      <div className="space-y-6 px-4 pb-5 sm:space-y-8 sm:px-6 sm:pb-6">
        {loading && transactions.length === 0 ? (
          <TransactionsListSkeleton />
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-2 text-base text-muted-foreground">{t("transactions.empty")}</p>
            <p className="text-sm text-muted-foreground">{t("transactions.emptyHint")}</p>
          </div>
        ) : sortedFiltered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-2 text-base text-muted-foreground">{t("transactions.noSearchResults")}</p>
            <p className="text-sm text-muted-foreground">{t("transactions.adjustSearch")}</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.dayKey}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {groupHeading(g.dayKey)}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {g.items.map((transaction) => (
                  <div key={transaction.id}>{renderTransactionCard(transaction)}</div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
