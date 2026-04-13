"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { fetchWithAuth } from "@/lib/fetch-with-auth"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HubProductRow, HubFormFieldSchema } from "@/lib/hub-types"
import {
  isHubProductCacheFresh,
  readStaleHubProductCache,
  writeHubProductCache,
} from "@/lib/hub-client-cache"
import type { ExchangeRate } from "@/types"
import { computeHubFeeFromReceive } from "@/lib/hub-fee"
import { roundMoney } from "@/utils/currency"
import { paymentMethodService } from "@/lib/database"

function normalizeFormSchema(raw: unknown): HubFormFieldSchema[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x) => x && typeof (x as HubFormFieldSchema).key === "string") as HubFormFieldSchema[]
}

export default function HubCheckoutPage() {
  const { t } = useTranslation("app")
  const params = useParams()
  const productId = params.productId as string
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { currencies, exchangeRates, deliveryAddresses } = useUserData()
  const idempotencyKeyRef = useRef(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
  const cacheUserId = userProfile?.id ?? user?.id ?? ""

  const [product, setProduct] = useState<HubProductRow | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [step, setStep] = useState(1)
  const [sendCurrency, setSendCurrency] = useState("")
  const [fundedInput, setFundedInput] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [deliveryAddressLine, setDeliveryAddressLine] = useState("")
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState("")
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("")

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
    if (!cacheFresh && !hasProduct) {
      setLoadingProduct(true)
    } else {
      setLoadingProduct(false)
    }
  }, [cacheUserId, productId])

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push("/auth/login")
      return
    }
    if (!cacheUserId || !productId) return
    if (isHubProductCacheFresh(cacheUserId, productId)) {
      return
    }

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
    const first = currencies.find((c) => c.can_send !== false)
    if (first) setSendCurrency(first.code)
  }, [currencies, sendCurrency])

  useEffect(() => {
    if (userProfile?.first_name || userProfile?.last_name) {
      const n = [userProfile.first_name, userProfile.last_name].filter(Boolean).join(" ").trim()
      if (n) setContactName((prev) => prev || n)
    }
  }, [userProfile])

  const fundedReceiveAmount = useMemo(() => {
    if (!product) return 0
    if (product.pricing_type === "fixed") return roundMoney(Number(product.fixed_amount) || 0)
    return roundMoney(Number.parseFloat(fundedInput) || 0)
  }, [product, fundedInput])

  const rateRow = useMemo(() => {
    if (!sendCurrency || !receiveCurrency) return null
    return (
      (exchangeRates as ExchangeRate[]).find((r) => r.from_currency === sendCurrency && r.to_currency === receiveCurrency) ||
      null
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
        const methods = await paymentMethodService.getByCurrency(sendCurrency)
        if (cancelled) return
        setPaymentMethods(methods || [])
        const preferred = (methods || []).find((m: any) => m.is_default) || (methods || [])[0]
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

  const pricingPreview = useMemo(() => {
    if (!rateRow || !product) return null
    const rate = Number(rateRow.rate) || 0
    if (rate <= 0 || fundedReceiveAmount <= 0) return null
    const requiredSend = fundedReceiveAmount / rate
    let fee = 0
    if (rateRow.fee_type === "fixed") fee = Number(rateRow.fee_amount) || 0
    else if (rateRow.fee_type === "percentage") fee = (requiredSend * (Number(rateRow.fee_amount) || 0)) / 100
    const feePct = product.pricing_type === "user_input" ? Number(product.fee_percent) || 0 : 0
    const hubFee = computeHubFeeFromReceive(fundedReceiveAmount, rateRow, feePct)
    const sendAmt = roundMoney(requiredSend)
    const feeR = roundMoney(fee)
    const hubR = roundMoney(hubFee)
    const total = roundMoney(sendAmt + feeR + hubR)
    return { sendAmt, fee: feeR, hubFee: hubR, total, feeType: rateRow.fee_type }
  }, [rateRow, product, fundedReceiveAmount])

  const canContinueStep1 = () => {
    if (!product || !sendCurrency || !receiveCurrency || !rateRow) return false
    if (fundedReceiveAmount <= 0) return false
    if (product.pricing_type === "user_input") {
      const min = product.funded_min != null ? Number(product.funded_min) : null
      const max = product.funded_max != null ? Number(product.funded_max) : null
      if (min != null && fundedReceiveAmount < min) return false
      if (max != null && fundedReceiveAmount > max) return false
    }
    return true
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
    if (step === 2) {
      if (!contactName.trim() || !contactPhone.trim()) {
        setError(t("hub.checkout.errors.namePhoneRequired"))
        return
      }
      const fields = normalizeFormSchema(product?.form_schema)
      for (const f of fields) {
        if (f.required && !String(formAnswers[f.key] || "").trim()) {
          setError(t("hub.checkout.errors.fillField", { field: f.label || f.key }))
          return
        }
      }
      setStep(3)
    }
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
      const selected = deliveryAddresses.find((d) => d.id === selectedDeliveryAddressId)
      const line = (selected?.address_line ?? deliveryAddressLine).trim() || null
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
      if (!res.ok) {
        throw new Error(data.error || t("hub.checkout.errors.paymentSetupFailed"))
      }
      const tid = data.transaction?.transaction_id
      if (tid) {
        router.push(`/send/${String(tid).toLowerCase()}`)
      } else {
        throw new Error(t("hub.checkout.errors.missingTransaction"))
      }
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
        <AppPageHeader title={t("hub.checkout.title")} backHref={`/hub/${productId}`} />
        <div className="px-4 py-5 sm:px-6 max-w-lg mx-auto space-y-4 animate-pulse">
          <div className="h-4 w-48 rounded bg-gray-100" />
          <div className="rounded-xl border p-4 space-y-3">
            <div className="h-5 w-40 rounded bg-gray-100" />
            <div className="h-10 w-full rounded bg-gray-100" />
            <div className="h-10 w-full rounded bg-gray-100" />
            <div className="h-10 w-32 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-w-0 space-y-0">
        <AppPageHeader title={t("hub.checkout.title")} backHref="/hub" />
        <div className="px-4 py-8">
          <p className="text-red-600">{t("hub.productNotFound")}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/hub">{t("hub.hub")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formFields = normalizeFormSchema(product.form_schema)

  return (
    <div className="min-w-0 space-y-0">
      <AppPageHeader title={`${t("hub.checkout.order")} — ${product.title}`} backHref={`/hub/${productId}`} />
      <div className="px-4 py-5 sm:px-6 max-w-lg mx-auto space-y-4">
        <div className="flex gap-2 text-sm text-gray-600">
          <span className={step >= 1 ? "font-semibold text-gray-900" : ""}>1. {t("hub.checkout.steps.amount")}</span>
          <span>→</span>
          <span className={step >= 2 ? "font-semibold text-gray-900" : ""}>2. {t("hub.checkout.steps.details")}</span>
          <span>→</span>
          <span className={step >= 3 ? "font-semibold text-gray-900" : ""}>3. {t("hub.checkout.steps.pay")}</span>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("hub.checkout.amountCurrency")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.pricing_type === "user_input" ? (
                <div>
                  <Label>{t("hub.checkout.amountToCover", { currency: receiveCurrency })}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={fundedInput}
                    onChange={(e) => setFundedInput(e.target.value)}
                  />
                </div>
              ) : (
                <p className="text-lg font-semibold">
                  {product.fixed_amount} {receiveCurrency}
                </p>
              )}
              <div>
                <Label>{t("hub.checkout.payWith")}</Label>
                <Select value={sendCurrency} onValueChange={setSendCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hub.checkout.currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies
                      .filter((c) => c.can_send !== false)
                      .map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("hub.checkout.youPayReadonly")}</span>
                  <span className="font-semibold tabular-nums">
                    {pricingPreview ? `${pricingPreview.total.toFixed(2)} ${sendCurrency}` : "—"}
                  </span>
                </div>
                {pricingPreview ? (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>{t("hub.checkout.subtotal")}</span>
                      <span className="tabular-nums">
                        {pricingPreview.sendAmt.toFixed(2)} {sendCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{t("hub.checkout.transferFee")}</span>
                      <span className="tabular-nums">
                        {pricingPreview.fee.toFixed(2)} {sendCurrency}
                      </span>
                    </div>
                    {pricingPreview.hubFee > 0 ? (
                      <div className="flex justify-between text-gray-600">
                        <span>{t("hub.checkout.hubFee")}</span>
                        <span className="tabular-nums">
                          {pricingPreview.hubFee.toFixed(2)} {sendCurrency}
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-gray-500 text-xs">{t("hub.checkout.selectCurrencyAmountHint")}</p>
                )}
              </div>
              <Button type="button" onClick={handleContinue} disabled={!canContinueStep1()}>
                {t("hub.checkout.continue")}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("hub.checkout.contactDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("hub.checkout.fullName")}</Label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <Label>{t("hub.checkout.phone")}</Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
              {deliveryAddresses.length > 0 ? (
                <div>
                  <Label>{t("hub.checkout.savedAddressOptional")}</Label>
                  <Select value={selectedDeliveryAddressId || "none"} onValueChange={(v) => setSelectedDeliveryAddressId(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("hub.checkout.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("hub.checkout.none")}</SelectItem>
                      {deliveryAddresses.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.address_line}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div>
                <Label>{t("hub.checkout.deliveryNotesAddressOptional")}</Label>
                <Input value={deliveryAddressLine} onChange={(e) => setDeliveryAddressLine(e.target.value)} placeholder={t("hub.checkout.addressLine")} />
              </div>
              {formFields.map((f) => (
                <div key={f.key}>
                  <Label>
                    {f.label}
                    {f.required ? " *" : ""}
                  </Label>
                  <Input
                    placeholder={f.placeholder}
                    value={formAnswers[f.key] || ""}
                    onChange={(e) => setFormAnswers({ ...formAnswers, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  {t("hub.checkout.back")}
                </Button>
                <Button type="button" onClick={handleContinue}>
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
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">
                {t("hub.checkout.youWillPay")}{" "}
                <strong>
                  {pricingPreview?.total.toFixed(2)} {sendCurrency}
                </strong>{" "}
                {t("hub.checkout.for")} <strong>{product.title}</strong>. {t("hub.checkout.serverRecalculated")}
              </p>
              <div>
                <Label>{t("hub.checkout.paymentMethodFor", { currency: sendCurrency })}</Label>
                {paymentMethods.length > 0 ? (
                  <Select value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("hub.checkout.selectPaymentMethod")} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((pm: any) => (
                        <SelectItem key={pm.id} value={pm.id}>
                          {pm.name} ({pm.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-amber-700 mt-2">
                    {t("hub.checkout.noActivePaymentMethod", { currency: sendCurrency })}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                  {t("hub.checkout.back")}
                </Button>
                <Button
                  type="button"
                  onClick={handlePay}
                  disabled={submitting || !pricingPreview || !selectedPaymentMethodId}
                >
                  {submitting ? t("hub.checkout.creating") : t("hub.checkout.makePayment")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
