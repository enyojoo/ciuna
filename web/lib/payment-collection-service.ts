// Payment collection service for supported local currencies.
import { yellowCardService } from "./yellow-card-service"

const SUPPORTED = process.env.YELLOW_CARD_SUPPORTED_CURRENCIES?.split(",") || ["NGN", "KES", "GHS"]

interface VirtualAccountDetails {
  provider: "yellow_card"
  accountName: string
  accountNumber?: string
  bankName: string
  routingNumber?: string
  sortCode?: string
  iban?: string
  swiftBic?: string
  mobileMoneyNumber?: string
  reference?: string
  currency: string
}

interface PaymentLink {
  id: string
  customer_id: string
  amount: string
  currency: string
  status: string
  payment_url: string
  expires_at?: string
  created_at: string
}

export const paymentCollectionService = {
  async getVirtualAccountDetails(
    currency: string,
    _amount: string,
    reference?: string,
  ): Promise<VirtualAccountDetails> {
    const currencyUpper = currency.toUpperCase()

    if (!yellowCardService.isCurrencySupported(currencyUpper)) {
      throw new Error(
        `Payment collection is only available for supported currencies (${SUPPORTED.join(", ")}).`,
      )
    }

    return {
      provider: "yellow_card",
      accountName: "Ciuna Payments",
      accountNumber: "1234567890",
      bankName: "Ciuna Payments",
      mobileMoneyNumber: "1234567890",
      reference: reference,
      currency: currencyUpper,
    }
  },

  /**
   * Stub payment link for supported collection currencies.
   */
  async createPaymentLink(
    customerId: string,
    params: {
      amount: string
      currency: string
      reference?: string
      successUrl?: string
      failureUrl?: string
      idempotencyKey?: string
    },
  ): Promise<PaymentLink> {
    const currency = params.currency.toUpperCase()
    if (!yellowCardService.isCurrencySupported(currency)) {
      throw new Error(
        `Payment links are only available for supported currencies (${SUPPORTED.join(", ")}), not ${currency}.`,
      )
    }

    const id = params.idempotencyKey || params.reference || `yc-${Date.now()}`
    return {
      id,
      customer_id: customerId,
      amount: params.amount,
      currency,
      status: "pending",
      payment_url: params.successUrl || process.env.NEXT_PUBLIC_APP_URL || "https://app.ciuna.com",
      created_at: new Date().toISOString(),
    }
  },

  async checkPaymentStatus(
    _paymentLinkId: string,
  ): Promise<{ status: "pending" | "paid" | "failed" | "expired" }> {
    return { status: "pending" }
  },
}
