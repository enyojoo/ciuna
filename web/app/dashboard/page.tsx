"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Send, MessageCircle, UserPlus, Wallet, BadgeDollarSign } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useUserData } from "@/hooks/use-user-data"
import { useRouter } from "next/navigation"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { REFERRAL_PAYOUT_PREFIX } from "@/lib/referral-reward-service"

interface Transaction {
  id: string
  transaction_id: string
  type?: "send" | "receive" | "card_funding"
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  status: string
  created_at: string
  reference?: string | null
  recipient?: {
    full_name: string
    bank_name?: string
  }
  destination_type?: "bank" | "card"
}

function isReferralPayoutRow(t: Transaction): boolean {
  return typeof t.reference === "string" && t.reference.startsWith(REFERRAL_PAYOUT_PREFIX)
}

/** Mobile total volume only: compact K/M display; tap opens popover with full amount when abbreviated. */
function VolumeAmountWithFullDetail({
  fullLabel,
  compactLabel,
  numberClassName,
}: {
  fullLabel: string
  compactLabel: string
  numberClassName: string
}) {
  const { t } = useTranslation("app")
  const [open, setOpen] = useState(false)
  const expandable = fullLabel !== compactLabel

  if (!expandable) {
    return <span className={numberClassName}>{compactLabel}</span>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            numberClassName,
            "inline-flex max-w-full justify-center border-0 bg-transparent p-0 cursor-pointer",
            "underline decoration-dotted underline-offset-[0.2em] hover:opacity-90",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
          )}
          aria-label={t("dashboard.fullAmountAria", { label: fullLabel })}
        >
          {compactLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={8}
        className="w-auto max-w-[min(100vw-2rem,22rem)] px-5 py-4 sm:px-6 sm:py-5"
      >
        <p className="text-base sm:text-lg font-semibold tabular-nums text-center text-foreground">
          {fullLabel}
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2.5">{t("dashboard.fullAmountCaption")}</p>
      </PopoverContent>
    </Popover>
  )
}

export default function UserDashboardPage() {
  const { t } = useTranslation("app")
  const router = useRouter()
  const { userProfile } = useAuth()
  const { transactions, currencies, exchangeRates, loading } = useUserData()
  const [totalSent, setTotalSent] = useState(0)

  // Helper function to convert amount to base currency
  const convertToBaseCurrency = (
    amount: number,
    fromCurrency: string,
    baseCurrency: string,
    exchangeRates: any[]
  ): number => {
    if (fromCurrency === baseCurrency) return amount

    // Find exchange rate from transaction currency to base currency
    const rate = exchangeRates.find(
      (r) => r && r.from_currency === fromCurrency && r.to_currency === baseCurrency,
    )

    if (rate && rate.rate > 0) {
      return amount * rate.rate
    }

    // If direct rate not found, try reverse rate
    const reverseRate = exchangeRates.find(
      (r) => r && r.from_currency === baseCurrency && r.to_currency === fromCurrency,
    )
    if (reverseRate && reverseRate.rate > 0) {
      return amount / reverseRate.rate
    }

    // If no rate found, return original amount (assume same currency)
    return amount
  }

  useEffect(() => {
    if (!userProfile?.id) {
      setTotalSent(0)
      return
    }

    // Need exchange rates for currency conversion
    if (!exchangeRates || exchangeRates.length === 0) {
      // If no exchange rates yet, wait (don't set to 0, keep previous value)
      return
    }

    // If transactions is not loaded yet (still loading), wait
    if (loading) {
      return
    }

    try {
      const calculateTotalSpent = () => {
        const baseCurrency = userProfile.base_currency || "NGN"
        let totalInBaseCurrency = 0

        const transactionsList = transactions || []

        // 1. Send transactions: use receive_amount (what recipient gets)
        const sendTransactions = transactionsList.filter((t) => {
          if (!t) return false
          // Must be completed
          if (t.status !== "completed") return false
          // If type is explicitly set, use it
          if (t.type === "send") return true
          // Exclude receive and card_funding
          if (t.type === "receive" || t.type === "card_funding") return false
          // If type is not set but has send_amount/receive_amount, it's a send transaction
          // Also check if it has recipient (send transactions have recipients)
          if (t.send_amount || t.receive_amount || t.recipient) return true
          return false
        })


        for (const transaction of sendTransactions) {
          // Use receive_amount if available, otherwise fall back to send_amount
          const amount = transaction.receive_amount || transaction.send_amount || 0
          const currency = transaction.receive_currency || transaction.send_currency || baseCurrency
          
          if (amount > 0) {
            const amountInBaseCurrency = convertToBaseCurrency(
              amount,
              currency,
              baseCurrency,
              exchangeRates
            )
            if (amountInBaseCurrency > 0) {
              totalInBaseCurrency += amountInBaseCurrency
            }
          }
        }

        setTotalSent(totalInBaseCurrency)
      }

      calculateTotalSpent()
    } catch (error) {
      console.error("Error calculating total spent:", error)
      setTotalSent(0)
    }
  }, [transactions, exchangeRates, userProfile])

  const profileInitials = (() => {
    const first = (userProfile?.first_name || "").trim()
    const last = (userProfile?.last_name || "").trim()
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
    if (first.length >= 2) return first.slice(0, 2).toUpperCase()
    if (first.length === 1) return `${first[0]}`.toUpperCase()
    return "U"
  })()
  const baseCurrency = userProfile?.base_currency || "NGN"
  const completedTransactions = transactions?.filter((t) => t && t.status === "completed").length || 0
  const totalSentValue = totalSent > 0 ? totalSent : 0

  const formatCurrencyValue = (amount: number, currencyCode: string) => {
    try {
      const currency = currencies?.find((c) => c && c.code === currencyCode)
      return `${currency?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } catch (error) {
      console.error("Error formatting currency:", error)
      return `${currencyCode} ${amount.toFixed(2)}`
    }
  }

  /**
   * Mobile total volume only: full below 10k; 10k–<1M as 10K…999.9K; 1M+ as 1M…
   * Tablet/desktop use full `formatCurrencyValue` in the stat card.
   */
  const formatDashboardVolumeDisplay = (amount: number, currencyCode: string) => {
    if (amount < 10_000) {
      return formatCurrencyValue(amount, currencyCode)
    }
    try {
      const currency = currencies?.find((c) => c && c.code === currencyCode)
      const symbol = currency?.symbol || ""

      if (amount >= 1_000_000) {
        const millions = amount / 1_000_000
        const rounded = Math.round(millions * 10) / 10
        const num =
          rounded % 1 === 0
            ? rounded.toLocaleString("en-US", { maximumFractionDigits: 0 })
            : rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 1 })
        return `${symbol}${num}M`
      }

      const k = amount / 1000
      const displayK = Math.min(999.9, Math.floor(k * 10) / 10)
      const numStr =
        displayK % 1 === 0
          ? displayK.toLocaleString("en-US", { maximumFractionDigits: 0 })
          : displayK.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 1 })
      return `${symbol}${numStr}K`
    } catch (error) {
      console.error("Error formatting compact currency:", error)
      return formatCurrencyValue(amount, currencyCode)
    }
  }

  const fullVolumeLabel = formatCurrencyValue(totalSentValue, baseCurrency)
  const compactVolumeLabel = formatDashboardVolumeDisplay(totalSentValue, baseCurrency)

  const formatAmount = (amount: number, currency: string) => {
    const currencyInfo = currencies?.find((c) => c && c.code === currency)
    return `${currencyInfo?.symbol || currency} ${amount.toLocaleString()}`
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    // Format: "Nov 07, 2025"
    return `${month} ${day}, ${year}`
  }

  // Send + referral payouts on web (receive/card_funding are mobile-only); card sends excluded unless payout
  const recentTransactions = (transactions || [])
    .filter((t) => {
      if (!t) return false
      const payout = isReferralPayoutRow(t)
      if (t.type === "receive" || t.type === "card_funding") return false
      if (t.destination_type === "card" && !payout) return false
      if (t.type === "send") return true
      if (t.send_amount || t.receive_amount || t.recipient) return true
      return false
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2)

  // Check if we have valid data to display
  const hasValidData = 
    transactions && 
    currencies && currencies.length > 0 && 
    exchangeRates && exchangeRates.length > 0

  // Show skeleton only if:
  // 1. Actually loading AND no data available, OR
  // 2. No user profile
  // This prevents flickering when navigating with cached data
  if ((loading && !hasValidData) || !userProfile) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-5 sm:pb-6">
        {/* Page Header - Mobile Style */}
        <div className="bg-card p-5 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <Link
              href="/more/profile"
              className="inline-flex shrink-0 rounded-full p-0.5 -ml-0.5 hover:bg-gray-50/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
              aria-label={t("dashboard.profileAria")}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20 text-sm font-bold tracking-tight text-primary tabular-nums">
                {profileInitials}
              </span>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/more/referrals"
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-gradient-to-r from-teal-50 to-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-sm hover:from-teal-100 hover:to-emerald-50 transition-colors"
              >
                <BadgeDollarSign className="h-3.5 w-3.5 shrink-0 text-teal-800" strokeWidth={2.25} aria-hidden />
                {t("dashboard.referEarn")}
              </Link>
              <button
                type="button"
                onClick={() => router.push("/support")}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label={t("dashboard.supportAria")}
              >
                <MessageCircle className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats — mobile only */}
        <div className="px-5 sm:px-6 flex gap-3 min-w-0 sm:hidden">
          <Card className="min-w-0 basis-0 flex-[1.5] shrink">
            <CardContent className="p-5 sm:p-6 text-center min-w-0">
              <div className="min-h-[3.5rem] flex items-center justify-center mb-2">
                <VolumeAmountWithFullDetail
                  fullLabel={fullVolumeLabel}
                  compactLabel={compactVolumeLabel}
                  numberClassName="max-w-full text-3xl font-bold text-foreground tabular-nums leading-tight"
                />
              </div>
              <div className="text-base sm:text-lg font-medium text-muted-foreground">{t("dashboard.totalVolume")}</div>
            </CardContent>
          </Card>

          <Card className="min-w-0 basis-0 flex-1 shrink">
            <CardContent className="p-5 sm:p-6 text-center min-w-0">
              <div
                className="min-h-[3.5rem] flex items-center justify-center mb-2"
                title={String(completedTransactions)}
              >
                <span className="max-w-full text-3xl font-bold text-foreground tabular-nums leading-tight truncate">
                  {completedTransactions}
                </span>
              </div>
              <div className="text-base sm:text-lg font-medium text-muted-foreground">{t("dashboard.transactions")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stats — tablet/desktop (full amount; no compact K/M or popover) */}
        <div className="px-5 sm:px-6 hidden sm:flex gap-3 sm:gap-6">
          <Card className="flex-[1.5] sm:flex-1">
            <CardContent className="p-5 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {formatCurrencyValue(totalSentValue, baseCurrency)}
              </div>
              <div className="text-base sm:text-lg font-medium text-muted-foreground">{t("dashboard.totalVolume")}</div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-5 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{completedTransactions}</div>
              <div className="text-base sm:text-lg font-medium text-muted-foreground">{t("dashboard.transactions")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Minimal Modern Banking Style (All Screen Sizes) */}
        <div className="px-5 sm:px-6 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Send Button */}
          <Link href="/send" className="flex-1 group">
            <div className="w-full flex flex-col items-center justify-center gap-2 sm:gap-2.5 py-4 sm:py-5 cursor-pointer transition-all duration-200">
              <div className="p-3 sm:p-3.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="text-primary text-xs sm:text-sm font-semibold tracking-wide">{t("dashboard.send")}</span>
            </div>
          </Link>
          
          {/* Recipient Button */}
          <Link href="/recipients" className="flex-1 group">
            <div className="w-full flex flex-col items-center justify-center gap-2 sm:gap-2.5 py-4 sm:py-5 cursor-pointer transition-all duration-200">
              <div className="p-3 sm:p-3.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="text-primary text-xs sm:text-sm font-semibold tracking-wide">{t("dashboard.recipient")}</span>
            </div>
          </Link>
        </div>

        {/* Recent Transactions - Mobile Style */}
        <div className="px-5 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t("dashboard.recentTransactions")}</h2>
            <Link href="/transactions" prefetch className="text-sm sm:text-base text-primary font-medium hover:underline">
              {t("dashboard.seeAll")}
            </Link>
          </div>

          {!transactions || transactions.length === 0 ? (
            <div className="bg-card rounded-xl p-8 sm:p-12 text-center border border-border">
              <p className="text-base sm:text-lg text-gray-600 mb-4">{t("dashboard.noRecentTransactions")}</p>
              <Link href="/send">
                <div className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                  {t("dashboard.sendFirstTransfer")}
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {recentTransactions.map((transaction) => {
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
                                  {t("dashboard.referralPayout")}
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
                              {t("dashboard.withdrawalTo")}
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              {transaction.recipient?.full_name || t("dashboard.recipientFallback")}
                            </p>
                            {transaction.recipient?.bank_name && (
                              <p className="text-sm text-gray-600 mt-0.5">{transaction.recipient.bank_name}</p>
                            )}
                            <div className="mt-3 pt-3 border-t border-indigo-100/80 flex items-center justify-between gap-2 text-base sm:text-lg">
                              <span className="text-gray-600">{t("dashboard.recipientReceives")}</span>
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
                            {t("dashboard.to")}
                          </div>
                          <div className="text-base sm:text-lg font-semibold text-gray-900">
                            {transaction.recipient?.full_name || t("dashboard.unknownRecipient")}
                          </div>
                        </div>

                        {/* Amount Section */}
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                              {t("dashboard.sendAmount")}
                            </span>
                            <span className="text-xl sm:text-2xl font-semibold text-gray-900 tabular-nums">
                              {formatAmount(transaction.send_amount || 0, transaction.send_currency || "")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                              {t("dashboard.receiveAmount")}
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
              })}
            </div>
          )}
        </div>
      </div>
  )
}