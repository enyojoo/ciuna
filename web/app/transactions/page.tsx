"use client"

import { useState, useEffect, useLayoutEffect } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Wallet } from "lucide-react"
import { TransactionsListSkeleton } from "@/components/transactions-skeleton"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { userDataStore } from "@/lib/user-data-store"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { REFERRAL_PAYOUT_PREFIX } from "@/lib/referral-reward-service"

interface CombinedTransaction {
  id: string
  transaction_id: string
  type: "send" | "receive"
  status: string
  created_at: string
  reference?: string | null
  // Send transaction fields
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  recipient?: {
    full_name: string
    account_number: string
    bank_name: string
  }
  // Receive transaction fields
  crypto_amount?: number
  crypto_currency?: string
  fiat_amount?: number
  fiat_currency?: string
  crypto_wallet?: {
    wallet_address: string
    crypto_currency: string
  }
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

export default function UserTransactionsPage() {
  const { userProfile } = useAuth()
  const { transactions: userTransactions, currencies, refreshTransactions } = useUserData()
  const [searchTerm, setSearchTerm] = useState("")

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
        const txResponse = await fetchWithAuth(`/api/transactions?type=send&limit=100`)
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
        const txResponse = await fetchWithAuth(`/api/transactions?type=send&limit=100`)
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
  }, [userProfile?.id])

  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction) return false
    
    // Only show send transactions (filter out receive, card, etc.)
    if (transaction.type && transaction.type !== "send") {
      return false
    }
    
    // If no search term, show all send transactions
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      transaction.transaction_id?.toLowerCase().includes(searchLower) ||
      transaction.recipient?.full_name?.toLowerCase().includes(searchLower) ||
      (isReferralPayoutRow(transaction) &&
        searchLower.length >= 4 &&
        /referral|payout|withdraw/i.test(searchLower))
    return matchesSearch
  })

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    // Format: "Nov 07, 2025"
    return `${month} ${day}, ${year}`
  }



  return (
    <div className="space-y-0">
        <AppPageHeader title="Transactions" backHref="/dashboard" />

        {/* Search Bar */}
        <div className="p-5 sm:p-6 pb-3 sm:pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-300"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
          {loading && transactions.length === 0 ? (
            <TransactionsListSkeleton />
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-600 mb-2">No transactions found</p>
              <p className="text-sm text-gray-500">
                Start by sending your first transfer
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-600 mb-2">No transactions match your search</p>
              <p className="text-sm text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              if (!transaction) return null
              const statusColor = getStatusColor(transaction.status)
              const detailUrl = `/send/${transaction.transaction_id.toLowerCase()}`
              const payout = isReferralPayoutRow(transaction)

              if (payout) {
                return (
                  <Link href={detailUrl} key={transaction.id} className="block">
                    <Card className="overflow-hidden border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                              <Wallet className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
                                Referral payout
                              </span>
                              <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums leading-tight">
                                {formatAmount(transaction.send_amount || 0, transaction.send_currency || "")}
                              </p>
                              <p className="mt-1 font-mono text-[11px] text-gray-500 truncate">
                                {transaction.transaction_id}
                              </p>
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
                            Withdrawal to
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {transaction.recipient?.full_name || "Recipient"}
                          </p>
                          {transaction.recipient?.bank_name && (
                            <p className="text-sm text-gray-600 mt-0.5">{transaction.recipient.bank_name}</p>
                          )}
                          <div className="mt-3 pt-3 border-t border-indigo-100/80 flex items-center justify-between gap-2 text-base sm:text-lg">
                            <span className="text-gray-600">Recipient receives</span>
                            <span className="font-semibold tabular-nums text-indigo-800">
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
                <Link href={detailUrl} key={transaction.id} className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 sm:p-5">
                      {/* Transaction Header */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-500 font-mono">
                            {transaction.transaction_id}
                          </span>
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

                          {/* Recipient Info */}
                          <div className="mb-4 sm:mb-5">
                            <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-1">
                              To
                            </div>
                            <div className="text-base sm:text-lg font-semibold text-gray-900">
                              {transaction.recipient?.full_name || "Unknown"}
                            </div>
                          </div>

                          {/* Amount Section */}
                          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                Send Amount
                              </span>
                              <span className="text-xl sm:text-2xl font-semibold text-gray-900 tabular-nums">
                                {formatAmount(transaction.send_amount || 0, transaction.send_currency || "")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                                Receive Amount
                              </span>
                              <span className="text-xl sm:text-2xl font-semibold text-green-600 tabular-nums">
                                {formatAmount(transaction.receive_amount || 0, transaction.receive_currency || "")}
                              </span>
                            </div>
                          </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </span>
                        <span className="text-lg sm:text-xl text-gray-300 font-light">›</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
  )
}
