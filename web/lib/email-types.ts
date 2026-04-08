// Email notification types and interfaces

export interface EmailTemplate {
  subject: string
  html: (data: any) => string
  text: (data: any) => string
}

export interface EmailData {
  to: string
  template: string
  data: any
}

export interface TransactionEmailData {
  transactionId: string
  recipientName: string
  sendAmount: number
  sendCurrency: string
  receiveAmount: number
  receiveCurrency: string
  exchangeRate: number
  fee: number
  /** Corridor / transfer fee is separate from logistics (cash fulfillment). */
  logisticsFee?: number
  totalAmount?: number
  fulfillmentType?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface WelcomeEmailData {
  firstName: string
  lastName: string
  email: string
  baseCurrency: string
  dashboardUrl: string
}

/** Referral balance withdrawal / payout request lifecycle (mirrors send: pending → completed/cancelled) */
export interface ReferralPayoutEmailData {
  firstName: string
  amount: number
  currency: string
  recipientName: string
  /** pending = user just submitted; completed / cancelled = Office action */
  status: "pending" | "completed" | "cancelled"
  payoutRequestId?: string
  /** ETID reserved at request time (matches completed send row). */
  payoutTransactionId?: string
  linkedTransactionId?: string
  dashboardUrl: string
}

export interface EmailServiceConfig {
  fromEmail: string
  fromName: string
  replyTo?: string
}

export interface SendGridResponse {
  success: boolean
  messageId?: string
  error?: string
}
