"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
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
  UserRound,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { paymentMethodService } from "@/lib/database"
import { roundMoney, formatCurrency } from "@/utils/currency"
import { cn } from "@/lib/utils"
import { accountFieldLabel } from "@/lib/account-field-i18n"
import { formatFieldValue, getAccountTypeConfigFromCurrency } from "@/lib/currency-account-types"

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

function autoInfoLabelByProductType(category: string): string {
  const key = category.trim().toLowerCase()
  if (key === "ai" || key === "language") return "Account email or username"
  if (key === "connectivity" || key === "communication") return "Phone number or account ID"
  if (key === "money") return "Recipient account or wallet identifier"
  return "Account identifier or recipient reference"
}

function resolveCheckoutFields(product: HubProductRow) {
  return [
    {
      key: "customer_info",
      label: autoInfoLabelByProductType(String(product.category || "Other")),
      placeholder: "Enter required account info",
      required: true,
      type: "text",
    },
  ]
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
  const { user, userProfile, loading: authLoading } = useAuth()
  const { currencies, exchangeRates, deliveryAddresses } = useUserData()
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
  const [deliveryAddressLine, setDeliveryAddressLine] = useState("")
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState("")
  const [deliverySearch, setDeliverySearch] = useState("")
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("")
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [sendDropdownOpen, setSendDropdownOpen] = useState(false)

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
    if (!product || product.pricing_type !== "user_input") return
    const minAmount = product.funded_min != null ? Number(product.funded_min) : null
    if (minAmount == null || Number.isNaN(minAmount) || minAmount <= 0) return
    setFundedInput((prev) => (prev.trim() ? prev : String(minAmount)))
  }, [product?.id, product?.pricing_type, product?.funded_min])

  const sendCurrencyData = useMemo(
    () => currencies.find((currency) => currency.code === sendCurrency) || null,
    [currencies, sendCurrency],
  )

  const receiveCurrencyData = useMemo(
    () => currencies.find((currency) => currency.code === receiveCurrency) || null,
    [currencies, receiveCurrency],
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

  const formFields = useMemo(() => (product ? resolveCheckoutFields(product) : []), [product])

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

  const handleContinue = () => {
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

    for (const field of formFields) {
      if (field.required && !String(formAnswers[field.key] || "").trim()) {
        setError(t("hub.checkout.errors.fillField", { field: field.label || field.key }))
        return
      }
    }

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
      const line = (selectedDeliveryAddress?.address_line ?? deliveryAddressLine).trim() || null
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
          deliveryAddressId: selectedDeliveryAddressId || null,
          formAnswers,
          paymentMethodId: selectedPaymentMethodId,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t("hub.checkout.errors.paymentSetupFailed"))

      const transactionId = data.transaction?.transaction_id
      if (!transactionId) throw new Error(t("hub.checkout.errors.missingTransaction"))
      router.push(`/send/${String(transactionId).toLowerCase()}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("hub.checkout.errors.failed"))
    } finally {
      setSubmitting(false)
    }
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
  const infoFieldLabel = t(`hub.checkout.dynamicLabels.${formFields[0]?.key || ""}`, {
    defaultValue: formFields[0]?.label || "",
  })

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
        <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">{method.name}</span>
            </div>
            <PaymentDetailRow
              label={t("hub.checkout.asset", { defaultValue: "Asset" })}
              value={method.crypto_asset}
              onCopy={() => handleCopy(String(method.crypto_asset || ""), "crypto_asset")}
              copied={!!copiedStates.crypto_asset}
            />
            <PaymentDetailRow
              label={t("hub.checkout.network", { defaultValue: "Network" })}
              value={method.crypto_network}
              onCopy={() => handleCopy(String(method.crypto_network || ""), "crypto_network")}
              copied={!!copiedStates.crypto_network}
            />
            <PaymentDetailRow
              label={t("hub.checkout.walletAddress", { defaultValue: "Wallet address" })}
              value={method.wallet_address}
              onCopy={() => handleCopy(String(method.wallet_address || ""), "wallet_address")}
              copied={!!copiedStates.wallet_address}
              mono
            />
          </div>
          <div className="flex items-center justify-center rounded-xl border bg-gray-50 p-3">
            {method.wallet_address ? (
              <QRCodeSVG value={method.wallet_address} size={144} />
            ) : (
              <QrCode className="h-16 w-16 text-gray-300" />
            )}
          </div>
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
      <AppPageHeader title={t("hub.checkout.forProduct", { product: product.title })} backHref="/hub" />
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

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">
                        {product.pricing_type === "fixed"
                          ? t("hub.checkout.productPrice", { defaultValue: "Product price" })
                          : t("hub.checkout.amountToCover", { currency: receiveCurrency })}
                      </h3>
                      <div className="rounded-xl bg-gray-50 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          {product.pricing_type === "user_input" ? (
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              value={fundedInput}
                              onChange={(e) => setFundedInput(e.target.value)}
                              className="text-app-money-input min-w-0 flex-1 border-0 bg-transparent font-bold outline-none"
                              placeholder="0.00"
                            />
                          ) : (
                            <div className="text-app-money-input min-w-0 flex-1 font-bold text-gray-900">
                              {formatCurrency(fundedReceiveAmount, receiveCurrency)}
                            </div>
                          )}
                          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm">
                            {receiveCurrencyData ? <CurrencyFlagIcon currency={receiveCurrencyData} /> : null}
                            <span>{receiveCurrency}</span>
                          </div>
                        </div>
                      </div>
                      {product.pricing_type === "user_input" && (minAmount != null || maxAmount != null) ? (
                        <div className="text-xs text-gray-500">
                          {minAmount != null
                            ? t("send.min", { amount: formatCurrency(minAmount, receiveCurrency) })
                            : null}
                          {minAmount != null && maxAmount != null ? " • " : null}
                          {maxAmount != null
                            ? t("send.max", { amount: formatCurrency(maxAmount, receiveCurrency) })
                            : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">{t("hub.checkout.payWith")}</h3>
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
                              1 {sendCurrency || "—"} = {pricingPreview?.exchangeRate?.toFixed(2) || "—"} {receiveCurrency || "—"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-sm text-gray-600">{t("send.fee")}</span>
                            </div>
                            <span className={cn("font-medium", pricingPreview?.fee === 0 ? "text-green-600" : "text-gray-900")}>
                              {pricingPreview ? (pricingPreview.fee === 0 ? t("send.free") : formatCurrency(pricingPreview.fee, sendCurrency)) : "—"}
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

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {t("hub.checkout.deliverySectionTitle", { defaultValue: "Delivery or fulfillment notes" })}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("hub.checkout.deliverySectionHint", {
                              defaultValue: "Use a saved address or add a one-off note for this order.",
                            })}
                          </p>
                        </div>
                      </div>

                      {deliveryAddresses.length > 0 ? (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              value={deliverySearch}
                              onChange={(e) => setDeliverySearch(e.target.value)}
                              placeholder={t("hub.checkout.searchSavedAddresses", { defaultValue: "Search saved addresses" })}
                              className="h-11 rounded-xl border-0 bg-gray-50 pl-9"
                            />
                          </div>

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setSelectedDeliveryAddressId("")}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                                !selectedDeliveryAddressId
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                  : "border-gray-200 bg-white hover:bg-gray-50",
                              )}
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900">
                                  {t("hub.checkout.none", { defaultValue: "None" })}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {t("hub.checkout.manualAddressHint", {
                                    defaultValue: "I will enter a custom note or address for this order.",
                                  })}
                                </p>
                              </div>
                              {!selectedDeliveryAddressId ? (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              ) : null}
                            </button>

                            {filteredDeliveryAddresses.map((address) => (
                              <button
                                key={address.id}
                                type="button"
                                onClick={() => setSelectedDeliveryAddressId(address.id)}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                                  selectedDeliveryAddressId === address.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : "border-gray-200 bg-white hover:bg-gray-50",
                                )}
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900">{address.address_line}</p>
                                  {address.phone ? <p className="text-sm text-gray-500">{address.phone}</p> : null}
                                </div>
                                {selectedDeliveryAddressId === address.id ? (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}

                      <div className="space-y-2">
                        <Label>{t("hub.checkout.deliveryNotesAddressOptional")}</Label>
                        <Input
                          value={deliveryAddressLine}
                          onChange={(e) => setDeliveryAddressLine(e.target.value)}
                          placeholder={t("hub.checkout.addressLine")}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">
                        {t("hub.checkout.productDetailsSection", { defaultValue: "Product details" })}
                      </h3>
                      {formFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label>
                            {field.key === "customer_info" ? infoFieldLabel : field.label}
                            {field.required ? " *" : ""}
                          </Label>
                          <Input
                            placeholder={field.placeholder}
                            value={formAnswers[field.key] || ""}
                            onChange={(e) => setFormAnswers({ ...formAnswers, [field.key]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 sm:gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="min-h-12 flex-1">
                        {t("hub.checkout.back")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleContinue}
                        className="min-h-12 flex-1 rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                      >
                        {t("hub.checkout.continueToPayment")}
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
                        <p className="text-xs text-gray-600">
                          {t("hub.checkout.sendAmountPlusFees", {
                            defaultValue: "Order total {{base}} + exchange fee before we begin fulfillment.",
                            base: formatCurrency(pricingPreview?.orderTotalSend || 0, sendCurrency),
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("hub.checkout.paymentMethodFor", { currency: sendCurrency })}</Label>
                      <Select value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder={t("hub.checkout.selectPaymentMethod")} />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name} ({method.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {renderPaymentMethodCard()}

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      {t("hub.checkout.serverRecalculated")}
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
                        {submitting ? t("hub.checkout.creating") : t("hub.checkout.makePayment")}
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
                      <span className={cn("shrink-0 text-right font-semibold tabular-nums", pricingPreview?.fee === 0 ? "text-green-600" : "text-gray-900")}>
                        {pricingPreview ? (pricingPreview.fee === 0 ? t("send.free") : formatCurrency(pricingPreview.fee, sendCurrency)) : "—"}
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
                        1 {sendCurrency || "—"} = {pricingPreview?.exchangeRate?.toFixed(2) || "—"} {receiveCurrency || "—"}
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
                        <span>{slaLabel}</span>
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
                      {step >= 2 && (selectedDeliveryAddress?.address_line || deliveryAddressLine.trim()) ? (
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                          <span>{selectedDeliveryAddress?.address_line || deliveryAddressLine.trim()}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {step >= 2 && formFields.some((field) => String(formAnswers[field.key] || "").trim()) ? (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Package2 className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {t("hub.checkout.requestDetailsSummary", { defaultValue: "Request details" })}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {formFields.map((field) => {
                          const value = String(formAnswers[field.key] || "").trim()
                          if (!value) return null
                          return (
                            <div key={field.key} className="flex min-w-0 items-start justify-between gap-3">
                              <span className="min-w-0 text-gray-600">
                                {field.key === "customer_info" ? infoFieldLabel : field.label}
                              </span>
                              <span className="text-right font-medium text-gray-900">{value}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
