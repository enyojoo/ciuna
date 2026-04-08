"use client"

import type React from "react"

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Check,
  Clock,
  ArrowLeft,
  Copy,
  ChevronRight,
  Plus,
  Search,
  QrCode,
  Building2,
  Coins,
  Smartphone,
  AlertCircle,
  X,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { transactionService, paymentMethodService, recipientService, deliveryAddressService } from "@/lib/database"
import { computeLogisticsFee, resolveFulfillment } from "@/lib/send-fulfillment"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { SendPageSkeleton } from "@/components/send-page-skeleton"
import {
  CurrencyFlagIcon,
  CurrencyPickerPopover,
  CurrencyPickerSheet,
  CurrencyPickerTrigger,
} from "@/components/send/currency-picker-sheet"
import type { Currency } from "@/types"
import {
  getAccountTypeConfigFromCurrency,
  formatFieldValue,
} from "@/lib/currency-account-types"
import { accountFieldLabel, accountFieldPlaceholder } from "@/lib/account-field-i18n"
import {
  formatRoutingNumber,
  formatSortCode,
  formatIBAN,
  formatAccountNumber,
} from "@/lib/formatters"
import { cn } from "@/lib/utils"

function formatReceiveArrivalDuration(
  totalSeconds: number,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const safe = Math.max(60, totalSeconds)
  const totalMinutes = Math.max(1, Math.round(safe / 60))
  if (totalMinutes < 60) {
    return t("send.arrivalDurationMinutes", { count: totalMinutes })
  }
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (m === 0) {
    return t("send.arrivalDurationHours", { count: h })
  }
  return t("send.arrivalDurationHoursMinutes", { hours: h, minutes: m })
}

export default function UserSendPage() {
  const { t } = useTranslation("app")
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const {
    currencies,
    exchangeRates,
    recipients,
    deliveryAddresses,
    refreshRecipients,
    refreshDeliveryAddresses,
    refreshCurrencies,
    loading: userDataLoading,
  } = useUserData()
  
  // Memoize exchangeRates to prevent infinite re-renders
  const memoizedExchangeRates = useMemo(() => exchangeRates, [exchangeRates])

  // Initialize state with default values
  const [currentStep, setCurrentStep] = useState(1)
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [sendCurrency, setSendCurrency] = useState<string>("")
  const [receiveCurrency, setReceiveCurrency] = useState<string>("")
  const [receiveAmount, setReceiveAmount] = useState<string>("0")
  const [fee, setFee] = useState<number>(0)

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  const [recipientData, setRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
  })
  const [transactionId, setTransactionId] = useState<string>("")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("")
  const [newRecipientData, setNewRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
    sortCode: "",
    iban: "",
    swiftBic: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    transferType: "" as "ACH" | "Wire" | "",
    checkingOrSavings: "" as "checking" | "savings" | "",
  })

  // Copy feedback states
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [feeType, setFeeType] = useState<string>("free")
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)

  // Add this state near the other state declarations
  const [isAddRecipientDialogOpen, setIsAddRecipientDialogOpen] = useState(false)
  const [isAddDeliveryDialogOpen, setIsAddDeliveryDialogOpen] = useState(false)
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState("")
  const [newDeliveryData, setNewDeliveryData] = useState({ addressLine: "", phone: "" })

  // Currency picker (bottom sheet) open state
  const [sendDropdownOpen, setSendDropdownOpen] = useState<boolean>(false)
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState<boolean>(false)

  // Add state for tracking which field was last edited
  const [lastEditedField, setLastEditedField] = useState<"send" | "receive">("send")

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const paymentMethodsData = await paymentMethodService.getAll()
        setPaymentMethods(paymentMethodsData || [])
      } catch (error) {
        console.error("Error loading payment methods:", error)
      }
    }

    loadPaymentMethods()
  }, [])

  useEffect(() => {
    if (userProfile?.id) {
      void refreshCurrencies()
    }
  }, [userProfile?.id, refreshCurrencies])

  // Default currencies before paint when possible — avoids skeleton flash on repeat visits (store cache)
  useLayoutEffect(() => {
    if (currencies.length > 0 && userProfile && !sendCurrency && !receiveCurrency) {
      const userBaseCurrency = userProfile.base_currency || "USD"
      const availableSendCurrencies = currencies.filter((c) => c.can_send !== false)

      if (availableSendCurrencies.length > 0) {
        const baseCurrencyExists = availableSendCurrencies.find((c) => c.code === userBaseCurrency)
        let newSendCurrency: string

        if (baseCurrencyExists) {
          newSendCurrency = userBaseCurrency
        } else {
          const usdCurrency = availableSendCurrencies.find((c) => c.code === "USD")
          newSendCurrency = usdCurrency ? "USD" : availableSendCurrencies[0].code
        }

        setSendCurrency(newSendCurrency)

        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== newSendCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
          const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
          setReceiveCurrency(newReceiveCurrency)
        }
      }
    } else if (currencies.length > 0 && !userProfile && !sendCurrency && !receiveCurrency) {
      const availableSendCurrencies = currencies.filter((c) => c.can_send !== false)
      if (availableSendCurrencies.length > 0) {
        const usdCurrency = availableSendCurrencies.find((c) => c.code === "USD")
        const newSendCurrency = usdCurrency ? "USD" : availableSendCurrencies[0].code
        setSendCurrency(newSendCurrency)

        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== newSendCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
          const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
          setReceiveCurrency(newReceiveCurrency)
        }
      }
    }
  }, [currencies, userProfile, sendCurrency, receiveCurrency])

  // Ensure receive currency can receive when currencies change
  useEffect(() => {
    if (currencies.length > 0 && sendCurrency && receiveCurrency) {
      const currentReceiveCurrency = currencies.find((c) => c.code === receiveCurrency)
      if (currentReceiveCurrency && currentReceiveCurrency.can_receive === false) {
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== sendCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          setReceiveCurrency(availableReceiveCurrencies[0].code)
        }
      }
    }
  }, [currencies, sendCurrency, receiveCurrency])

  // Generate transaction ID when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && !transactionId) {
      const { generateTransactionId } = require("@/lib/transaction-id")
      const newTransactionId = generateTransactionId()
      setTransactionId(newTransactionId)
    }
  }, [currentStep, transactionId])

  const filteredSavedRecipients = recipients.filter(
    (recipient) =>
      (recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.account_number.includes(searchTerm)) &&
      recipient.currency === receiveCurrency,
  )

  const filteredDeliveryAddresses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return deliveryAddresses
    return deliveryAddresses.filter(
      (a) =>
        a.address_line.toLowerCase().includes(q) ||
        a.phone.replace(/\s/g, "").toLowerCase().includes(q.replace(/\s/g, "").toLowerCase()),
    )
  }, [deliveryAddresses, searchTerm])

  const handleSelectRecipient = (recipient: any) => {
    setSelectedRecipientId(recipient.id)
    setRecipientData({
      fullName: recipient.full_name,
      accountNumber: recipient.account_number,
      bankName: recipient.bank_name,
      phoneNumber: recipient.phone_number || "",
    })
  }

  const handleAddNewRecipient = async () => {
    if (!userProfile?.id) return

    try {
      const newRecipient = await recipientService.create(userProfile.id, {
        fullName: newRecipientData.fullName,
        accountNumber: newRecipientData.accountNumber,
        bankName: newRecipientData.bankName,
        currency: receiveCurrency,
        routingNumber: newRecipientData.routingNumber || undefined,
        sortCode: newRecipientData.sortCode || undefined,
        iban: newRecipientData.iban || undefined,
        swiftBic: newRecipientData.swiftBic || undefined,
        addressLine1: newRecipientData.addressLine1 || undefined,
        addressLine2: newRecipientData.addressLine2 || undefined,
        city: newRecipientData.city || undefined,
        state: newRecipientData.state || undefined,
        postalCode: newRecipientData.postalCode || undefined,
        transferType: newRecipientData.transferType || undefined,
        checkingOrSavings: newRecipientData.checkingOrSavings || undefined,
      })

      // Refresh recipients data
      await refreshRecipients()

      // Select the new recipient
      handleSelectRecipient(newRecipient)

      // Clear form and close dialog
      setNewRecipientData({
        fullName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        sortCode: "",
        iban: "",
        swiftBic: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        transferType: "",
        checkingOrSavings: "",
      })

      // Close the dialog
      setIsAddRecipientDialogOpen(false)
    } catch (error) {
      console.error("Error adding recipient:", error)
      setError(t("send.failedAddRecipient"))
    }
  }

  const handleAddNewDelivery = async () => {
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
      console.error("Error adding delivery address:", e)
      setError(t("send.failedAddDelivery"))
    }
  }

  // Copy to clipboard with feedback
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // File upload handlers
  const handleFileSelect = async (file: File) => {
    // Clear previous errors
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

    // Simulate progress for better UX (don't actually upload until transaction exists)
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
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

  // Exchange rate and fee calculation functions
  const getExchangeRate = (from: string, to: string) => {
    return memoizedExchangeRates.find((r) => r.from_currency === from && r.to_currency === to)
  }

  const calculateFee = (amount: number, from: string, to: string) => {
    const rateData = getExchangeRate(from, to)
    if (!rateData || rateData.fee_type === "free") {
      return { fee: 0, feeType: "free" }
    }

    if (rateData.fee_type === "fixed") {
      return { fee: rateData.fee_amount, feeType: "fixed" }
    }

    if (rateData.fee_type === "percentage") {
      return { fee: (amount * rateData.fee_amount) / 100, feeType: "percentage" }
    }

    return { fee: 0, feeType: "free" }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const curr = currencies.find((c) => c.code === currency)
    return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Handle currency selection with same currency prevention
  const handleSendCurrencyChange = (newCurrency: string) => {
    setSendCurrency(newCurrency)
    // If user selects same currency as receive, find a different currency that can receive
    if (newCurrency === receiveCurrency) {
      const availableReceiveCurrencies = currencies.filter(
        (c) => c.can_receive !== false && c.code !== newCurrency
      )
      if (availableReceiveCurrencies.length > 0) {
        setReceiveCurrency(availableReceiveCurrencies[0].code)
      }
    } else {
      // Ensure receive currency can still receive
      const currentReceiveCurrency = currencies.find((c) => c.code === receiveCurrency)
      if (currentReceiveCurrency && currentReceiveCurrency.can_receive === false) {
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== newCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          setReceiveCurrency(availableReceiveCurrencies[0].code)
        }
      }
    }
  }

  const handleReceiveCurrencyChange = (newCurrency: string) => {
    setReceiveCurrency(newCurrency)
    // If user selects same currency as send, find a different currency that can send
    if (newCurrency === sendCurrency) {
      const availableSendCurrencies = currencies.filter(
        (c) => c.can_send !== false && c.code !== newCurrency
      )
      if (availableSendCurrencies.length > 0) {
        setSendCurrency(availableSendCurrencies[0].code)
      }
    }
  }

  // Get payment methods for the sending currency
  const getPaymentMethodsForCurrency = (currency: string) => {
    return paymentMethods.filter((pm) => pm.currency === currency && pm.status === "active")
  }

  const getDefaultPaymentMethod = (currency: string) => {
    const methods = getPaymentMethodsForCurrency(currency)
    return methods.find((pm) => pm.is_default) || methods[0]
  }

  // Update the useEffect to calculate fee and conversion
  useEffect(() => {
    if (!sendCurrency || !receiveCurrency) return

    const rate = getExchangeRate(sendCurrency, receiveCurrency)

    if (lastEditedField === "send") {
      // Calculate receive amount from send amount
      const amount = Number.parseFloat(sendAmount) || 0
      const feeData = calculateFee(amount, sendCurrency, receiveCurrency)

      if (rate) {
        const converted = amount * rate.rate
        setReceiveAmount(converted.toFixed(2))
      } else {
        setReceiveAmount("0")
      }

      setFee(feeData.fee)
      setFeeType(feeData.feeType)
    } else {
      // Calculate send amount from receive amount (reverse calculation)
      const targetReceiveAmount = Number.parseFloat(receiveAmount) || 0

      if (rate && rate.rate > 0) {
        // To get the target receive amount, we need to work backwards
        // receiveAmount = sendAmount * rate
        // So: sendAmount = receiveAmount / rate
        const requiredSendAmount = targetReceiveAmount / rate.rate
        setSendAmount(requiredSendAmount.toFixed(2))

        // Calculate fee based on the required send amount
        const feeData = calculateFee(requiredSendAmount, sendCurrency, receiveCurrency)
        setFee(feeData.fee)
        setFeeType(feeData.feeType)
      } else {
        setSendAmount("0")
        setFee(0)
      }
    }
  }, [sendAmount, receiveAmount, sendCurrency, receiveCurrency, memoizedExchangeRates, lastEditedField])

  // Add new useEffect to handle min/max amounts when currency changes
  useEffect(() => {
    if (!sendCurrency || !receiveCurrency) return

    const rate = getExchangeRate(sendCurrency, receiveCurrency)
    if (rate && rate.min_amount) {
      const currentAmount = Number.parseFloat(sendAmount) || 0
      if (currentAmount < rate.min_amount) {
        setSendAmount(rate.min_amount.toString())
      }
    }
  }, [sendCurrency, receiveCurrency, exchangeRates])

  const exchangeRateData = useMemo(
    () => memoizedExchangeRates.find((r) => r.from_currency === sendCurrency && r.to_currency === receiveCurrency),
    [memoizedExchangeRates, sendCurrency, receiveCurrency],
  )

  const fulfillmentResolution = useMemo(
    () => resolveFulfillment(Number.parseFloat(receiveAmount) || 0, exchangeRateData ?? null),
    [receiveAmount, exchangeRateData],
  )

  const logisticsFee = useMemo(() => {
    if (!fulfillmentResolution.ok) return 0
    return computeLogisticsFee(
      Number.parseFloat(receiveAmount) || 0,
      fulfillmentResolution.fulfillment,
      exchangeRateData ?? null,
    )
  }, [receiveAmount, fulfillmentResolution, exchangeRateData])

  const totalToPay = useMemo(
    () => (Number.parseFloat(sendAmount) || 0) + fee + logisticsFee,
    [sendAmount, fee, logisticsFee],
  )

  useEffect(() => {
    if (!fulfillmentResolution.ok) {
      setSelectedDeliveryAddressId("")
      return
    }
    if (fulfillmentResolution.fulfillment !== "cash_hand") {
      setSelectedDeliveryAddressId("")
    }
  }, [fulfillmentResolution])

  useEffect(() => {
    if (!fulfillmentResolution.ok) return
    if (fulfillmentResolution.fulfillment !== "cash_hand") return
    setSelectedRecipientId("")
    setRecipientData({
      fullName: "",
      accountNumber: "",
      bankName: "",
      phoneNumber: "",
    })
  }, [fulfillmentResolution])

  const handleResendVerificationEmail = async () => {
    if (!user?.email) return
    
    setIsResendingVerification(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })
      
      if (response.ok) {
        alert(t("send.resendVerificationSuccess"))
      } else {
        alert(t("send.resendVerificationFailed"))
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
      alert(t("send.resendVerificationFailed"))
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleContinue = async () => {
    if (currentStep < 3) {
      // Check email verification before moving to step 2
      if (currentStep === 1 && !user?.email_confirmed_at) {
        setShowEmailVerificationModal(true)
        return
      }
      if (currentStep === 1 && !fulfillmentResolution.ok) {
        return
      }
      if (currentStep === 2 && fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand") {
        if (!selectedDeliveryAddressId) return
      }
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 3) {
      // Create transaction in database
      if (!userProfile?.id) return

      try {
        setIsCreatingTransaction(true)

        const exchangeRateData = getExchangeRate(sendCurrency, receiveCurrency)
        if (!exchangeRateData) {
          throw new Error("Exchange rate not available")
        }

        const fulfillment =
          fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand" ? "cash_hand" : "bank_transfer"
        if (fulfillment === "bank_transfer" && !selectedRecipientId) return
        if (fulfillment === "cash_hand" && !selectedDeliveryAddressId) return

        const selectedDelivery =
          fulfillment === "cash_hand"
            ? deliveryAddresses.find((d) => d.id === selectedDeliveryAddressId)
            : null

        const transaction = await transactionService.create({
          userId: userProfile.id,
          recipientId: fulfillment === "cash_hand" ? null : selectedRecipientId,
          sendAmount: Number.parseFloat(sendAmount),
          sendCurrency,
          receiveAmount: Number.parseFloat(receiveAmount),
          receiveCurrency,
          exchangeRate: exchangeRateData.rate,
          feeAmount: fee,
          feeType: feeType,
          totalAmount: totalToPay,
          fulfillmentType: fulfillment,
          logisticsFeeAmount: fulfillment === "cash_hand" ? logisticsFee : 0,
          logisticsFeeTypeSnapshot:
            fulfillment === "cash_hand" ? (exchangeRateData?.logistics_fee_type ?? null) : null,
          deliveryAddressLine: selectedDelivery?.address_line ?? null,
          deliveryPhone: selectedDelivery?.phone ?? null,
          deliveryAddressId: fulfillment === "cash_hand" ? selectedDeliveryAddressId || null : null,
        })

        // Redirect to transaction status page immediately (don't wait for receipt upload)
        router.push(`/send/${transaction.transaction_id.toLowerCase()}`)

        // Upload receipt in the background after redirect (non-blocking)
        if (uploadedFile && uploadProgress === 100 && !isUploading) {
          // Use setTimeout to ensure redirect happens first
          setTimeout(async () => {
          try {
            await transactionService.uploadReceipt(transaction.transaction_id, uploadedFile)
              console.log("Receipt uploaded successfully")
          } catch (uploadError) {
            console.error("Error uploading receipt:", uploadError)
              // Don't show error to user - upload happens in background
          }
          }, 100)
        }
      } catch (error) {
        console.error("Error creating transaction:", error)
        setError(t("send.failedCreateTxn"))
      } finally {
        setIsCreatingTransaction(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const exchangeRate = exchangeRateData?.rate || 0
  const sendCurrencyData = currencies.find((c) => c.code === sendCurrency)
  const receiveCurrencyData = currencies.find((c) => c.code === receiveCurrency)


  const TransactionSummary = () => (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">{t("send.transactionSummary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 text-gray-600">{t("send.youSendLabel")}</span>
            <span className="shrink-0 text-right font-semibold tabular-nums">
              {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)}
            </span>
          </div>
          <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 text-gray-600">{t("send.fee")}</span>
            <span className={`shrink-0 text-right font-semibold tabular-nums ${fee === 0 ? "text-green-600" : "text-gray-900"}`}>
              {fee === 0 ? t("send.free") : formatCurrency(fee, sendCurrency)}
            </span>
          </div>
          <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 text-gray-600">{t("send.recipientGetsLabel")}</span>
            <span className="shrink-0 text-right font-semibold tabular-nums">
              {formatCurrency(Number.parseFloat(receiveAmount) || 0, receiveCurrency)}
            </span>
          </div>
          <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 text-gray-600">{t("send.exchangeRateLabel")}</span>
            <span className="shrink-0 text-right text-sm">
              1 {sendCurrency} = {exchangeRateData?.rate != null ? exchangeRateData.rate.toFixed(2) : "—"}{" "}
              {receiveCurrency}
            </span>
          </div>
          {fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand" ? (
            <div className="flex min-w-0 items-start justify-between gap-2">
              <span className="min-w-0 text-gray-600">{t("send.logisticsFeeLabel")}</span>
              <span
                className={`shrink-0 text-right font-semibold tabular-nums ${
                  logisticsFee === 0 ? "text-green-600" : "text-gray-900"
                }`}
              >
                {logisticsFee === 0 ? t("send.free") : formatCurrency(logisticsFee, sendCurrency)}
              </span>
            </div>
          ) : null}
          <div className="flex min-w-0 items-start justify-between gap-2 border-t pt-2">
            <span className="min-w-0 text-gray-600">{t("send.totalToPay")}</span>
            <span className="shrink-0 text-right text-[clamp(1rem,2.8vmin,1.125rem)] font-semibold tabular-nums">
              {formatCurrency(totalToPay, sendCurrency)}
            </span>
          </div>
        </div>

        {currentStep >= 2 &&
          fulfillmentResolution.ok &&
          fulfillmentResolution.fulfillment === "cash_hand" &&
          selectedDeliveryAddressId && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">{t("send.cashDeliverySummary")}</h4>
              {(() => {
                const da = deliveryAddresses.find((d: { id: string }) => d.id === selectedDeliveryAddressId)
                if (!da) return null
                return (
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">{da.address_line}</p>
                    <p className="text-gray-600">{da.phone}</p>
                  </div>
                )
              })()}
            </div>
          )}
        {currentStep >= 2 &&
          (!fulfillmentResolution.ok || fulfillmentResolution.fulfillment !== "cash_hand") &&
          recipientData.fullName && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">{t("send.recipientLabel")}</h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{recipientData.fullName}</p>
                <p className="text-gray-600">{recipientData.accountNumber}</p>
                <p className="text-gray-600">{recipientData.bankName}</p>
              </div>
            </div>
          )}
        {currentStep >= 3 && transactionId && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">{t("send.transactionId")}</p>
            <p className="font-mono text-sm">{transactionId}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (userDataLoading && currencies.length === 0) {
    return <SendPageSkeleton />
  }

  if (error) {
    return (
      <div className="min-w-0 px-4 py-5 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
              <Button onClick={() => router.refresh()} className="mt-2">
                {t("send.retry")}
              </Button>
            </div>
          </div>
        </div>
    )
  }

  if (currencies.length === 0) {
    return (
      <div className="min-w-0 px-4 py-5 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-700">{t("send.noCurrencies")}</p>
            </div>
          </div>
        </div>
    )
  }

  return (
    <>
    <div className="min-w-0 px-4 py-5 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <div className="min-w-0 lg:col-span-2">
              {/* Step 1: Send Money */}
              {currentStep === 1 && (
                <Card className="py-4">
                  <CardContent className="space-y-6 pt-0">
                    {/* You Send Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">{t("send.youSend")}</h3>
                      <div className="bg-gray-50 rounded-xl px-4 py-4">
                        <div className="flex justify-between items-center gap-2">
                          <input
                            type="number"
                            value={sendAmount}
                            onChange={(e) => {
                              setSendAmount(e.target.value)
                              setLastEditedField("send")
                            }}
                            onBlur={(e) => {
                              const value = Number.parseFloat(e.target.value) || 0
                              const rate = getExchangeRate(sendCurrency, receiveCurrency)
                              const minAmount = rate?.min_amount || 0
                              const maxAmount = rate?.max_amount

                              if (value < minAmount && minAmount > 0) {
                                setSendAmount(minAmount.toString())
                              } else if (maxAmount && value > maxAmount) {
                                setSendAmount(maxAmount.toString())
                              }
                            }}
                            className="text-app-money-input min-w-0 flex-1 border-0 bg-transparent font-bold outline-none"
                            placeholder="0.00"
                          />
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
                              onSelect={handleSendCurrencyChange}
                              currencies={currencies}
                              type="send"
                            />
                          </div>
                          <div className="hidden md:block shrink-0">
                            <CurrencyPickerPopover
                              selectedCurrency={sendCurrency}
                              onSelect={handleSendCurrencyChange}
                              currencies={currencies}
                              type="send"
                            />
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const rate = getExchangeRate(sendCurrency, receiveCurrency)
                        if (rate && (rate.min_amount || rate.max_amount)) {
                          return (
                            <div className="text-xs text-gray-500 mt-2">
                              {rate.min_amount && t("send.min", { amount: formatCurrency(rate.min_amount, sendCurrency) })}
                              {rate.min_amount && rate.max_amount && " • "}
                              {rate.max_amount && t("send.max", { amount: formatCurrency(rate.max_amount, sendCurrency) })}
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>

                    {/* Receiver Gets Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">{t("send.receiverGets")}</h3>
                      <div className="bg-gray-50 space-y-3 rounded-xl px-4 py-4">
                        <div className="flex justify-between items-center gap-2">
                          <input
                            type="number"
                            value={receiveAmount}
                            onChange={(e) => {
                              setReceiveAmount(e.target.value)
                              setLastEditedField("receive")
                            }}
                            onBlur={(e) => {
                              const targetReceiveAmount = Number.parseFloat(e.target.value) || 0
                              const rate = getExchangeRate(sendCurrency, receiveCurrency)

                              if (rate && targetReceiveAmount > 0) {
                                let requiredSendAmount = targetReceiveAmount / rate.rate

                                // Apply min/max constraints and adjust both fields if needed
                                if (rate.min_amount && requiredSendAmount < rate.min_amount) {
                                  requiredSendAmount = rate.min_amount
                                  const adjustedReceiveAmount = requiredSendAmount * rate.rate
                                  setReceiveAmount(adjustedReceiveAmount.toFixed(2))
                                  setSendAmount(requiredSendAmount.toFixed(2))
                                } else if (rate.max_amount && requiredSendAmount > rate.max_amount) {
                                  requiredSendAmount = rate.max_amount
                                  const adjustedReceiveAmount = requiredSendAmount * rate.rate
                                  setReceiveAmount(adjustedReceiveAmount.toFixed(2))
                                  setSendAmount(requiredSendAmount.toFixed(2))
                                }
                              }
                            }}
                            className="text-app-money-input min-w-0 flex-1 border-0 bg-transparent font-bold outline-none"
                            placeholder="0.00"
                          />
                          <div className="md:hidden shrink-0">
                            <CurrencyPickerTrigger
                              selectedCurrency={receiveCurrency}
                              onOpen={() => setReceiveDropdownOpen(true)}
                              currencies={currencies}
                            />
                            <CurrencyPickerSheet
                              open={receiveDropdownOpen}
                              onOpenChange={setReceiveDropdownOpen}
                              selectedCurrency={receiveCurrency}
                              onSelect={handleReceiveCurrencyChange}
                              currencies={currencies}
                              type="receive"
                            />
                          </div>
                          <div className="hidden md:block shrink-0">
                            <CurrencyPickerPopover
                              selectedCurrency={receiveCurrency}
                              onSelect={handleReceiveCurrencyChange}
                              currencies={currencies}
                              type="receive"
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-200/80 pt-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              <span className="text-sm text-gray-600">{t("send.fee")}</span>
                            </div>
                            <span className={`font-medium ${fee === 0 ? "text-green-600" : "text-gray-900"}`}>
                              {fee === 0 ? t("send.free") : formatCurrency(fee, sendCurrency)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-primary text-xs">%</span>
                              </div>
                              <span className="text-sm text-gray-600">{t("send.rate")}</span>
                            </div>
                            <span className="font-medium text-primary">
                              1 {sendCurrency} = {exchangeRate?.toFixed(2) || "0.00"} {receiveCurrency}
                            </span>
                          </div>

                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 shrink-0 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock className="h-3 w-3 text-orange-600" />
                              </div>
                              <span className="text-sm text-gray-600">{t("send.arrivesIn")}</span>
                            </div>
                            <span className="shrink-0 font-medium text-sm text-gray-900 text-right tabular-nums">
                              {formatReceiveArrivalDuration(
                                receiveCurrencyData?.receive_completion_timer_seconds ?? 3600,
                                t,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!fulfillmentResolution.ok && sendCurrency && receiveCurrency && (
                      <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                        <p>
                          {fulfillmentResolution.reason === "outside_bank_only"
                            ? t("send.fulfillmentErrorOutsideBank")
                            : fulfillmentResolution.reason === "overlap"
                              ? t("send.fulfillmentErrorOverlap")
                              : t("send.fulfillmentErrorGap")}
                        </p>
                      </div>
                    )}

                    <div className="sticky bottom-0 z-10 -mx-6 mt-2 border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 lg:static lg:z-auto lg:mx-0 lg:mt-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                      <Button
                        onClick={handleContinue}
                        className="min-h-12 w-full rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                        disabled={
                          !sendCurrency || !receiveCurrency || !sendAmount || !fulfillmentResolution.ok
                        }
                      >
                        {t("send.continue")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Add Recipient */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand"
                        ? t("send.cashStep2Title")
                        : t("send.addRecipient")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand" && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                        {t("send.cashHandBanner")}
                      </div>
                    )}

                    {fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand" && (
                      <div className="space-y-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-700">{t("send.logisticsFeeLabel")}</span>
                          <span className="font-semibold tabular-nums text-gray-900">
                            {logisticsFee === 0 ? t("send.free") : formatCurrency(logisticsFee, sendCurrency)}
                          </span>
                        </div>
                        {exchangeRateData?.logistics_fee_type === "percentage" ? (
                          <p className="text-xs text-gray-500">
                            {t("send.logisticsFeeHintPercent", {
                              pct: exchangeRateData.logistics_fee_amount ?? 0,
                            })}
                          </p>
                        ) : null}
                      </div>
                    )}

                    {fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand" && (
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            placeholder={t("send.searchDeliveryAddresses")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 rounded-xl border-0 bg-gray-50 pl-10"
                          />
                        </div>
                        <Dialog open={isAddDeliveryDialogOpen} onOpenChange={setIsAddDeliveryDialogOpen}>
                          <DialogTrigger asChild>
                            <div className={cn("selectable-row", "selectable-row--idle")}>
                              <div className="flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                                  <Plus className="h-6 w-6 text-white" />
                                </div>
                                <span className="font-medium text-gray-900">{t("send.addDeliveryAddress")}</span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="mx-auto max-h-[90vh] w-[95vw] max-w-md flex flex-col">
                            <DialogHeader>
                              <DialogTitle>{t("send.addDeliveryAddressTitle")}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pr-2">
                              <div className="space-y-2">
                                <Label htmlFor="deliveryLine">{t("send.deliveryAddressLine")}</Label>
                                <Input
                                  id="deliveryLine"
                                  value={newDeliveryData.addressLine}
                                  onChange={(e) =>
                                    setNewDeliveryData({ ...newDeliveryData, addressLine: e.target.value })
                                  }
                                  placeholder={t("send.deliveryAddressLinePlaceholder")}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="deliveryPhone">{t("send.deliveryPhone")}</Label>
                                <Input
                                  id="deliveryPhone"
                                  value={newDeliveryData.phone}
                                  onChange={(e) => setNewDeliveryData({ ...newDeliveryData, phone: e.target.value })}
                                  placeholder={t("send.deliveryPhonePlaceholder")}
                                />
                              </div>
                              <Button
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={handleAddNewDelivery}
                                disabled={!newDeliveryData.addressLine.trim() || !newDeliveryData.phone.trim()}
                              >
                                {t("send.saveDeliveryAddress")}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <div className="space-y-2">
                          {filteredDeliveryAddresses.map((addr: { id: string; address_line: string; phone: string }) => (
                            <div
                              key={addr.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedDeliveryAddressId(addr.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  setSelectedDeliveryAddressId(addr.id)
                                }
                              }}
                              className={cn(
                                "selectable-row",
                                selectedDeliveryAddressId === addr.id
                                  ? "selectable-row--selected"
                                  : "selectable-row--idle",
                              )}
                            >
                              <div className="min-w-0 text-left">
                                <p className="font-medium text-gray-900">{addr.address_line}</p>
                                <p className="text-sm text-gray-600">{addr.phone}</p>
                              </div>
                              {selectedDeliveryAddressId === addr.id && (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {filteredDeliveryAddresses.length === 0 && searchTerm.trim() && (
                          <div className="py-8 text-center text-gray-500">
                            <p>{t("send.noDeliverySearch", { term: searchTerm })}</p>
                          </div>
                        )}

                        {deliveryAddresses.length === 0 && !searchTerm.trim() && (
                          <div className="py-8 text-center text-gray-500">
                            <p>{t("send.noDeliveryAddressesYet")}</p>
                            <p className="text-sm">{t("send.addDeliveryHint")}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!(fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand") && (
                      <>
                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            placeholder={t("send.searchRecipients")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 rounded-xl border-0 bg-gray-50 pl-10"
                          />
                        </div>

                        {/* Add New Recipient Option */}
                        <Dialog open={isAddRecipientDialogOpen} onOpenChange={setIsAddRecipientDialogOpen}>
                      <DialogTrigger asChild>
                        <div className={cn("selectable-row", "selectable-row--idle")}>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Plus className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{t("send.addNewRecipient")}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </DialogTrigger>

                      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>{t("send.addNewRecipientTitle")}</DialogTitle>
                        </DialogHeader>
                        <div className="min-h-0 overflow-y-auto flex-1 pr-2 -mr-2 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newRecipientCurrency">{t("send.currency")}</Label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                              {receiveCurrencyData && <CurrencyFlagIcon currency={receiveCurrencyData} />}
                              <div>
                                <div className="font-medium">{receiveCurrency}</div>
                              </div>
                              <span className="ml-auto text-xs text-gray-500">{t("send.autoSelected")}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newRecipientName">{t("send.accountName")}</Label>
                            <Input
                              id="newRecipientName"
                              value={newRecipientData.fullName}
                              onChange={(e) => setNewRecipientData({ ...newRecipientData, fullName: e.target.value })}
                              placeholder={t("send.enterAccountName")}
                              required
                            />
                          </div>
                          {(() => {
                            const accountConfig = receiveCurrency
                              ? getAccountTypeConfigFromCurrency(receiveCurrency)
                              : null

                            if (!accountConfig) {
                              return (
                                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                                  {t("send.selectCurrencyFirst")}
                                </div>
                              )
                            }

                            return (
                              <>
                                {/* Bank Name - Always required */}
                          <div className="space-y-2">
                                  <Label htmlFor="newRecipientBank">
                                    {accountFieldLabel(t, "bank_name", accountConfig.fieldLabels.bank_name)} *
                                  </Label>
                                  <Input
                                    id="newRecipientBank"
                                    value={newRecipientData.bankName}
                                    onChange={(e) =>
                                      setNewRecipientData({ ...newRecipientData, bankName: e.target.value })
                                    }
                                    placeholder={accountFieldPlaceholder(t, "bank_name", accountConfig.fieldPlaceholders.bank_name)}
                                    required
                                  />
                                </div>

                                {/* US Account Fields */}
                                {accountConfig.accountType === "us" && (
                                  <>
                                    {/* Transfer Type Selection */}
                                    <div className="space-y-2">
                                      <Label>{t("send.transferType")}</Label>
                                      <div className="grid grid-cols-2 gap-3">
                                        <button
                                          type="button"
                                          onClick={() => setNewRecipientData({ ...newRecipientData, transferType: "ACH" })}
                                          className={cn(
                                            "selectable-toggle",
                                            newRecipientData.transferType === "ACH"
                                              ? "selectable-toggle--selected"
                                              : "selectable-toggle--idle",
                                          )}
                                        >
                                          ACH
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setNewRecipientData({ ...newRecipientData, transferType: "Wire" })}
                                          className={cn(
                                            "selectable-toggle",
                                            newRecipientData.transferType === "Wire"
                                              ? "selectable-toggle--selected"
                                              : "selectable-toggle--idle",
                                          )}
                                        >
                                          Wire
                                        </button>
                                      </div>
                                    </div>
                                    {/* Account Type Selection (Checking/Savings) */}
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientAccountType">
                                        {accountFieldLabel(t, "checking_or_savings", accountConfig.fieldLabels.checking_or_savings)} *
                                      </Label>
                                      <div className="grid grid-cols-2 gap-3">
                                        <button
                                          type="button"
                                          onClick={() => setNewRecipientData({ ...newRecipientData, checkingOrSavings: "checking" })}
                                          className={cn(
                                            "selectable-toggle",
                                            newRecipientData.checkingOrSavings === "checking"
                                              ? "selectable-toggle--selected"
                                              : "selectable-toggle--idle",
                                          )}
                                        >
                                          {t("recipients.checking")}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setNewRecipientData({ ...newRecipientData, checkingOrSavings: "savings" })}
                                          className={cn(
                                            "selectable-toggle",
                                            newRecipientData.checkingOrSavings === "savings"
                                              ? "selectable-toggle--selected"
                                              : "selectable-toggle--idle",
                                          )}
                                        >
                                          {t("recipients.savings")}
                                        </button>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientRoutingNumber">
                                        {accountFieldLabel(t, "routing_number", accountConfig.fieldLabels.routing_number)} *
                                      </Label>
                                      <Input
                                        id="newRecipientRoutingNumber"
                                        value={newRecipientData.routingNumber}
                                        onChange={(e) => {
                                          const formatted = formatRoutingNumber(e.target.value)
                                          setNewRecipientData({ ...newRecipientData, routingNumber: formatted })
                                        }}
                                        placeholder={accountFieldPlaceholder(t, "routing_number", accountConfig.fieldPlaceholders.routing_number)}
                                        maxLength={9}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientAccount">
                                        {accountFieldLabel(t, "account_number", accountConfig.fieldLabels.account_number)} *
                                      </Label>
                            <Input
                              id="newRecipientAccount"
                              value={newRecipientData.accountNumber}
                              onChange={(e) => {
                                const formatted = formatAccountNumber(e.target.value)
                                setNewRecipientData({ ...newRecipientData, accountNumber: formatted })
                              }}
                                        placeholder={accountFieldPlaceholder(t, "account_number", accountConfig.fieldPlaceholders.account_number)}
                              required
                            />
                          </div>
                                    {/* Address Fields */}
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientAddressLine1">
                                        {accountFieldLabel(t, "address_line1", accountConfig.fieldLabels.address_line1)} *
                                      </Label>
                                      <Input
                                        id="newRecipientAddressLine1"
                                        value={newRecipientData.addressLine1}
                                        onChange={(e) => setNewRecipientData({ ...newRecipientData, addressLine1: e.target.value })}
                                        placeholder={accountFieldPlaceholder(t, "address_line1", accountConfig.fieldPlaceholders.address_line1)}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientAddressLine2">
                                        {accountFieldLabel(t, "address_line2", accountConfig.fieldLabels.address_line2)}
                                      </Label>
                                      <Input
                                        id="newRecipientAddressLine2"
                                        value={newRecipientData.addressLine2}
                                        onChange={(e) => setNewRecipientData({ ...newRecipientData, addressLine2: e.target.value })}
                                        placeholder={accountFieldPlaceholder(t, "address_line2", accountConfig.fieldPlaceholders.address_line2)}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="newRecipientCity">
                                          {accountFieldLabel(t, "city", accountConfig.fieldLabels.city)} *
                                        </Label>
                                        <Input
                                          id="newRecipientCity"
                                          value={newRecipientData.city}
                                          onChange={(e) => setNewRecipientData({ ...newRecipientData, city: e.target.value })}
                                          placeholder={accountFieldPlaceholder(t, "city", accountConfig.fieldPlaceholders.city)}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="newRecipientState">
                                          {accountFieldLabel(t, "state", accountConfig.fieldLabels.state)} *
                                        </Label>
                                        <Input
                                          id="newRecipientState"
                                          value={newRecipientData.state}
                                          onChange={(e) => setNewRecipientData({ ...newRecipientData, state: e.target.value.toUpperCase() })}
                                          placeholder={accountFieldPlaceholder(t, "state", accountConfig.fieldPlaceholders.state)}
                                          maxLength={2}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientPostalCode">
                                        {accountFieldLabel(t, "postal_code", accountConfig.fieldLabels.postal_code)} *
                                      </Label>
                                      <Input
                                        id="newRecipientPostalCode"
                                        value={newRecipientData.postalCode}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                                          setNewRecipientData({ ...newRecipientData, postalCode: value })
                                        }}
                                        placeholder={accountFieldPlaceholder(t, "postal_code", accountConfig.fieldPlaceholders.postal_code)}
                                        maxLength={10}
                                        required
                                      />
                                    </div>
                                  </>
                                )}

                                {/* UK Account Fields */}
                                {accountConfig.accountType === "uk" && (
                                  <>
                                    <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                                        <Label htmlFor="newRecipientSortCode">
                                          {accountFieldLabel(t, "sort_code", accountConfig.fieldLabels.sort_code)} *
                                        </Label>
                            <Input
                                          id="newRecipientSortCode"
                                          value={newRecipientData.sortCode}
                                          onChange={(e) => {
                                            const formatted = formatSortCode(e.target.value)
                                            setNewRecipientData({ ...newRecipientData, sortCode: formatted })
                                          }}
                                          placeholder={accountFieldPlaceholder(t, "sort_code", accountConfig.fieldPlaceholders.sort_code)}
                                          maxLength={8}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                                        <Label htmlFor="newRecipientAccount">
                                          {accountFieldLabel(t, "account_number", accountConfig.fieldLabels.account_number)} *
                                        </Label>
                                        <Input
                                          id="newRecipientAccount"
                                          value={newRecipientData.accountNumber}
                                          onChange={(e) => {
                                            const formatted = formatAccountNumber(e.target.value)
                                            setNewRecipientData({ ...newRecipientData, accountNumber: formatted })
                                          }}
                                          placeholder={accountFieldPlaceholder(t, "account_number", accountConfig.fieldPlaceholders.account_number)}
                                          required
                                        />
                              </div>
                            </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientIban">
                                        {accountFieldLabel(t, "iban", accountConfig.fieldLabels.iban)}
                                      </Label>
                                      <Input
                                        id="newRecipientIban"
                                        value={newRecipientData.iban}
                                        onChange={(e) => {
                                          const formatted = formatIBAN(e.target.value)
                                          setNewRecipientData({ ...newRecipientData, iban: formatted })
                                        }}
                                        placeholder={accountFieldPlaceholder(t, "iban", accountConfig.fieldPlaceholders.iban)}
                                      />
                          </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientSwiftBic">
                                        {accountFieldLabel(t, "swift_bic", accountConfig.fieldLabels.swift_bic)}{t("send.optionalSuffix")}
                                      </Label>
                                      <Input
                                        id="newRecipientSwiftBic"
                                        value={newRecipientData.swiftBic}
                                        onChange={(e) =>
                                          setNewRecipientData({
                                            ...newRecipientData,
                                            swiftBic: e.target.value.toUpperCase(),
                                          })
                                        }
                                        placeholder={accountFieldPlaceholder(t, "swift_bic", accountConfig.fieldPlaceholders.swift_bic)}
                                      />
                                    </div>
                                  </>
                                )}

                                {/* EURO Account Fields */}
                                {accountConfig.accountType === "euro" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientIban">
                                        {accountFieldLabel(t, "iban", accountConfig.fieldLabels.iban)} *
                                      </Label>
                                      <Input
                                        id="newRecipientIban"
                                        value={newRecipientData.iban}
                                        onChange={(e) =>
                                          setNewRecipientData({ ...newRecipientData, iban: e.target.value.toUpperCase() })
                                        }
                                        placeholder={accountFieldPlaceholder(t, "iban", accountConfig.fieldPlaceholders.iban)}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientSwiftBic">
                                        {accountFieldLabel(t, "swift_bic", accountConfig.fieldLabels.swift_bic)}{t("send.optionalSuffix")}
                                      </Label>
                                      <Input
                                        id="newRecipientSwiftBic"
                                        value={newRecipientData.swiftBic}
                                        onChange={(e) =>
                                          setNewRecipientData({
                                            ...newRecipientData,
                                            swiftBic: e.target.value.toUpperCase(),
                                          })
                                        }
                                        placeholder={accountFieldPlaceholder(t, "swift_bic", accountConfig.fieldPlaceholders.swift_bic)}
                                      />
                                    </div>
                                  </>
                                )}

                                {/* Generic Account Fields */}
                                {accountConfig.accountType === "generic" && (
                                  <div className="space-y-2">
                                    <Label htmlFor="newRecipientAccount">
                                      {accountFieldLabel(t, "account_number", accountConfig.fieldLabels.account_number)} *
                                    </Label>
                                    <Input
                                      id="newRecipientAccount"
                                      value={newRecipientData.accountNumber}
                                      onChange={(e) => {
                                        const formatted = formatAccountNumber(e.target.value)
                                        setNewRecipientData({ ...newRecipientData, accountNumber: formatted })
                                      }}
                                      placeholder={accountFieldPlaceholder(t, "account_number", accountConfig.fieldPlaceholders.account_number)}
                                      required
                                    />
                                  </div>
                                )}
                              </>
                            )
                          })()}
                          <Button
                            onClick={handleAddNewRecipient}
                            disabled={(() => {
                              if (!newRecipientData.fullName || !receiveCurrency) return true

                              const accountConfig = getAccountTypeConfigFromCurrency(receiveCurrency)
                              const requiredFields = accountConfig.requiredFields

                              // For US accounts, transfer type and account type are required
                              if (accountConfig.accountType === "us") {
                                if (!newRecipientData.transferType || !newRecipientData.checkingOrSavings) {
                                  return true
                                }
                              }

                              // Map snake_case field names from config to camelCase form field names
                              const mapFieldName = (fieldName: string): string => {
                                const fieldMap: Record<string, string> = {
                                  account_name: "fullName",
                                  routing_number: "routingNumber",
                                  account_number: "accountNumber",
                                  bank_name: "bankName",
                                  sort_code: "sortCode",
                                  iban: "iban",
                                  swift_bic: "swiftBic",
                                  address_line1: "addressLine1",
                                  address_line2: "addressLine2",
                                  city: "city",
                                  state: "state",
                                  postal_code: "postalCode",
                                  checking_or_savings: "checkingOrSavings",
                                }
                                return fieldMap[fieldName] || fieldName
                              }

                              for (const field of requiredFields) {
                                const formFieldName = mapFieldName(field)
                                const fieldValue = newRecipientData[formFieldName as keyof typeof newRecipientData]
                                if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
                                  return true
                                }
                              }

                              return false
                            })()}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            {t("send.addRecipientBtn")}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Saved Recipients List */}
                    <div className="space-y-3">
                      {filteredSavedRecipients.map((recipient) => (
                        <div
                          key={recipient.id}
                          onClick={() => handleSelectRecipient(recipient)}
                          className={cn(
                            "selectable-row",
                            selectedRecipientId === recipient.id
                              ? "selectable-row--selected"
                              : "selectable-row--idle",
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center relative">
                              <span className="text-primary font-semibold text-sm">
                                {recipient.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                              <div className="absolute -bottom-1 -right-1 w-6 h-4 rounded-sm overflow-hidden">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: currencies.find((c) => c.code === recipient.currency)?.flag || "",
                                  }}
                                  className="w-full h-full"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{recipient.full_name}</p>
                              <div className="text-sm text-gray-500 space-y-0.5">
                                {(() => {
                                  const accountConfig = getAccountTypeConfigFromCurrency(recipient.currency)
                                  const accountType = accountConfig.accountType

                                  return (
                                    <>
                                      {/* Show account number for US/UK/Generic, or IBAN for EURO */}
                                      {accountType === "euro" && recipient.iban ? (
                                        <p className="font-mono text-xs">
                                          {formatFieldValue(accountType, "iban", recipient.iban)}
                                        </p>
                                      ) : recipient.account_number ? (
                                        <p className="font-mono text-xs">
                                          {recipient.account_number}
                              </p>
                                      ) : null}
                                      <p>{recipient.bank_name}</p>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                          {selectedRecipientId === recipient.id && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {filteredSavedRecipients.length === 0 && searchTerm && (
                      <div className="text-center py-8 text-gray-500">
                        <p>{t("send.noRecipientsSearch", { term: searchTerm })}</p>
                      </div>
                    )}

                    {filteredSavedRecipients.length === 0 && !searchTerm && (
                      <div className="text-center py-8 text-gray-500">
                        <p>{t("send.noRecipientsCurrency", { currency: receiveCurrency })}</p>
                        <p className="text-sm">{t("send.addRecipientHint")}</p>
                      </div>
                    )}
                      </>
                    )}

                    <div className="flex gap-3 sm:gap-4">
                      <Button variant="outline" onClick={handleBack} className="min-h-12 flex-1 bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t("send.back")}
                      </Button>
                      <Button
                        onClick={handleContinue}
                        disabled={
                          fulfillmentResolution.ok && fulfillmentResolution.fulfillment === "cash_hand"
                            ? !selectedDeliveryAddressId
                            : !selectedRecipientId
                        }
                        className="min-h-12 flex-1 rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                      >
                        {t("send.continue")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment Instructions */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("send.makePayment")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Transfer amount and description */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {sendCurrencyData && <CurrencyFlagIcon currency={sendCurrencyData} />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary">
                            {fulfillmentResolution.ok &&
                            fulfillmentResolution.fulfillment === "cash_hand" &&
                            logisticsFee > 0
                              ? t("send.transferLineWithLogistics", {
                                  amount: formatCurrency(totalToPay, sendCurrency),
                                })
                              : t("send.transferLine", { amount: formatCurrency(totalToPay, sendCurrency) })}
                          </h3>
                          {!(
                            fulfillmentResolution.ok &&
                            fulfillmentResolution.fulfillment === "cash_hand" &&
                            logisticsFee > 0
                          ) && (
                            <p className="text-xs text-gray-600">
                              {fee > 0
                                ? t("send.sendAmountPlusFee", {
                                    send: formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency),
                                    fee: formatCurrency(fee, sendCurrency),
                                  })
                                : t("send.sendMoneyCompleteHint")}
                            </p>
                          )}
                        </div>
                      </div>

                    {/* Payment method (Office-configured) */}
                      {(() => {
                        const accountConfig = getAccountTypeConfigFromCurrency(sendCurrency)
                        const accountType = accountConfig.accountType

                        const paymentMethodsForCurrency = getPaymentMethodsForCurrency(sendCurrency)
                        const defaultMethod = getDefaultPaymentMethod(sendCurrency)

                        if (paymentMethodsForCurrency.length === 0) {
                          return (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                              <p className="text-red-700">{t("send.noPaymentMethods", { currency: sendCurrency })}</p>
                              <p className="text-red-600 text-sm">{t("send.contactSupport")}</p>
                            </div>
                          )
                        }

                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Payment Method Details */}
                            <div className="space-y-3">
                              {defaultMethod?.type === "bank_account" && (() => {
                                return (
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  <div className="space-y-2">
                                      {/* Account Name - Always shown */}
                                      <div className="space-y-1">
                                        <span className="text-gray-600 text-xs">
                                          {accountFieldLabel(t, "account_name", accountConfig.fieldLabels.account_name)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{defaultMethod.account_name}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                            onClick={() => handleCopy(defaultMethod.account_name || "", "accountName")}
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.accountName ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>

                                      {/* US Account Fields */}
                                      {accountType === "us" && defaultMethod.routing_number && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountFieldLabel(t, "routing_number", accountConfig.fieldLabels.routing_number)}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-sm">
                                              {formatFieldValue(accountType, "routing_number", defaultMethod.routing_number)}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleCopy(defaultMethod.routing_number || "", "routingNumber")}
                                              className="h-5 w-5 p-0"
                                            >
                                              {copiedStates.routingNumber ? (
                                                <Check className="h-3 w-3 text-green-600" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {/* UK Account Fields */}
                                      {accountType === "uk" && defaultMethod.sort_code && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountFieldLabel(t, "sort_code", accountConfig.fieldLabels.sort_code)}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-sm">
                                              {formatFieldValue(accountType, "sort_code", defaultMethod.sort_code)}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleCopy(defaultMethod.sort_code || "", "sortCode")}
                                              className="h-5 w-5 p-0"
                                            >
                                              {copiedStates.sortCode ? (
                                                <Check className="h-3 w-3 text-green-600" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Account Number - Shown for US, UK, and Generic */}
                                      {(accountType === "us" || accountType === "uk" || accountType === "generic") &&
                                        defaultMethod.account_number && (
                                          <div className="space-y-1">
                                            <span className="text-gray-600 text-xs">
                                              {accountFieldLabel(t, "account_number", accountConfig.fieldLabels.account_number)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                        <span className="font-medium font-mono text-sm">
                                          {defaultMethod.account_number}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                                onClick={() => handleCopy(defaultMethod.account_number || "", "accountNumber")}
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.accountNumber ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                        )}

                                      {/* IBAN - Shown for UK and EURO */}
                                      {(accountType === "uk" || accountType === "euro") && defaultMethod.iban && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountFieldLabel(t, "iban", accountConfig.fieldLabels.iban)}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-xs">
                                              {formatFieldValue(accountType, "iban", defaultMethod.iban)}
                                            </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                              onClick={() => handleCopy(defaultMethod.iban || "", "iban")}
                                          className="h-5 w-5 p-0"
                                        >
                                              {copiedStates.iban ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                      )}

                                      {/* SWIFT/BIC - Shown for UK and EURO if present */}
                                      {(accountType === "uk" || accountType === "euro") && defaultMethod.swift_bic && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountFieldLabel(t, "swift_bic", accountConfig.fieldLabels.swift_bic)}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-xs">
                                              {defaultMethod.swift_bic}
                                            </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                              onClick={() => handleCopy(defaultMethod.swift_bic || "", "swiftBic")}
                                          className="h-5 w-5 p-0"
                                        >
                                              {copiedStates.swiftBic ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                      )}

                                      {/* Bank Name - Always shown */}
                                      <div className="space-y-1">
                                        <span className="text-gray-600 text-xs">
                                          {accountFieldLabel(t, "bank_name", accountConfig.fieldLabels.bank_name)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{defaultMethod.bank_name}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopy(defaultMethod.bank_name || "", "bankName")}
                                            className="h-5 w-5 p-0"
                                          >
                                            {copiedStates.bankName ? (
                                              <Check className="h-3 w-3 text-green-600" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                          </Button>
                                  </div>
                                </div>
                                    </div>
                                  </div>
                                )
                              })()}

                              {defaultMethod?.type === "qr_code" && (
                                <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                                  <div className="flex items-center justify-center gap-2 mb-3">
                                    <QrCode className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden">
                                    {defaultMethod.qr_code_data ? (
                                      defaultMethod.qr_code_data.endsWith(".svg") ? (
                                        <img
                                          src={defaultMethod.qr_code_data || "/placeholder.svg"}
                                          alt={t("send.qrCodeAlt")}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : defaultMethod.qr_code_data.endsWith(".pdf") ? (
                                        <div className="text-center">
                                          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                                          <a
                                            href={defaultMethod.qr_code_data}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                                          >
                                            {t("send.viewQrPdf")}
                                          </a>
                                        </div>
                                      ) : (
                                        <img
                                          src={defaultMethod.qr_code_data || "/placeholder.svg"}
                                          alt={t("send.qrCodeAlt")}
                                          className="w-full h-full object-contain"
                                        />
                                      )
                                    ) : (
                                      <QrCode className="h-16 w-16 text-gray-400" />
                                    )}
                                  </div>
                                  {defaultMethod.instructions && (
                                    <p className="text-xs text-gray-500 mb-2">{defaultMethod.instructions}</p>
                                  )}
                                </div>
                              )}

                              {defaultMethod?.type === "stablecoin" && (
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Coins className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  {defaultMethod.crypto_asset && (
                                    <div className="space-y-1 mb-2">
                                      <span className="text-gray-600 text-xs">{t("send.cryptoAsset")}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{defaultMethod.crypto_asset}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleCopy(String(defaultMethod.crypto_asset || ""), "cryptoAsset")
                                          }
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
                                  )}
                                  {defaultMethod.crypto_network && (
                                    <div className="space-y-1 mb-2">
                                      <span className="text-gray-600 text-xs">{t("send.cryptoNetwork")}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{defaultMethod.crypto_network}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleCopy(String(defaultMethod.crypto_network || ""), "cryptoNetwork")
                                          }
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
                                  )}
                                  {defaultMethod.wallet_address?.trim() ? (
                                    <>
                                      <div className="space-y-1 mb-3">
                                        <span className="text-gray-600 text-xs">{t("send.walletAddress")}</span>
                                        <div className="flex items-start gap-2">
                                          <span className="font-medium font-mono text-xs break-all flex-1">
                                            {defaultMethod.wallet_address.trim()}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleCopy(defaultMethod.wallet_address.trim(), "walletAddress")
                                            }
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
                                        <QRCodeSVG
                                          value={defaultMethod.wallet_address.trim()}
                                          size={176}
                                          level="M"
                                          includeMargin
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-sm text-amber-700">{t("send.stablecoinMissingAddress")}</p>
                                  )}
                                  {defaultMethod.instructions && (
                                    <p className="text-xs text-gray-500">{defaultMethod.instructions}</p>
                                  )}
                                </div>
                              )}

                              {defaultMethod?.type === "mobile_money" && (
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Smartphone className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="space-y-1">
                                      <span className="text-gray-600 text-xs">{t("send.mobileMoneyNameLabel")}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{defaultMethod.account_name}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleCopy(defaultMethod.account_name || "", "mmDisplayName")
                                          }
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.mmDisplayName ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-gray-600 text-xs">{t("send.mobileMoneyPhoneLabel")}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium font-mono text-sm">
                                          {defaultMethod.account_number}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleCopy(defaultMethod.account_number || "", "mmPhone")
                                          }
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.mmPhone ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  {defaultMethod.instructions && (
                                    <p className="text-xs text-gray-500 mt-2">{defaultMethod.instructions}</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Important Instructions */}
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
                                      <strong>{formatCurrency(totalToPay, sendCurrency)}</strong>
                                      {(!fulfillmentResolution.ok ||
                                        fulfillmentResolution.fulfillment !== "cash_hand") &&
                                        fee > 0 && (
                                        <span className="text-xs block text-amber-600">
                                          {t("send.amountFeeBreakdown", {
                                            send: formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency),
                                            fee: formatCurrency(fee, sendCurrency),
                                          })}
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span className="flex-1">
                                      {t("send.noteTransactionId")}{" "}
                                      <span className="inline-flex items-center gap-1">
                                        <strong>{transactionId}</strong>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(transactionId, "transactionIdInstructions")}
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
                                  {defaultMethod?.type === "qr_code" && (
                                    <li className="flex items-start gap-2">
                                      <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                      <span>{t("send.scanQrBanking")}</span>
                                    </li>
                                  )}
                                  {defaultMethod?.type === "stablecoin" && (
                                    <li className="flex items-start gap-2">
                                      <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                      <span>{t("send.scanWalletQr")}</span>
                                    </li>
                                  )}
                                  {defaultMethod?.type === "mobile_money" && (
                                    <li className="flex items-start gap-2">
                                      <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                      <span>{t("send.payMobileMoney")}</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                    {/* Upload Receipt Section with Better Error Handling */}
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />

                      {/* Upload Error Alert */}
                      {uploadError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-red-700 font-medium">{t("send.uploadError")}</p>
                              <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleDismissUploadError}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div
                        onClick={handleUploadClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200",
                          isDragOver
                            ? "border-gray-300 bg-primary/[0.06]"
                            : uploadedFile
                              ? "border-green-300 bg-green-50"
                              : uploadError
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:bg-muted/40",
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
                                    : "bg-gray-100 group-hover:bg-primary-50"
                            }`}
                          >
                            {uploadedFile ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : uploadError ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <Upload
                                className={`h-5 w-5 transition-colors ${
                                  isDragOver ? "text-primary" : "text-gray-400"
                                }`}
                              />
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
                          {uploadedFile && (
                            <Button
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
                          )}
                        </div>

                        {/* Progress Bar (shown when uploading) */}
                        {isUploading && (
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
                        )}
                      </div>

                      <div className="flex gap-3 sm:gap-4">
                        <Button variant="outline" onClick={handleBack} className="min-h-12 flex-1 bg-transparent">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          {t("send.back")}
                        </Button>
                        <Button
                          onClick={handleContinue}
                          disabled={isCreatingTransaction}
                          className="min-h-12 flex-1 rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                        >
                          {isCreatingTransaction ? t("send.sending") : t("send.ivePaid")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Transaction Summary Sidebar */}
            <div className="min-w-0 lg:col-span-1">
              <TransactionSummary />
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <Dialog open={showEmailVerificationModal} onOpenChange={setShowEmailVerificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {t("send.emailVerificationTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("send.emailVerificationBody", { email: user?.email ?? "" })}
            </p>
            <p className="text-sm text-gray-600">{t("send.emailVerificationCheck")}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEmailVerificationModal(false)}
                className="flex-1"
              >
                {t("send.cancel")}
              </Button>
              <Button
                onClick={handleResendVerificationEmail}
                disabled={isResendingVerification}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isResendingVerification ? t("send.resending") : t("send.resendEmail")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
