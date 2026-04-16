"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  Copy,
  Coins,
  MapPin,
  Package2,
  Phone,
  QrCode,
  Search,
  Smartphone,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  CurrencyFlagIcon,
  CurrencyPickerPopover,
  CurrencyPickerSheet,
  CurrencyPickerTrigger,
} from "@/components/send/currency-picker-sheet"
import type { HubProductRow } from "@/lib/hub-types"
import {
  isHubProductCacheFresh,
  readStaleHubProductCache,
  writeHubProductCache,
} from "@/lib/hub-client-cache"
import type { Currency, ExchangeRate } from "@/types"
import { deliveryAddressService, paymentMethodService, transactionService, userService } from "@/lib/database"
import { generateTransactionId } from "@/lib/transaction-id"
import { roundMoney, formatCurrency, getCurrencyNarrowSymbol } from "@/utils/currency"
import { cn } from "@/lib/utils"
import { accountFieldLabel } from "@/lib/account-field-i18n"
import { formatFieldValue, getAccountTypeConfigFromCurrency } from "@/lib/currency-account-types"
import { hubPayMatchesProductCurrency, hubSyntheticSameCurrencyRateRow } from "@/lib/hub-same-currency-rate"

type PaymentMethod = {
  id: string
  currency: string
  type: "bank_account" | "qr_code" | "stablecoin" | "mobile_money"
  name: string
  account_name?: string
  account_number?: string
  bank_name?: string
  routing_number?: string
  sort_code?: string
  iban?: string
  swift_bic?: string
  qr_code_data?: string
  crypto_asset?: string
  crypto_network?: string
  wallet_address?: string
  instructions?: string
  is_default?: boolean
  status?: string
}

function parseSlaText(slaText: string | null | undefined, t: (key: string, options?: Record<string, unknown>) => string) {
  const raw = String(slaText || "").trim()
  if (!raw) return t("hub.checkout.defaultSla", { defaultValue: "We reach out after payment." })
  const hhmmss = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})$/)
  if (!hhmmss) return raw

  const hours = Number.parseInt(hhmmss[1], 10) || 0
  const minutes = Number.parseInt(hhmmss[2], 10) || 0
  if (hours > 0 && minutes > 0) return t("send.arrivalDurationHoursMinutes", { hours, minutes })
  if (hours > 0) return t("send.arrivalDurationHours", { count: hours })
  if (minutes > 0) return t("send.arrivalDurationMinutes", { count: minutes })
  return t("hub.checkout.defaultSla", { defaultValue: "We reach out after payment." })
}

function PaymentDetailRow({
  label,
  value,
  onCopy,
  copied,
  mono = false,
}: {
  label: string
  value?: string | null
  onCopy: () => void
  copied: boolean
  mono?: boolean
}) {
  if (!value?.trim()) return null

  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-start gap-2">
        <span className={cn("min-w-0 break-all text-sm font-medium text-gray-900", mono && "font-mono")}>{value}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onCopy} className="h-6 w-6 shrink-0 p-0">
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}

export default function HubCheckoutPage() {
  const { t } = useTranslation("app")
  const params = useParams()
  const productId = params.productId as string
  const router = useRouter()
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth()
  const { currencies, exchangeRates, deliveryAddresses, refreshDeliveryAddresses } = useUserData()
  const idempotencyKeyRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  )
  const cacheUserId = user?.id ?? userProfile?.id ?? ""

  const [product, setProduct] = useState<HubProductRow | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [step, setStep] = useState(1)
  const [sendCurrency, setSendCurrency] = useState("")
  const [fundedInput, setFundedInput] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState("")
  const [deliverySearch, setDeliverySearch] = useState("")
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({})
  const [isAddDeliveryDialogOpen, setIsAddDeliveryDialogOpen] = useState(false)
  const [newDeliveryData, setNewDeliveryData] = useState({ addressLine: "", phone: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("")
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [sendDropdownOpen, setSendDropdownOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [transactionIdNote, setTransactionIdNote] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const receiveCurrency = useMemo(() => {
    if (!product) return ""
    if (product.pricing_type === "fixed") return String(product.fixed_currency || "USD")
    return String(product.default_input_currency || "USD")
  }, [product])

  useLayoutEffect(() => {
    if (!cacheUserId || !productId) return
    setProduct((prev) => {
      if (prev) return prev
      return readStaleHubProductCache(cacheUserId, productId)
    })
    const stale = readStaleHubProductCache(cacheUserId, productId)
    const hasProduct = Boolean(stale)
    const cacheFresh = isHubProductCacheFresh(cacheUserId, productId)
    setLoadingProduct(!cacheFresh && !hasProduct)
  }, [cacheUserId, productId])

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    if (!cacheUserId || !productId) return
    if (isHubProductCacheFresh(cacheUserId, productId)) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWithAuth(`/api/hub/products/${productId}`)
        if (!res.ok) throw new Error("404")
        const data = await res.json()
        const row = data.product as HubProductRow
        if (!cancelled) {
          setProduct(row)
          if (row) writeHubProductCache(cacheUserId, row)
        }
      } catch {
        if (!cancelled) setProduct(null)
      } finally {
        if (!cancelled) setLoadingProduct(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, productId, router, cacheUserId])

  useEffect(() => {
    if (!currencies.length || sendCurrency) return
    const preferred =
      currencies.find((c) => c.can_send !== false && c.code === "RUB") ||
      currencies.find((c) => c.can_send !== false && c.code === (userProfile?.base_currency || "")) ||
      currencies.find((c) => c.can_send !== false && c.code === "USD") ||
      currencies.find((c) => c.can_send !== false)
    if (preferred) setSendCurrency(preferred.code)
  }, [currencies, sendCurrency, userProfile?.base_currency])

  useEffect(() => {
    const fullName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(" ").trim()
    if (fullName) setContactName((prev) => prev || fullName)
  }, [userProfile?.first_name, userProfile?.last_name])

  useEffect(() => {
    if (userProfile?.phone) {
      setContactPhone((prev) => prev || userProfile.phone || "")
    }
  }, [userProfile?.phone])

  useEffect(() => {
    if (step === 3 && !transactionIdNote) {
      setTransactionIdNote(generateTransactionId())
    }
  }, [step, transactionIdNote])

  useEffect(() => {
    if (!product || product.pricing_type !== "user_input") return
    const minAmount = product.funded_min != null ? Number(product.funded_min) : null
    if (minAmount == null || Number.isNaN(minAmount) || minAmount <= 0) return
    setFundedInput((prev) => (prev.trim() ? prev : String(minAmount)))
  }, [product?.id, product?.pricing_type, product?.funded_min])

  const sendCurrencyData = useMemo(
    () => currencies.find((currency) => currency.code === sendCurrency) || null,
    [currencies, sendCurrency],
  )

  const fundedReceiveAmount = useMemo(() => {
    if (!product) return 0
    if (product.pricing_type === "fixed") return roundMoney(Number(product.fixed_amount) || 0)
    return roundMoney(Number.parseFloat(fundedInput) || 0)
  }, [product, fundedInput])

  const hubFeeReceiveAmount = useMemo(() => {
    if (!product || fundedReceiveAmount <= 0) return 0
    return roundMoney((fundedReceiveAmount * (Number(product.fee_percent) || 0)) / 100)
  }, [fundedReceiveAmount, product])

  const subtotalReceiveAmount = useMemo(
    () => roundMoney(fundedReceiveAmount + hubFeeReceiveAmount),
    [fundedReceiveAmount, hubFeeReceiveAmount],
  )

  const rateRow = useMemo(() => {
    if (!sendCurrency || !receiveCurrency) return null
    if (hubPayMatchesProductCurrency(sendCurrency, receiveCurrency)) {
      return hubSyntheticSameCurrencyRateRow(sendCurrency, receiveCurrency)
    }
    return (
      (exchangeRates as ExchangeRate[]).find(
        (row) => row.from_currency === sendCurrency && row.to_currency === receiveCurrency,
      ) || null
    )
  }, [exchangeRates, sendCurrency, receiveCurrency])

  useEffect(() => {
    let cancelled = false
    if (!sendCurrency) {
      setPaymentMethods([])
      setSelectedPaymentMethodId("")
      return
    }
    ;(async () => {
      try {
        const methods = ((await paymentMethodService.getByCurrency(sendCurrency)) || []) as PaymentMethod[]
        if (cancelled) return
        const activeMethods = methods.filter((method) => method.status === "active")
        setPaymentMethods(activeMethods)
        const preferred = activeMethods.find((method) => method.is_default) || activeMethods[0]
        setSelectedPaymentMethodId(preferred?.id || "")
      } catch {
        if (!cancelled) {
          setPaymentMethods([])
          setSelectedPaymentMethodId("")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sendCurrency])

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.id === selectedPaymentMethodId) || null,
    [paymentMethods, selectedPaymentMethodId],
  )

  const pricingPreview = useMemo(() => {
    if (!rateRow || !product) return null
    const rate = Number(rateRow.rate) || 0
    if (rate <= 0 || fundedReceiveAmount <= 0) return null

    const productPrice = roundMoney(fundedReceiveAmount)
    const hubFeeReceive = roundMoney((productPrice * (Number(product.fee_percent) || 0)) / 100)
    const subtotalReceive = roundMoney(productPrice + hubFeeReceive)
    const orderTotalSend = roundMoney(subtotalReceive / rate)
    let transferFee = 0
    if (rateRow.fee_type === "fixed") transferFee = Number(rateRow.fee_amount) || 0
    else if (rateRow.fee_type === "percentage") {
      transferFee = (orderTotalSend * (Number(rateRow.fee_amount) || 0)) / 100
    }

    const fee = roundMoney(transferFee)
    return {
      productPrice,
      hubFeeReceive,
      subtotalReceive,
      orderTotalSend,
      fee,
      total: roundMoney(orderTotalSend + fee),
      exchangeRate: rate,
    }
  }, [fundedReceiveAmount, product, rateRow])

  /** FX rate from corridor config (does not depend on entered amount). */
  const liveSpotRate = useMemo(() => {
    if (!rateRow) return null
    const r = Number(rateRow.rate) || 0
    return r > 0 && Number.isFinite(r) ? r : null
  }, [rateRow])

  /**
   * Exchange fee label: when order totals aren't ready yet, show corridor settings
   * (free / fixed amount / configured %) instead of "—".
   */
  const corridorFeeRow = useMemo(() => {
    if (!rateRow || !sendCurrency) {
      return { text: "—", isFree: false }
    }
    if (pricingPreview) {
      const fee = pricingPreview.fee
      return {
        text: fee === 0 ? t("send.free") : formatCurrency(fee, sendCurrency),
        isFree: fee === 0,
      }
    }
    if (rateRow.fee_type === "free") {
      return { text: t("send.free"), isFree: true }
    }
    if (rateRow.fee_type === "fixed") {
      const amt = Number(rateRow.fee_amount) || 0
      if (amt === 0) return { text: t("send.free"), isFree: true }
      return { text: formatCurrency(amt, sendCurrency), isFree: false }
    }
    if (rateRow.fee_type === "percentage") {
      const pct = Number(rateRow.fee_amount) || 0
      if (pct === 0) return { text: t("send.free"), isFree: true }
      const pctStr = Number.isInteger(pct) ? String(pct) : String(pct)
      return {
        text: t("hub.checkout.exchangeFeePercentConfigured", {
          defaultValue: "{{pct}}%",
          pct: pctStr,
        }),
        isFree: false,
      }
    }
    return { text: t("send.free"), isFree: true }
  }, [rateRow, sendCurrency, pricingPreview, t])

  const filteredDeliveryAddresses = useMemo(() => {
    const query = deliverySearch.trim().toLowerCase()
    if (!query) return deliveryAddresses
    return deliveryAddresses.filter((address) => {
      const line = String(address.address_line || "").toLowerCase()
      const phone = String(address.phone || "").toLowerCase()
      return line.includes(query) || phone.includes(query)
    })
  }, [deliveryAddresses, deliverySearch])

  const selectedDeliveryAddress = useMemo(
    () => deliveryAddresses.find((address) => address.id === selectedDeliveryAddressId) || null,
    [deliveryAddresses, selectedDeliveryAddressId],
  )
  const fulfillmentType = product?.fulfillment_type === "in_person" ? "in_person" : "online"
  const commentText = String(formAnswers.comment || "")

  const canContinueStep1 = () => {
    if (!product || !sendCurrency || !receiveCurrency || !rateRow || !pricingPreview) return false
    if (fundedReceiveAmount <= 0) return false
    if (product.pricing_type === "user_input") {
      const min = product.funded_min != null ? Number(product.funded_min) : null
      const max = product.funded_max != null ? Number(product.funded_max) : null
      if (min != null && fundedReceiveAmount < min) return false
      if (max != null && fundedReceiveAmount > max) return false
    }
    return true
  }

  const handleCopy = async (text: string, key: string) => {
    if (!text.trim()) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 1500)
    } catch {
      setCopiedStates((prev) => ({ ...prev, [key]: false }))
    }
  }

  const persistMissingPhone = async () => {
    if (!user?.id || !contactPhone.trim() || userProfile?.phone?.trim()) return
    try {
      await userService.updateProfile(user.id, { phone: contactPhone.trim() })
      await refreshUserProfile()
    } catch (e) {
      console.error("Failed to save phone from Hub checkout", e)
    }
  }

  const handleAddDeliveryAddress = async () => {
    if (!userProfile?.id) return
    const line = newDeliveryData.addressLine.trim()
    const phone = newDeliveryData.phone.trim()
    if (!line || !phone) return

    try {
      const row = await deliveryAddressService.create(userProfile.id, {
        addressLine: line,
        phone,
      })
      await refreshDeliveryAddresses()
      setSelectedDeliveryAddressId(row.id)
      setNewDeliveryData({ addressLine: "", phone: "" })
      setIsAddDeliveryDialogOpen(false)
    } catch (e) {
      console.error("Error adding Hub delivery address:", e)
      setError(t("send.failedAddDelivery"))
    }
  }

  const handleContinue = async () => {
    setError(null)
    if (step === 1) {
      if (!user?.email_confirmed_at) {
        setError(t("hub.checkout.errors.verifyEmail"))
        return
      }
      if (!canContinueStep1()) {
        setError(t("hub.checkout.errors.checkAmount"))
        return
      }
      setStep(2)
      return
    }

    if (!contactName.trim() || !contactPhone.trim()) {
      setError(t("hub.checkout.errors.namePhoneRequired"))
      return
    }

    if (fulfillmentType === "in_person" && !selectedDeliveryAddressId) {
      setError(t("hub.checkout.errors.deliveryAddressRequired", { defaultValue: "Select a delivery address." }))
      return
    }

    await persistMissingPhone()
    setStep(3)
  }

  const handlePay = async () => {
    if (!product || !userProfile?.id || !pricingPreview) return
    if (!selectedPaymentMethodId) {
      setError(t("hub.checkout.errors.noPaymentMethodForCurrency", { currency: sendCurrency }))
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const line =
        fulfillmentType === "in_person" ? selectedDeliveryAddress?.address_line?.trim() || null : null
      const res = await fetchWithAuth("/api/hub/checkout", {
        method: "POST",
        body: JSON.stringify({
          hubProductId: product.id,
          sendCurrency,
          receiveCurrency,
          fundedAmount: product.pricing_type === "user_input" ? fundedReceiveAmount : undefined,
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
          deliveryAddressLine: line,
          deliveryAddressId: fulfillmentType === "in_person" ? selectedDeliveryAddressId || null : null,
          formAnswers: commentText.trim() ? { comment: commentText.trim() } : {},
          paymentMethodId: selectedPaymentMethodId,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t("hub.checkout.errors.paymentSetupFailed"))

      const transactionId = data.transaction?.transaction_id
      if (!transactionId) throw new Error(t("hub.checkout.errors.missingTransaction"))

      if (uploadedFile && uploadProgress === 100 && !isUploading) {
        setTimeout(async () => {
          try {
            await transactionService.uploadReceipt(transactionId, uploadedFile)
          } catch (receiptUploadError) {
            console.error("Error uploading receipt:", receiptUploadError)
          }
        }, 100)
      }

      router.push(`/hub/orders/${String(transactionId).toLowerCase()}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("hub.checkout.errors.failed"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    setUploadError(null)

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t("send.fileTooLarge"))
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError(t("send.fileTypeInvalid"))
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFileSelect(file)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFileSelect(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDismissUploadError = () => {
    setUploadError(null)
  }

  const showCheckoutSkeleton = !user || (loadingProduct && !product)

  if (showCheckoutSkeleton) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title={t("hub.checkout.title")} backHref="/hub" />
        <div className="px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-6xl animate-pulse space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="h-8 w-72 rounded bg-gray-100" />
                <div className="rounded-2xl border p-6 space-y-4">
                  <div className="h-20 rounded-xl bg-gray-100" />
                  <div className="h-20 rounded-xl bg-gray-100" />
                  <div className="h-12 w-40 rounded-xl bg-gray-100" />
                </div>
              </div>
              <div className="rounded-2xl border p-6 space-y-4">
                <div className="h-6 w-40 rounded bg-gray-100" />
                <div className="h-32 rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title={t("hub.checkout.title")} backHref="/hub" />
        <div className="px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <p className="text-red-600">{t("hub.productNotFound")}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/hub">{t("hub.hub")}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const minAmount = product.funded_min != null ? Number(product.funded_min) : null
  const maxAmount = product.funded_max != null ? Number(product.funded_max) : null
  const slaLabel = parseSlaText(product.sla_text, t)

  const renderPaymentMethodCard = () => {
    if (!selectedPaymentMethod) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t("hub.checkout.noActivePaymentMethod", { currency: sendCurrency })}
        </div>
      )
    }

    const method = selectedPaymentMethod
    const accountConfig = getAccountTypeConfigFromCurrency(sendCurrency)
    const accountType = accountConfig.accountType

    if (method.type === "bank_account") {
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">{method.name}</span>
          </div>
          <div className="space-y-4">
            <PaymentDetailRow
              label={accountFieldLabel(t, "account_name", accountConfig.fieldLabels.account_name)}
              value={method.account_name}
              onCopy={() => handleCopy(method.account_name || "", "account_name")}
              copied={!!copiedStates.account_name}
            />
            {accountType === "us" ? (
              <PaymentDetailRow
                label={accountFieldLabel(t, "routing_number", accountConfig.fieldLabels.routing_number)}
                value={formatFieldValue(accountType, "routing_number", method.routing_number || "")}
                onCopy={() => handleCopy(method.routing_number || "", "routing_number")}
                copied={!!copiedStates.routing_number}
                mono
              />
            ) : null}
            {accountType === "uk" ? (
              <PaymentDetailRow
                label={accountFieldLabel(t, "sort_code", accountConfig.fieldLabels.sort_code)}
                value={formatFieldValue(accountType, "sort_code", method.sort_code || "")}
                onCopy={() => handleCopy(method.sort_code || "", "sort_code")}
                copied={!!copiedStates.sort_code}
                mono
              />
            ) : null}
            {(accountType === "us" || accountType === "uk" || accountType === "generic") && method.account_number ? (
              <PaymentDetailRow
                label={accountFieldLabel(t, "account_number", accountConfig.fieldLabels.account_number)}
                value={method.account_number}
                onCopy={() => handleCopy(method.account_number || "", "account_number")}
                copied={!!copiedStates.account_number}
                mono
              />
            ) : null}
            {accountType === "euro" && method.iban ? (
              <PaymentDetailRow
                label={accountFieldLabel(t, "iban", accountConfig.fieldLabels.iban)}
                value={formatFieldValue(accountType, "iban", method.iban)}
                onCopy={() => handleCopy(method.iban || "", "iban")}
                copied={!!copiedStates.iban}
                mono
              />
            ) : null}
            {method.swift_bic ? (
              <PaymentDetailRow
                label={accountFieldLabel(t, "swift_bic", accountConfig.fieldLabels.swift_bic || "SWIFT/BIC")}
                value={method.swift_bic}
                onCopy={() => handleCopy(method.swift_bic || "", "swift_bic")}
                copied={!!copiedStates.swift_bic}
                mono
              />
            ) : null}
            <PaymentDetailRow
              label={accountFieldLabel(t, "bank_name", accountConfig.fieldLabels.bank_name)}
              value={method.bank_name}
              onCopy={() => handleCopy(method.bank_name || "", "bank_name")}
              copied={!!copiedStates.bank_name}
            />
          </div>
        </div>
      )
    }

    if (method.type === "qr_code") {
      return (
        <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">{method.name}</span>
            </div>
            {method.instructions ? <p className="text-sm text-gray-600">{method.instructions}</p> : null}
            {method.qr_code_data ? (
              <PaymentDetailRow
                label={t("hub.checkout.qrPayload", { defaultValue: "QR payload" })}
                value={method.qr_code_data}
                onCopy={() => handleCopy(method.qr_code_data || "", "qr_code_data")}
                copied={!!copiedStates.qr_code_data}
                mono
              />
            ) : null}
          </div>
          <div className="flex items-center justify-center rounded-xl border bg-gray-50 p-3">
            {method.qr_code_data ? (
              <QRCodeSVG value={method.qr_code_data} size={144} />
            ) : (
              <QrCode className="h-16 w-16 text-gray-300" />
            )}
          </div>
        </div>
      )
    }

    if (method.type === "stablecoin") {
      return (
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-sm">{method.name}</span>
          </div>
          {method.crypto_asset ? (
            <div className="space-y-1 mb-2">
              <span className="text-gray-600 text-xs">{t("send.cryptoAsset")}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{method.crypto_asset}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(String(method.crypto_asset || ""), "cryptoAsset")}
                  className="h-5 w-5 p-0"
                >
                  {copiedStates.cryptoAsset ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ) : null}
          {method.crypto_network ? (
            <div className="space-y-1 mb-2">
              <span className="text-gray-600 text-xs">{t("send.cryptoNetwork")}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{method.crypto_network}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(String(method.crypto_network || ""), "cryptoNetwork")}
                  className="h-5 w-5 p-0"
                >
                  {copiedStates.cryptoNetwork ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ) : null}
          {method.wallet_address?.trim() ? (
            <>
              <div className="space-y-1 mb-3">
                <span className="text-gray-600 text-xs">{t("send.walletAddress")}</span>
                <div className="flex items-start gap-2">
                  <span className="font-medium font-mono text-xs break-all flex-1">
                    {method.wallet_address.trim()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(method.wallet_address.trim(), "walletAddress")}
                    className="h-5 w-5 p-0 shrink-0"
                  >
                    {copiedStates.walletAddress ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center border border-gray-100 p-2">
                <QRCodeSVG value={method.wallet_address.trim()} size={176} level="M" includeMargin />
              </div>
            </>
          ) : (
            <p className="text-sm text-amber-700">{t("send.stablecoinMissingAddress")}</p>
          )}
          {method.instructions ? <p className="text-xs text-gray-500">{method.instructions}</p> : null}
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">{method.name}</span>
        </div>
        <div className="space-y-4">
          <PaymentDetailRow
            label={t("hub.checkout.displayName", { defaultValue: "Display name" })}
            value={method.account_name}
            onCopy={() => handleCopy(method.account_name || "", "mobile_name")}
            copied={!!copiedStates.mobile_name}
          />
          <PaymentDetailRow
            label={t("hub.checkout.phoneNumber", { defaultValue: "Phone number" })}
            value={method.account_number}
            onCopy={() => handleCopy(method.account_number || "", "mobile_number")}
            copied={!!copiedStates.mobile_number}
            mono
          />
          {method.instructions ? <p className="text-sm text-gray-600">{method.instructions}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-0">
      <AppPageHeader title={t("hub.checkout.hubCheckoutTitle", { defaultValue: "Ciuna Hub Checkout" })} backHref="/hub" />
      <div className="min-w-0 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="min-w-0 lg:col-span-2">
              {error ? (
                <div className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}

              {step === 1 ? (
                <Card className="py-4">
                  <CardContent className="space-y-6 pt-0">
                    <div className="rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 p-5 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm/6 text-orange-100">{product.category}</p>
                          <h2 className="text-2xl font-bold leading-tight">{product.title}</h2>
                        </div>
                      </div>
                      {product.short_description ? (
                        <p className="mt-3 max-w-2xl text-sm/6 text-orange-50">{product.short_description}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-700 leading-snug">
                        {product.pricing_type === "fixed"
                          ? t("hub.checkout.productPrice", { defaultValue: "Product price" })
                          : t("hub.checkout.amountToCover", { currency: receiveCurrency })}
                      </h3>
                      <div className="rounded-xl bg-gray-50 px-4 py-4">
                        <div className="flex items-center gap-2">
                          {product.pricing_type === "user_input" ? (
                            <>
                              <span
                                className="shrink-0 text-app-money-input font-bold text-gray-500 tabular-nums select-none"
                                aria-hidden
                              >
                                {getCurrencyNarrowSymbol(receiveCurrency)}
                              </span>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={fundedInput}
                                onChange={(e) => setFundedInput(e.target.value)}
                                className="text-app-money-input min-w-0 flex-1 border-0 bg-transparent font-bold outline-none"
                                placeholder="0.00"
                                aria-label={t("hub.checkout.amountToCover", { currency: receiveCurrency })}
                              />
                            </>
                          ) : (
                            <div className="text-app-money-input min-w-0 w-full font-bold text-gray-900">
                              {formatCurrency(fundedReceiveAmount, receiveCurrency)}
                            </div>
                          )}
                        </div>
                        {product.pricing_type === "user_input" && (minAmount != null || maxAmount != null) ? (
                          <p className="mt-1.5 text-xs leading-snug text-gray-500">
                            {minAmount != null
                              ? t("send.min", { amount: formatCurrency(minAmount, receiveCurrency) })
                              : null}
                            {minAmount != null && maxAmount != null ? " • " : null}
                            {maxAmount != null
                              ? t("send.max", { amount: formatCurrency(maxAmount, receiveCurrency) })
                              : null}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-700 leading-snug">{t("hub.checkout.payWith")}</h3>
                      <div className="rounded-xl bg-gray-50 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-app-money-input font-bold text-gray-900">
                              {pricingPreview
                                ? formatCurrency(pricingPreview.total, sendCurrency)
                                : formatCurrency(fundedReceiveAmount, sendCurrency || receiveCurrency)}
                            </div>
                          </div>
                          <div className="md:hidden shrink-0">
                            <CurrencyPickerTrigger
                              selectedCurrency={sendCurrency}
                              onOpen={() => setSendDropdownOpen(true)}
                              currencies={currencies}
                            />
                            <CurrencyPickerSheet
                              open={sendDropdownOpen}
                              onOpenChange={setSendDropdownOpen}
                              selectedCurrency={sendCurrency}
                              onSelect={setSendCurrency}
                              currencies={currencies}
                              type="send"
                            />
                          </div>
                          <div className="hidden md:block shrink-0">
                            <CurrencyPickerPopover
                              selectedCurrency={sendCurrency}
                              onSelect={setSendCurrency}
                              currencies={currencies}
                              type="send"
                            />
                          </div>
                        </div>

                          <div className="mt-4 space-y-3 border-t border-gray-200/80 pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                                <span className="text-[10px] font-semibold">+</span>
                              </div>
                              <span className="text-sm text-gray-600">{t("hub.checkout.hubFee")}</span>
                            </div>
                            <span className={cn("font-medium", hubFeeReceiveAmount === 0 ? "text-green-600" : "text-gray-900")}>
                              {hubFeeReceiveAmount === 0 ? t("send.free") : formatCurrency(hubFeeReceiveAmount, receiveCurrency)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="text-[10px] font-semibold">%</span>
                              </div>
                              <span className="text-sm text-gray-600">{t("send.rate")}</span>
                            </div>
                            <span className="text-sm font-medium text-primary">
                              {liveSpotRate != null && sendCurrency && receiveCurrency
                                ? `1 ${sendCurrency} = ${liveSpotRate.toFixed(2)} ${receiveCurrency}`
                                : sendCurrency && receiveCurrency
                                  ? `1 ${sendCurrency} = — ${receiveCurrency}`
                                  : "—"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-sm text-gray-600">{t("send.fee")}</span>
                            </div>
                            <span
                              className={cn(
                                "font-medium",
                                corridorFeeRow.isFree ? "text-green-600" : "text-gray-900",
                              )}
                            >
                              {corridorFeeRow.text}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                                <Clock className="h-3 w-3" />
                              </div>
                              <span className="text-sm text-gray-600">
                                {t("hub.checkout.fulfilledWithin", { defaultValue: "Fulfilled within" })}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{slaLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 z-10 -mx-6 mt-2 border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 lg:static lg:z-auto lg:mx-0 lg:mt-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                      <Button
                        type="button"
                        onClick={handleContinue}
                        className="min-h-12 w-full rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                        disabled={!canContinueStep1()}
                      >
                        {t("hub.checkout.continue")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {step === 2 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("hub.checkout.contactDetails")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t("hub.checkout.fullName")}</Label>
                        <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hub.checkout.phone")}</Label>
                        <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                      </div>
                    </div>

                    {fulfillmentType === "in_person" ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {t("send.deliveryAddressSection")}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t("hub.checkout.inPersonAddressHint", {
                                defaultValue: "Choose a saved address for this in-person fulfillment.",
                              })}
                            </p>
                          </div>
                          <Dialog open={isAddDeliveryDialogOpen} onOpenChange={setIsAddDeliveryDialogOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" className="rounded-xl">
                                {t("send.addDeliveryAddress")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-md">
                              <DialogHeader>
                                <DialogTitle>{t("send.addDeliveryAddress")}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="hub-delivery-address">{t("send.deliveryAddressLine")} *</Label>
                                  <Textarea
                                    id="hub-delivery-address"
                                    rows={3}
                                    value={newDeliveryData.addressLine}
                                    onChange={(e) =>
                                      setNewDeliveryData((prev) => ({ ...prev, addressLine: e.target.value }))
                                    }
                                    placeholder={t("send.deliveryAddressLinePlaceholder")}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="hub-delivery-phone">{t("send.deliveryPhone")} *</Label>
                                  <Input
                                    id="hub-delivery-phone"
                                    value={newDeliveryData.phone}
                                    onChange={(e) =>
                                      setNewDeliveryData((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                    placeholder={t("send.deliveryPhonePlaceholder")}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  className="w-full bg-primary hover:bg-primary/90"
                                  disabled={
                                    !newDeliveryData.addressLine.trim() || !newDeliveryData.phone.trim()
                                  }
                                  onClick={() => void handleAddDeliveryAddress()}
                                >
                                  {t("send.saveDeliveryAddress")}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            value={deliverySearch}
                            onChange={(e) => setDeliverySearch(e.target.value)}
                            placeholder={t("send.searchDeliveryAddresses")}
                            className="h-11 rounded-xl border-0 bg-gray-50 pl-9"
                          />
                        </div>

                        <div className="space-y-2">
                          {filteredDeliveryAddresses.map((address) => (
                            <button
                              key={address.id}
                              type="button"
                              onClick={() => setSelectedDeliveryAddressId(address.id)}
                              className={cn(
                                "selectable-row w-full",
                                selectedDeliveryAddressId === address.id
                                  ? "selectable-row--selected"
                                  : "selectable-row--idle",
                              )}
                            >
                              <div className="min-w-0 text-left">
                                <p className="font-medium text-gray-900">{address.address_line}</p>
                                {address.phone ? <p className="text-sm text-gray-600">{address.phone}</p> : null}
                              </div>
                              {selectedDeliveryAddressId === address.id ? (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              ) : null}
                            </button>
                          ))}
                        </div>

                        {filteredDeliveryAddresses.length === 0 && deliverySearch.trim() ? (
                          <div className="py-6 text-center text-sm text-gray-500">
                            {t("send.noDeliverySearch", { term: deliverySearch })}
                          </div>
                        ) : null}
                        {deliveryAddresses.length === 0 && !deliverySearch.trim() ? (
                          <div className="py-6 text-center text-sm text-gray-500">
                            <p>{t("send.noDeliveryAddressesYet")}</p>
                            <p>{t("send.addDeliveryHint")}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label>{t("hub.checkout.comment", { defaultValue: "Comment" })}</Label>
                      <Textarea
                        rows={4}
                        value={commentText}
                        onChange={(e) => setFormAnswers((prev) => ({ ...prev, comment: e.target.value }))}
                        placeholder={t("hub.checkout.commentPlaceholder", {
                          defaultValue: "Add any important notes for this order.",
                        })}
                      />
                    </div>

                    <div className="flex gap-3 sm:gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="min-h-12 flex-1">
                        {t("hub.checkout.back")}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => void handleContinue()}
                        className="min-h-12 flex-1 rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                      >
                        {t("hub.checkout.continue")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {step === 3 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("hub.checkout.makePayment")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-primary shadow-sm ring-2 ring-primary/20">
                        {sendCurrencyData ? <CurrencyFlagIcon currency={sendCurrencyData} /> : null}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary">
                          {t("hub.checkout.transferLine", {
                            defaultValue: "Transfer {{amount}}",
                            amount: formatCurrency(pricingPreview?.total || 0, sendCurrency),
                          })}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="space-y-3">{renderPaymentMethodCard()}</div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 text-xs uppercase tracking-wide">
                          {t("send.importantInstructions")}
                        </h4>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <ul className="text-xs text-amber-700 space-y-1.5">
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5 text-xs">•</span>
                              <span>
                                {t("send.transferExactly")}{" "}
                                <strong>{formatCurrency(pricingPreview?.total || 0, sendCurrency)}</strong>
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5 text-xs">•</span>
                              <span className="flex-1">
                                {t("send.noteTransactionId")}{" "}
                                <span className="inline-flex items-center gap-1">
                                  <strong>{transactionIdNote}</strong>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(transactionIdNote, "transactionIdInstructions")}
                                    className="h-4 w-4 p-0 hover:bg-amber-100"
                                  >
                                    {copiedStates.transactionIdInstructions ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-amber-700" />
                                    )}
                                  </Button>
                                </span>
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5 text-xs">•</span>
                              <span>
                                {t("send.completeWithin")} <strong>{t("send.aFewMinutes")}</strong>
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5 text-xs">•</span>
                              <span>{t("send.uploadReceiptVerify")}</span>
                            </li>
                            {selectedPaymentMethod?.type === "qr_code" ? (
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                <span>{t("send.scanQrBanking")}</span>
                              </li>
                            ) : null}
                            {selectedPaymentMethod?.type === "stablecoin" ? (
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                <span>{t("send.scanWalletQr")}</span>
                              </li>
                            ) : null}
                            {selectedPaymentMethod?.type === "mobile_money" ? (
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                <span>{t("send.payMobileMoney")}</span>
                              </li>
                            ) : null}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />

                      {uploadError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-red-700 font-medium">{t("send.uploadError")}</p>
                              <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleDismissUploadError}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      <div
                        onClick={handleUploadClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200",
                          isDragOver
                            ? "border-primary bg-primary/[0.06] shadow-sm ring-2 ring-primary/35"
                            : uploadedFile
                              ? "border-green-300 bg-green-50"
                              : uploadError
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-primary/35",
                        )}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              uploadedFile
                                ? "bg-green-100"
                                : uploadError
                                  ? "bg-red-100"
                                  : isDragOver
                                    ? "bg-primary/10"
                                    : "bg-gray-100"
                            }`}
                          >
                            {uploadedFile ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : uploadError ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <Upload className={`h-5 w-5 transition-colors ${isDragOver ? "text-primary" : "text-gray-400"}`} />
                            )}
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 text-sm truncate" title={uploadedFile?.name}>
                              {uploadedFile
                                ? uploadedFile.name
                                : uploadError
                                  ? t("send.uploadFailed")
                                  : t("send.uploadReceipt")}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {uploadedFile
                                ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                                : uploadError
                                  ? t("send.clickTryAgain")
                                  : t("send.fileTypesHint")}
                            </p>
                          </div>
                          {uploadedFile ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFile()
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          ) : null}
                        </div>

                        {isUploading ? (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>{t("send.uploading")}</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={submitting} className="min-h-12 flex-1">
                        {t("hub.checkout.back")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handlePay}
                        disabled={submitting || !pricingPreview || !selectedPaymentMethodId}
                        className="min-h-12 flex-1 rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                      >
                        {submitting ? t("hub.checkout.creating") : t("send.ivePaid")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="min-w-0">
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-lg">{t("hub.checkout.orderSummary", { defaultValue: "Order summary" })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("hub.checkout.productLabel", { defaultValue: "Product" })}</span>
                      <span className="text-right font-semibold text-gray-900">{product.title}</span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("hub.checkout.productPrice", { defaultValue: "Product price" })}</span>
                      <span className="shrink-0 text-right font-semibold tabular-nums">
                        {formatCurrency(fundedReceiveAmount, receiveCurrency)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("hub.checkout.hubFee")}</span>
                      <span className={cn("shrink-0 text-right font-semibold tabular-nums", hubFeeReceiveAmount === 0 ? "text-green-600" : "text-gray-900")}>
                        {hubFeeReceiveAmount === 0 ? t("send.free") : formatCurrency(hubFeeReceiveAmount, receiveCurrency)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("send.fee")}</span>
                      <span
                        className={cn(
                          "shrink-0 text-right font-semibold tabular-nums",
                          corridorFeeRow.isFree ? "text-green-600" : "text-gray-900",
                        )}
                      >
                        {corridorFeeRow.text}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("hub.checkout.subtotal")}</span>
                      <span className="shrink-0 text-right font-semibold tabular-nums text-gray-900">
                        {formatCurrency(subtotalReceiveAmount, receiveCurrency)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0 text-gray-600">{t("hub.checkout.exchangeRate", { defaultValue: "Exchange Rate" })}</span>
                      <span className="shrink-0 text-right text-sm">
                        {liveSpotRate != null && sendCurrency && receiveCurrency
                          ? `1 ${sendCurrency} = ${liveSpotRate.toFixed(2)} ${receiveCurrency}`
                          : sendCurrency && receiveCurrency
                            ? `1 ${sendCurrency} = — ${receiveCurrency}`
                            : "—"}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2 border-t pt-2">
                      <span className="min-w-0 text-gray-600">{t("hub.checkout.totalToPay", { defaultValue: "Total to Pay" })}</span>
                      <span className="shrink-0 text-right text-[clamp(1rem,2.8vmin,1.125rem)] font-semibold tabular-nums">
                        {pricingPreview
                          ? formatCurrency(pricingPreview.total, sendCurrency)
                          : formatCurrency(fundedReceiveAmount, sendCurrency || receiveCurrency)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {t("hub.checkout.fulfillmentSummary", { defaultValue: "Fulfillment" })}
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2 text-gray-700">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <span>
                          {t("hub.checkout.fulfilledWithin", { defaultValue: "Fulfilled within" })}: {slaLabel}
                        </span>
                      </div>
                      {step >= 2 && contactName ? (
                        <div className="flex items-start gap-2 text-gray-700">
                          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                          <span>{contactName}</span>
                        </div>
                      ) : null}
                      {step >= 2 && contactPhone ? (
                        <div className="flex items-start gap-2 text-gray-700">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                          <span>{contactPhone}</span>
                        </div>
                      ) : null}
                      {fulfillmentType === "in_person" && step >= 2 && selectedDeliveryAddress?.address_line ? (
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                          <span>{selectedDeliveryAddress.address_line}</span>
                        </div>
                      ) : null}
                      {step >= 2 && commentText.trim() ? (
                        <div className="flex items-start gap-2 text-gray-700">
                          <Package2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                          <span>{commentText.trim()}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
