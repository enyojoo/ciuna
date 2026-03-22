// Send Transaction Processor — Yellow Card payouts only (no Bridge/crypto rails).

import { yellowCardService } from "./yellow-card-service"
import { paymentCollectionService } from "./payment-collection-service"

interface TransactionStatus {
  paymentStatus: "pending" | "received" | "failed"
  payoutStatus: "pending" | "processing" | "completed" | "failed"
  payoutProvider?: "yellow_card"
  payoutId?: string
}

export const sendTransactionProcessor = {
  async collectPayment(
    transactionId: string,
    customerId: string,
    paymentData: {
      amount: string
      currency: string
      reference?: string
      successUrl?: string
      failureUrl?: string
    },
  ): Promise<{ paymentLinkId: string; paymentUrl: string }> {
    const paymentLink = await paymentCollectionService.createPaymentLink(customerId, {
      amount: paymentData.amount,
      currency: paymentData.currency,
      reference: paymentData.reference || transactionId,
      successUrl: paymentData.successUrl,
      failureUrl: paymentData.failureUrl,
      idempotencyKey: transactionId,
    })

    return {
      paymentLinkId: paymentLink.id,
      paymentUrl: paymentLink.payment_url,
    }
  },

  async routeToPayout(
    transactionId: string,
    _customerId: string,
    payoutData: {
      amount: string
      currency: string
      recipientAccountNumber?: string
      recipientBankName?: string
      recipientName?: string
      externalAccountId?: string
      paymentRail?: "wire" | "ach" | "sepa"
      reference?: string
    },
  ): Promise<{ provider: "yellow_card"; payoutId: string }> {
    const currency = payoutData.currency.toUpperCase()

    if (!yellowCardService.isCurrencySupported(currency)) {
      throw new Error(
        `Payouts are only supported for Yellow Card currencies. USD/EUR Bridge payouts have been removed.`,
      )
    }

    const disbursement = await yellowCardService.createDisbursement({
      amount: parseFloat(payoutData.amount),
      currency: currency,
      recipientAccountNumber: payoutData.recipientAccountNumber || "",
      recipientBankName: payoutData.recipientBankName,
      recipientName: payoutData.recipientName,
      reference: payoutData.reference || transactionId,
    })

    return {
      provider: "yellow_card",
      payoutId: disbursement.id,
    }
  },

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
  ): Promise<void> {
    console.log(`Updating transaction ${transactionId} with status:`, status)
  },

  async checkAndRoutePayment(
    transactionId: string,
    paymentLinkId: string,
    customerId: string,
    payoutData: {
      amount: string
      currency: string
      recipientAccountNumber?: string
      recipientBankName?: string
      recipientName?: string
      externalAccountId?: string
      paymentRail?: "wire" | "ach" | "sepa"
    },
  ): Promise<{ routed: boolean; payoutId?: string }> {
    const paymentStatus = await paymentCollectionService.checkPaymentStatus(paymentLinkId)

    if (paymentStatus.status === "paid") {
      const payoutResult = await this.routeToPayout(transactionId, customerId, {
        ...payoutData,
        reference: transactionId,
      })

      await this.updateTransactionStatus(transactionId, {
        paymentStatus: "received",
        payoutStatus: "processing",
        payoutProvider: payoutResult.provider,
        payoutId: payoutResult.payoutId,
      })

      return {
        routed: true,
        payoutId: payoutResult.payoutId,
      }
    }

    return {
      routed: false,
    }
  },
}
