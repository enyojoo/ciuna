"use client"

import { useState, useEffect, useLayoutEffect, useRef, memo } from "react"
import { useTranslation } from "react-i18next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Clock, XCircle, Copy } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { transactionService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { TransactionTimeline } from "@/components/transaction-timeline"
import { TransactionDetailsSkeleton } from "@/components/transaction-details-skeleton"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { supabase } from "@/lib/supabase"
import type { Transaction } from "@/types"
import { REFERRAL_PAYOUT_PREFIX } from "@/lib/referral-reward-service"
import { formatLocaleDateTimeLine } from "@/lib/format-date-locale"

const TX_DETAIL_CACHE_VERSION = 1
/** Hide “took / delayed” copy under the amount after this long post-completion */
const COMPLETED_TIMER_DISPLAY_TTL_MS = 24 * 60 * 60 * 1000

function txDetailStorageKey(userId: string, rawTxId: string) {
  return `ciuna_tx_detail_v${TX_DETAIL_CACHE_VERSION}_${userId}_${rawTxId.toUpperCase()}`
}

function readTxDetailFromCache(userId: string, rawTxId: string): Transaction | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(txDetailStorageKey(userId, rawTxId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { transaction?: Transaction }
    const tx = parsed.transaction
    if (!tx?.transaction_id || tx.user_id !== userId) return null
    if (tx.transaction_id.toUpperCase() !== rawTxId.toUpperCase()) return null
    return tx
  } catch {
    return null
  }
}

function writeTxDetailToCache(userId: string, tx: Transaction) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      txDetailStorageKey(userId, tx.transaction_id),
      JSON.stringify({ transaction: tx }),
    )
  } catch {
    /* ignore quota */
  }
}

function TransactionStatusPage() {
  const { t, i18n } = useTranslation("app")
  const dateLocale = i18n.resolvedLanguage || i18n.language || "en"
  const router = useRouter()
  const params = useParams()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { currencies, refreshCurrencies } = useUserData()
  const transactionId = params.id as string

  useEffect(() => {
    if (userProfile?.id) {
      void refreshCurrencies()
    }
  }, [userProfile?.id, refreshCurrencies])

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [timerDuration, setTimerDuration] = useState(3600) // receive_currency: currencies.receive_completion_timer_seconds
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const transactionRef = useRef<Transaction | null>(null)
  transactionRef.current = transaction

  useEffect(() => {
    if (!transaction || currencies.length === 0) return
    const row = currencies.find((c) => c.code === transaction.receive_currency)
    setTimerDuration(row?.receive_completion_timer_seconds ?? 3600)
  }, [transaction, currencies])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useLayoutEffect(() => {
    if (authLoading || !user?.id || !transactionId) return
    const cached = readTxDetailFromCache(user.id, transactionId)
    if (cached) {
      setTransaction(cached)
      setError(null)
    }
  }, [authLoading, user?.id, transactionId])

  // Load transaction data from Supabase (revalidate; cache hydrates layout first)
  useEffect(() => {
    const loadTransaction = async () => {
      if (authLoading) return

      if (!user?.id) {
        router.push("/auth/login")
        return
      }

      if (!transactionId) {
        setHasAttemptedLoad(true)
        return
      }

      try {
        setError(null)

        const transactionData = await transactionService.getById(transactionId.toUpperCase())

        if (transactionData.user_id !== user.id) {
          setError(t("txDetail.errorNotFound"))
          setHasAttemptedLoad(true)
          return
        }

        setTransaction(transactionData)
        setHasAttemptedLoad(true)
      } catch (err) {
        console.error("Error loading transaction:", err)
        setHasAttemptedLoad(true)
        if (transactionRef.current) {
          setError(null)
        } else {
          setError(t("txDetail.errorLoadFailed"))
        }
      }
    }

    loadTransaction()
  }, [transactionId, user?.id, authLoading, router, t])

  useEffect(() => {
    if (!user?.id || !transaction) return
    writeTxDetailToCache(user.id, transaction)
  }, [user?.id, transaction])

  // Real-time subscription for transaction updates
  useEffect(() => {
    if (!transaction || !user?.id || !transactionId) return

    let pollInterval: NodeJS.Timeout | null = null
    let channel: any = null

    // Set up Supabase Realtime subscription for instant updates
    channel = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `transaction_id=eq.${transactionId.toUpperCase()}`,
        },
        async (payload: any) => {
          console.log('Transaction update received via Realtime:', payload)
          try {
            // Fetch full transaction data with relations
            const updatedTransaction = await transactionService.getById(transactionId.toUpperCase())
            if (updatedTransaction) {
              // Use functional update to ensure state change is detected
              setTransaction((prev) => {
                // Only update if something actually changed
                if (prev && (
                  prev.status !== updatedTransaction.status ||
                  prev.updated_at !== updatedTransaction.updated_at ||
                  prev.receipt_url !== updatedTransaction.receipt_url ||
                  prev.fulfillment_type !== updatedTransaction.fulfillment_type ||
                  prev.logistics_fee_amount !== updatedTransaction.logistics_fee_amount
                )) {
                  return updatedTransaction
                }
                return prev
              })
            }
          } catch (error) {
            console.error("Error fetching updated transaction:", error)
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to transaction updates via Realtime')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime subscription error, falling back to polling')
          // Realtime subscription failed - start polling immediately
          if (!pollInterval) {
            pollInterval = setInterval(async () => {
              try {
                const updatedTransaction = await transactionService.getById(transactionId.toUpperCase())
                if (updatedTransaction) {
                  setTransaction((prev) => {
                    if (prev && (
                      prev.status !== updatedTransaction.status ||
                      prev.updated_at !== updatedTransaction.updated_at ||
                      prev.receipt_url !== updatedTransaction.receipt_url
                    )) {
                      return updatedTransaction
                    }
                    return prev
                  })
                }
              } catch (error) {
                console.error("Error polling transaction status:", error)
              }
            }, 5000) // Poll every 5 seconds as fallback
          }
        }
      })

    // Fallback: Poll every 5 seconds if Realtime is not available
    // Start polling after a delay to give Realtime a chance
    const pollTimeout = setTimeout(() => {
      pollInterval = setInterval(async () => {
      try {
          const updatedTransaction = await transactionService.getById(transactionId.toUpperCase())
          if (updatedTransaction) {
            setTransaction((prev) => {
              if (prev && (
                prev.status !== updatedTransaction.status ||
                prev.updated_at !== updatedTransaction.updated_at ||
                prev.receipt_url !== updatedTransaction.receipt_url
              )) {
                return updatedTransaction
              }
              return prev
            })
        }
      } catch (error) {
        console.error("Error polling transaction status:", error)
      }
    }, 5000) // Poll every 5 seconds as fallback
    }, 10000) // Wait 10 seconds before starting polling (give Realtime time to connect)

    return () => {
      if (channel) {
      supabase.removeChannel(channel)
      }
      if (pollInterval) {
      clearInterval(pollInterval)
      }
      clearTimeout(pollTimeout)
    }
  }, [transactionId, user?.id]) // Remove transaction from deps to prevent re-subscription

  const getTimeInfo = () => {
    if (!transaction) return { timeRemaining: 0, isOverdue: false, elapsedTime: 0 }

    const createdAt = new Date(transaction.created_at).getTime()
    const estimatedCompletionTime = 30 * 60 * 1000 // 30 minutes in milliseconds
    const targetCompletionTime = createdAt + estimatedCompletionTime
    const elapsedTime = currentTime - createdAt
    const timeRemaining = Math.max(0, targetCompletionTime - currentTime)
    const isOverdue = currentTime > targetCompletionTime

    return {
      timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
      isOverdue,
      elapsedTime: Math.floor(elapsedTime / 1000), // in seconds
    }
  }

  // Calculate elapsed time in seconds
  const getElapsedTime = (): number => {
    if (!transaction) return 0
    
    const createdAt = new Date(transaction.created_at).getTime()
    
    if (transaction.status === "completed") {
      // For completed, use completed_at or updated_at
      const completedAt = transaction.completed_at 
        ? new Date(transaction.completed_at).getTime()
        : new Date(transaction.updated_at).getTime()
      return Math.floor((completedAt - createdAt) / 1000)
    } else {
      // For pending/processing, use current time
      return Math.floor((currentTime - createdAt) / 1000)
    }
  }

  // Calculate remaining time for pending/processing
  const getRemainingTime = (): number => {
    const elapsed = getElapsedTime()
    const remaining = timerDuration - elapsed
    return Math.max(0, remaining)
  }

  // Calculate delay for completed transactions or when timer has finished
  const getDelay = (): number => {
    if (!transaction) return 0
    const elapsed = getElapsedTime()
    const delay = elapsed - timerDuration
    return Math.max(0, delay)
  }

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Get timer display text
  const getTimerDisplay = (): string | null => {
    if (!transaction) return null

    if (typeof transaction.reference === "string" && transaction.reference.startsWith(REFERRAL_PAYOUT_PREFIX)) {
      return null
    }

    // Don't show timer for failed/cancelled
    if (transaction.status === "failed" || transaction.status === "cancelled") {
      return null
    }

    if (transaction.status === "completed") {
      const completedAtMs = transaction.completed_at
        ? new Date(transaction.completed_at).getTime()
        : new Date(transaction.updated_at).getTime()
      if (
        Number.isFinite(completedAtMs) &&
        currentTime - completedAtMs >= COMPLETED_TIMER_DISPLAY_TTL_MS
      ) {
        return null
      }

      const elapsed = getElapsedTime()
      const delay = getDelay()

      if (delay > 0) {
        return t("txDetail.timerTookDelayed", { elapsed: formatTime(elapsed), delay: formatTime(delay) })
      } else {
        return t("txDetail.timerTook", { elapsed: formatTime(elapsed) })
      }
    } else {
      // Pending or processing
      const remaining = getRemainingTime()
      const delay = getDelay()
      
      // If timer has finished (remaining <= 0), show delayed time
      if (remaining <= 0 && delay > 0) {
        return t("txDetail.timerDelayed", { delay: formatTime(delay) })
      }
      
      // Otherwise show countdown
      return t("txDetail.timerTimeLeft", { time: formatTime(remaining) })
    }
  }


  const getStatusSteps = (currentStatus: string) => {
    // If transaction is failed or cancelled, show different steps
    if (currentStatus === "failed" || currentStatus === "cancelled") {
      return [
        {
          id: "pending",
          title: t("txDetail.stepTxnInitiated"),
          completed: true,
          icon: <Check className="h-4 w-4 text-white" />,
        },
        {
          id: "processing",
          title: t("txDetail.stepPaymentReceived"),
          completed: false,
          icon: <XCircle className="h-4 w-4 text-white" />,
        },
        {
          id: "initiated",
          title: t("txDetail.stepTransferInitiated"),
          completed: false,
          icon: <XCircle className="h-4 w-4 text-white" />,
        },
        {
          id: "completed",
          title: currentStatus === "failed" ? t("txDetail.stepTransferFailed") : t("txDetail.stepTransferCancelled"),
          completed: false,
          icon: <XCircle className="h-4 w-4 text-white" />,
        },
      ]
    }

    return [
      {
        id: "pending",
        title: t("txDetail.stepTxnCreated"),
        completed: true,
        icon: <Check className="h-4 w-4 text-white" />,
      },
        {
          id: "processing",
          title: t("txDetail.stepPaymentReceived"),
          completed: ["processing", "completed"].includes(currentStatus),
          icon: ["processing", "completed"].includes(currentStatus) ? (
            <Check className="h-4 w-4 text-white" />
          ) : currentStatus === "pending" ? (
            <Clock className="h-4 w-4 text-white" />
          ) : (
            <span className="text-gray-500 text-xs">2</span>
          ),
        },
        {
          id: "completed",
          title: t("txDetail.stepTransferComplete"),
          completed: currentStatus === "completed",
            icon:
            currentStatus === "completed" ? (
              <Check className="h-4 w-4 text-white" />
            ) : currentStatus === "processing" ? (
              <Clock className="h-4 w-4 text-white" />
            ) : (
              <span className="text-gray-500 text-xs">3</span>
            ),
        },
    ]
  }

  const getStatusColor = (step: any, currentStatus: string) => {
    if (step.completed) return "bg-green-500"
    if (currentStatus === "failed" || currentStatus === "cancelled") return "bg-red-500"
    if (step.id === "processing" && currentStatus === "pending") return "bg-yellow-500"
    if (step.id === "completed" && currentStatus === "processing") return "bg-yellow-500"
    return "bg-gray-300"
  }

  const getStatusTextColor = (step: any, currentStatus: string) => {
    if (step.completed) return "text-green-600"
    if (currentStatus === "failed" || currentStatus === "cancelled") return "text-red-600"
    if (step.id === "processing" && currentStatus === "pending") return "text-yellow-600"
    if (step.id === "completed" && currentStatus === "processing") return "text-yellow-600"
    return "text-gray-500"
  }

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    const currencyData = currencies.find((c) => c.code === currency)
    const symbol = currencyData?.symbol || currency
    return `${symbol}${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const formatTimestamp = (dateString: string) => formatLocaleDateTimeLine(dateString, dateLocale)


  const getStatusMessage = (status: string, isReferralPayout: boolean) => {
    if (isReferralPayout) {
      switch (status) {
        case "pending":
          return {
            title: t("txDetail.payoutRequestSubmitted"),
            description: t("txDetail.payoutRequestSubmittedDesc"),
            isCompleted: false,
          }
        case "processing":
          return {
            title: t("txDetail.payoutProcessing"),
            description: t("txDetail.payoutProcessingDesc"),
            isCompleted: false,
          }
        case "completed":
          return {
            title: t("txDetail.payoutComplete"),
            description: t("txDetail.payoutCompleteDesc"),
            isCompleted: true,
          }
        case "failed":
          return {
            title: t("txDetail.payoutFailed"),
            description: t("txDetail.payoutFailedDesc"),
            isCompleted: false,
          }
        case "cancelled":
          return {
            title: t("txDetail.payoutCancelled"),
            description: t("txDetail.payoutCancelledDesc"),
            isCompleted: false,
          }
        default:
          return {
            title: t("txDetail.payoutProcessingGeneric"),
            description: t("txDetail.payoutProcessingGenericDesc"),
            isCompleted: false,
          }
      }
    }
    switch (status) {
      case "pending":
        return {
          title: t("txDetail.statusTxnCreated"),
          description: t("txDetail.statusTxnCreatedDesc"),
          isCompleted: false,
        }
      case "processing":
        return {
          title: t("txDetail.statusPaymentReceived"),
          description: t("txDetail.statusPaymentReceivedDesc"),
          isCompleted: false,
        }
      case "completed":
        return {
          title: t("txDetail.statusTransferComplete"),
          description: t("txDetail.statusTransferCompleteDesc"),
          isCompleted: true,
        }
      case "failed":
        return {
          title: t("txDetail.statusTxnFailed"),
          description: t("txDetail.statusTxnFailedDesc"),
          isCompleted: false,
        }
      case "cancelled":
        return {
          title: t("txDetail.statusTxnCancelled"),
          description: t("txDetail.statusTxnCancelledDesc"),
          isCompleted: false,
        }
      default:
        return {
          title: t("txDetail.statusProcessing"),
          description: t("txDetail.statusProcessingDesc"),
          isCompleted: false,
        }
    }
  }

  if (hasAttemptedLoad && (error || !transaction)) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title={t("txDetail.transfer")} backHref="/transactions" />
        <div className="min-w-0 px-4 py-5 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="mb-4 text-red-700">{error || t("txDetail.notFound")}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-primary hover:bg-primary/90"
                >
                  {t("txDetail.backToDashboard")}
                </Button>
                {error && error === t("txDetail.errorNotFound") && (
                  <Button onClick={() => router.push("/auth/login")} variant="outline">
                    {t("txDetail.login")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (authLoading || (!hasAttemptedLoad && !transaction)) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title={t("txDetail.transfer")} backHref="/transactions" />
        <div className="min-w-0 px-4 py-5 sm:p-6">
          <TransactionDetailsSkeleton />
        </div>
      </div>
    )
  }

  const isReferralPayout =
    typeof transaction.reference === "string" && transaction.reference.startsWith(REFERRAL_PAYOUT_PREFIX)

  const statusMessage = getStatusMessage(transaction.status, isReferralPayout)
  const statusSteps = getStatusSteps(transaction.status)
  const { timeRemaining, isOverdue } = getTimeInfo()

  return (
    <div className="min-w-0 space-y-0">
      <AppPageHeader
        title={isReferralPayout ? t("txDetail.referralPayout") : t("txDetail.transfer")}
        backHref={isReferralPayout ? "/more/referrals" : "/transactions"}
      />
    <div className="min-w-0 px-4 py-5 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <div className="min-w-0 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 leading-none">
                    <div className="flex min-w-0 max-w-full flex-col items-center gap-1 sm:items-start">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <span className="text-xs font-medium uppercase leading-tight tracking-wide text-gray-500">
                          {isReferralPayout ? t("txDetail.payoutStatus") : t("txDetail.transactionStatus")}
                        </span>
                      </div>
                      <span className="text-app-tx-amount max-w-full break-words text-center font-bold leading-tight text-gray-900 sm:text-left">
                        {transaction && formatCurrency(transaction.send_amount, transaction.send_currency)}
                      </span>
                      {transaction && getTimerDisplay() && (
                        <div className="flex items-center justify-center sm:hidden text-orange-600 mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="font-mono text-xs">{getTimerDisplay()}</span>
                        </div>
                      )}
                    </div>
                    {transaction && getTimerDisplay() && (
                      <div className="hidden sm:flex items-center text-orange-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-mono text-sm">{getTimerDisplay()}</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Transaction ID for pending, processing, or completed statuses */}
                  {transaction.status === "pending" ||
                  transaction.status === "processing" ||
                  transaction.status === "completed" ? (
                    <div className="pb-4 border-b">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-gray-600">{t("txDetail.transactionId")}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-900">{transaction.transaction_id}</span>
                          <button
                            onClick={() => handleCopy(transaction.transaction_id, "transactionId")}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={t("txDetail.copyTxnId")}
                          >
                            {copiedStates.transactionId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Show Timeline for pending, processing, or completed statuses */}
                  {transaction.status === "pending" ||
                  transaction.status === "processing" ||
                  transaction.status === "completed" ? (
                    <TransactionTimeline transaction={transaction} />
                  ) : (
                    /* Show current UI for failed/cancelled statuses */
                    <>
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            transaction.status === "failed"
                              ? "bg-red-100"
                              : transaction.status === "cancelled"
                                ? "bg-gray-100"
                                : "bg-yellow-100"
                          }`}
                        >
                          {transaction.status === "failed" ? (
                            <XCircle className="h-8 w-8 text-red-600" />
                          ) : transaction.status === "cancelled" ? (
                            <XCircle className="h-8 w-8 text-gray-600" />
                          ) : (
                            <Clock className="h-8 w-8 text-yellow-600" />
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          {statusMessage.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">{statusMessage.description}</p>
                        
                        {/* Transaction ID and Created for failed/cancelled */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{t("txDetail.transactionId")}:</span>
                            <span className="font-mono text-gray-900">{transaction.transaction_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{t("txDetail.createdLabel")}</span>
                            <span className="text-gray-900">{formatTimestamp(transaction.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Information */}
                      <div
                        className={`rounded-lg p-4 ${
                          transaction.status === "failed" ? "bg-red-50" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {transaction.status === "failed" ? t("txDetail.failedLabel") : t("txDetail.statusLabel")}
                          </span>
                          <span className="font-medium text-sm sm:text-base">
                            {formatTimestamp(transaction.updated_at)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}


                  {/* Receipt Section */}
                  {transaction.receipt_url && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                          <p className="font-medium text-gray-900">{t("txDetail.receiptUploaded")}</p>
                          <p className="text-sm text-gray-600">{transaction.receipt_filename || t("txDetail.receiptFile")}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {!isReferralPayout && (
                      <Button variant="outline" onClick={() => router.push("/send")} className="flex-1">
                        {t("txDetail.sendAgain")}
                      </Button>
                    )}
                    {isReferralPayout && (
                      <Button
                        variant="outline"
                        onClick={() => router.push("/more/referrals")}
                        className="flex-1"
                      >
                        {t("txDetail.backToReferrals")}
                      </Button>
                    )}
                    {isOverdue && transaction.status !== "completed" && transaction.status !== "failed" ? (
                      <Button
                        onClick={() => router.push("/support")}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        {t("txDetail.contactSupport")}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push("/dashboard")}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {t("txDetail.dashboard")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Summary Sidebar */}
            <div className="min-w-0 lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    {isReferralPayout ? t("txDetail.payoutSummary") : t("txDetail.transactionSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{isReferralPayout ? t("txDetail.withdrawalAmount") : t("txDetail.youSent")}</span>
                      <span className="shrink-0 text-right font-semibold tabular-nums">
                        {formatCurrency(transaction.send_amount, transaction.send_currency)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("txDetail.fee")}</span>
                      <span
                        className={`shrink-0 text-right font-medium tabular-nums ${transaction.fee_amount === 0 ? "text-green-600" : "text-gray-900"}`}
                      >
                        {transaction.fee_amount === 0
                          ? t("txDetail.free")
                          : formatCurrency(transaction.fee_amount, transaction.send_currency)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("txDetail.recipientGets")}</span>
                      <span className="shrink-0 text-right font-semibold tabular-nums">
                        {formatCurrency(transaction.receive_amount, transaction.receive_currency)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("txDetail.exchangeRate")}</span>
                      <span className="shrink-0 text-right text-sm">
                        1 {transaction.send_currency} = {transaction.exchange_rate.toFixed(2)}{" "}
                        {transaction.receive_currency}
                      </span>
                    </div>
                    {transaction.fulfillment_type === "cash_hand" ? (
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <span className="min-w-0 text-gray-600">{t("txDetail.logisticsFee")}</span>
                        <span
                          className={`shrink-0 text-right font-medium tabular-nums ${
                            (transaction.logistics_fee_amount ?? 0) === 0 ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {(transaction.logistics_fee_amount ?? 0) === 0
                            ? t("txDetail.free")
                            : formatCurrency(transaction.logistics_fee_amount ?? 0, transaction.send_currency)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex min-w-0 items-start justify-between gap-2 border-t pt-2">
                      <span className="min-w-0 text-gray-600">{t("txDetail.totalPaid")}</span>
                      <span className="shrink-0 text-right font-semibold tabular-nums">
                        {formatCurrency(transaction.total_amount, transaction.send_currency)}
                      </span>
                    </div>
                  </div>

                  {transaction.fulfillment_type === "cash_hand" &&
                    (transaction.delivery_address_line || transaction.delivery_phone) && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">{t("txDetail.cashDelivery")}</h4>
                        <div className="space-y-1 text-sm">
                          {transaction.delivery_address_line ? (
                            <p className="text-gray-700">{transaction.delivery_address_line}</p>
                          ) : null}
                          {transaction.delivery_phone ? (
                            <p className="text-gray-600">{transaction.delivery_phone}</p>
                          ) : null}
                        </div>
                      </div>
                    )}
                  {transaction.recipient && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">{t("txDetail.recipient")}</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-sm sm:text-base font-medium">{transaction.recipient.full_name}</p>
                        <p className="text-gray-600">{transaction.recipient.account_number}</p>
                        <p className="text-gray-600">{transaction.recipient.bank_name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(TransactionStatusPage)
