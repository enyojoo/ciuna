// Email templates for all notification types

import { generateBaseEmailTemplate, generateTransactionDetails } from './email-generator'
import type { EmailTemplate, ReferralPayoutEmailData, TransactionEmailData, WelcomeEmailData } from './email-types'

export const emailTemplates: Record<string, EmailTemplate> = {
  // Welcome Email
  welcome: {
    subject: "Welcome to Ciuna! Let's get started",
    html: (data: WelcomeEmailData) => {
      const content = `
        <p class="welcome-text">
          Hi ${data.firstName}! Welcome to Ciuna.
        </p>
        
        <p class="confirmation-text">
          Thank you for joining Ciuna! We're excited to have you as part of our community. 
          Your account is now active and ready to send money across borders in under 5 minutes.
        </p>
        
        <p class="confirmation-text">
          With Ciuna, you can:
        </p>
        
        <ul style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 20px 0; padding-left: 20px;">
          <li><strong>Send money globally in under 5 minutes</strong> - Lightning-fast cross-border transfers</li>
          <li>Track your transfers in real-time with live updates</li>
          <li>Save your favorite recipients for instant transfers</li>
          <li>Enjoy competitive exchange rates with zero hidden fees</li>
        </ul>
        
        <div class="security-note">
          <h3>Getting Started</h3>
          <p>To send your first transfer, simply click the "Send Money" button in your dashboard and follow the easy steps. Your money will reach its destination in under 5 minutes!</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Welcome to Ciuna!",
        "",
        content,
        {
          text: "Go to Dashboard",
          url: data.dashboardUrl
        }
      )
    },
    text: (data: WelcomeEmailData) => `
Welcome to Ciuna!

Hi ${data.firstName}!

Thank you for joining Ciuna! We're excited to have you as part of our community. Your account is now active and ready to send money across borders in under 5 minutes.

With Ciuna, you can:
• Send money globally in under 5 minutes - Lightning-fast cross-border transfers
• Track your transfers in real-time with live updates
• Save your favorite recipients for instant transfers
• Enjoy competitive exchange rates with zero hidden fees

Getting Started:
To send your first transfer, simply go to your dashboard and click "Send Money". Your money will reach its destination in under 5 minutes!

Go to Dashboard: ${data.dashboardUrl}

Need help? Contact us at support@ciuna.com

© ${new Date().getFullYear()} Ciuna. All rights reserved.
    `
  },

  // Transaction Pending
  transactionPending: {
    subject: (data: TransactionEmailData) => `Transfer Created - #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Your transfer to ${data.recipientName} has been created and is now being processed. 
          We'll send you updates as your money makes its way to its destination!
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What's Next</h3>
          <p>We're working on your transfer and will notify you as soon as it's completed. You can track the progress in your dashboard.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transaction Created",
        "",
        content,
        {
          text: "Track Transaction",
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transaction Created - #${data.transactionId}

Your transfer to ${data.recipientName} has been created and is now being processed. We'll send you updates as your money makes its way to its destination!

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}${(data.logisticsFee ?? 0) > 0 ? `\n- Logistics fee: ${data.logisticsFee} ${data.sendCurrency}` : ""}${data.totalAmount != null ? `\n- Total paid: ${data.totalAmount} ${data.sendCurrency}` : ""}
- Status: ${data.status}

What's Next:
We're working on your transfer and will notify you as soon as it's completed. You can track the progress in your dashboard.

Track Transaction: ${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@ciuna.com
    `
  },

  // Transaction Processing
  transactionProcessing: {
    subject: (data: TransactionEmailData) => `Transfer Processing - #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Great news! We've received your payment and your transfer to ${data.recipientName} is now being processed. 
          Your money will arrive in under 5 minutes!
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What's Happening</h3>
          <p>We're working with our banking partners to complete your transfer. Thanks to our advanced technology, this typically takes under 5 minutes!</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Processing",
        "",
        content,
        {
          text: "Track Transfer",
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Processing - Transaction #${data.transactionId}

Great news! We've received your payment and your transfer to ${data.recipientName} is now being processed. Your money will arrive in under 5 minutes!

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}${(data.logisticsFee ?? 0) > 0 ? `\n- Logistics fee: ${data.logisticsFee} ${data.sendCurrency}` : ""}${data.totalAmount != null ? `\n- Total paid: ${data.totalAmount} ${data.sendCurrency}` : ""}
- Status: ${data.status}

What's Happening:
We're working with our banking partners to complete your transfer. Thanks to our advanced technology, this typically takes under 5 minutes!

Track Transfer: ${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@ciuna.com
    `
  },

  // Transaction Completed
  transactionCompleted: {
    subject: (data: TransactionEmailData) => `Transfer Completed Successfully! 🎉 #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Your transfer to ${data.recipientName} has been completed successfully! 
          The money has been sent and should arrive within minutes.
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What's Next</h3>
          <p>Your recipient should receive the money within minutes thanks to our fast processing. You can track all your transfers in your dashboard.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Completed!",
        "",
        content,
        {
          text: "View Transaction",
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send/${data.transactionId.toLowerCase()}`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Completed - Transaction #${data.transactionId}

Your transfer to ${data.recipientName} has been completed successfully! The money has been sent and should arrive within minutes.

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}${(data.logisticsFee ?? 0) > 0 ? `\n- Logistics fee: ${data.logisticsFee} ${data.sendCurrency}` : ""}${data.totalAmount != null ? `\n- Total paid: ${data.totalAmount} ${data.sendCurrency}` : ""}
- Status: ${data.status}

What's Next:
Your recipient should receive the money within minutes thanks to our fast processing. You can track all your transfers in your dashboard.

View Transaction: ${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send/${data.transactionId.toLowerCase()}

Need help? Contact us at support@ciuna.com
    `
  },

  // Transaction Failed
  transactionFailed: {
    subject: (data: TransactionEmailData) => `Transfer Failed - #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Unfortunately, your transfer to ${data.recipientName} could not be completed. 
          ${data.failureReason ? `Reason: ${data.failureReason}` : 'Please contact support for more information.'}
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>What Happens Next</h3>
          <p>If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Failed",
        "",
        content,
        {
          text: "Contact Support",
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/support`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Failed - Transaction #${data.transactionId}

Unfortunately, your transfer to ${data.recipientName} could not be completed. 
${data.failureReason ? `Reason: ${data.failureReason}` : 'Please contact support for more information.'}

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}${(data.logisticsFee ?? 0) > 0 ? `\n- Logistics fee: ${data.logisticsFee} ${data.sendCurrency}` : ""}${data.totalAmount != null ? `\n- Total paid: ${data.totalAmount} ${data.sendCurrency}` : ""}
- Status: ${data.status}

What Happens Next:
If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.

Contact Support: ${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/support

Need help? Contact us at support@ciuna.com
    `
  },

  // Transaction Cancelled
  transactionCancelled: {
    subject: (data: TransactionEmailData) => `Transfer Cancelled - #${data.transactionId}`,
    html: (data: TransactionEmailData) => {
      const content = `
        <p class="confirmation-text">
          Your transfer to ${data.recipientName} has been cancelled. 
          ${data.failureReason ? `Reason: ${data.failureReason}` : 'This may have been cancelled by you or our support team.'}
        </p>
        
        ${generateTransactionDetails(data)}
        
        <div class="security-note">
          <h3>Refund Information</h3>
          <p>If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.</p>
        </div>
      `
      
      return generateBaseEmailTemplate(
        "Transfer Cancelled",
        "",
        content,
        {
          text: "Send New Transfer",
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send`
        }
      )
    },
    text: (data: TransactionEmailData) => `
Transfer Cancelled - Transaction #${data.transactionId}

Your transfer to ${data.recipientName} has been cancelled. 
${data.failureReason ? `Reason: ${data.failureReason}` : 'This may have been cancelled by you or our support team.'}

Transaction Details:
- Transaction ID: ${data.transactionId}
- Recipient: ${data.recipientName}
- Amount: ${data.sendAmount} ${data.sendCurrency}
- Receiving: ${data.receiveAmount} ${data.receiveCurrency}
- Rate Used: 1 ${data.sendCurrency} = ${data.exchangeRate} ${data.receiveCurrency}
- Fee: ${data.fee} ${data.sendCurrency}${(data.logisticsFee ?? 0) > 0 ? `\n- Logistics fee: ${data.logisticsFee} ${data.sendCurrency}` : ""}${data.totalAmount != null ? `\n- Total paid: ${data.totalAmount} ${data.sendCurrency}` : ""}
- Status: ${data.status}

Refund Information:
If you were charged for this transfer, we will automatically refund the amount to your original payment method within 3-5 business days.

Send New Transfer: ${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ciuna.com'}/send

Need help? Contact us at support@ciuna.com
    `
  },

  referralPayoutPending: {
    subject: (data: ReferralPayoutEmailData) =>
      data.payoutTransactionId
        ? `Referral payout request — #${data.payoutTransactionId}`
        : `Referral payout request received${data.payoutRequestId ? ` — ${data.payoutRequestId.slice(0, 8)}…` : ""}`,
    html: (data: ReferralPayoutEmailData) => {
      const amt = `${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      const ref = data.payoutTransactionId
        ? `<p class="confirmation-text" style="font-size:14px;color:#64748b;">Transaction ID: ${data.payoutTransactionId}</p>`
        : data.payoutRequestId
          ? `<p class="confirmation-text" style="font-size:14px;color:#64748b;">Request ID: ${data.payoutRequestId}</p>`
          : ""
      const content = `
        <p class="confirmation-text">
          Hi ${data.firstName}, we&apos;ve received your referral reward withdrawal request of ${amt} to ${data.recipientName}.
          Our team will review and process it—similar to when you start a send, you&apos;ll get another email when the payout is completed or if it&apos;s cancelled.
        </p>
        ${ref}
        <div class="security-note">
          <h3>What happens next</h3>
          <p>We&apos;ll notify you by email when the payout is sent or if the request is cancelled. You can also check status under Affiliates &amp; Referrals in the app.</p>
        </div>
      `
      return generateBaseEmailTemplate("Referral payout request received", "", content, {
        text: "View referrals",
        url: data.dashboardUrl,
      })
    },
    text: (data: ReferralPayoutEmailData) => {
      const amt = `${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      return `Referral payout request received

Hi ${data.firstName},

We've received your referral reward withdrawal request of ${amt} to ${data.recipientName}. Our team will review and process it—you'll get another email when the payout is completed or if it's cancelled.
${data.payoutTransactionId ? `Transaction ID: ${data.payoutTransactionId}\n` : data.payoutRequestId ? `Request ID: ${data.payoutRequestId}\n` : ""}
View referrals: ${data.dashboardUrl}

© ${new Date().getFullYear()} Ciuna. All rights reserved.`
    },
  },

  referralPayoutCompleted: {
    subject: (data: ReferralPayoutEmailData) =>
      `Referral payout sent — ${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    html: (data: ReferralPayoutEmailData) => {
      const amt = `${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      const content = `
        <p class="confirmation-text">
          Hi ${data.firstName}, your referral reward withdrawal of ${amt} to ${data.recipientName} has been completed.
          This send appears in your activity like a regular transfer and counts toward your send totals for the year.
        </p>
        ${data.linkedTransactionId ? `<p class="confirmation-text" style="font-size:14px;color:#64748b;">Transaction ID: ${data.linkedTransactionId}</p>` : ""}
      `
      return generateBaseEmailTemplate("Referral payout completed", "", content, {
        text: "View activity",
        url: data.dashboardUrl,
      })
    },
    text: (data: ReferralPayoutEmailData) => {
      const amt = `${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      return `Referral payout completed

Hi ${data.firstName},

Your referral reward withdrawal of ${amt} to ${data.recipientName} has been completed. This send appears in your activity and counts toward your send totals.
${data.linkedTransactionId ? `Transaction ID: ${data.linkedTransactionId}\n` : ""}
View activity: ${data.dashboardUrl}

© ${new Date().getFullYear()} Ciuna. All rights reserved.`
    },
  },

  referralPayoutCancelled: {
    subject: (_data: ReferralPayoutEmailData) => `Referral payout request cancelled`,
    html: (data: ReferralPayoutEmailData) => {
      const amt = `${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      const content = `
        <p class="confirmation-text">
          Hi ${data.firstName}, your referral payout request for ${amt} to ${data.recipientName} has been cancelled.
          Those funds remain in your available referral balance. If you did not expect this, contact support.
        </p>
      `
      return generateBaseEmailTemplate("Referral payout cancelled", "", content, {
        text: "Open referrals",
        url: data.dashboardUrl,
      })
    },
    text: (data: ReferralPayoutEmailData) => {
      const amt = `${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      return `Referral payout cancelled

Hi ${data.firstName},

Your referral payout request for ${amt} to ${data.recipientName} has been cancelled. Your available referral balance has not been reduced.

Open referrals: ${data.dashboardUrl}

© ${new Date().getFullYear()} Ciuna. All rights reserved.`
    },
  },

  // Admin Transaction Notification
  adminTransactionNotification: {
    subject: (data: any) => `New Transfer ${data.status === 'pending' ? 'Created' : 'Updated'} - #${data.transactionId}`,
    html: (data: any) => {
      const userName = data.userName && data.userName !== 'User' && data.userName !== 'Unknown' ? data.userName : 'a user'
      const content = `
        <p class="confirmation-text">
          ${data.status === 'pending' 
            ? `A new transaction has been created by ${userName} and requires your attention.` 
            : `A transaction status has been updated to ${data.status}. Please review the details below.`}
        </p>
      `

      const adminUrl = process.env.NEXT_PUBLIC_OFFICE_URL || 'https://bk.ciuna.com'
      return generateBaseEmailTemplate(
        data.status === 'pending' ? "New Transaction Created" : `Transaction ${data.status.toUpperCase()}`,
        "",
        content,
        {
          text: "View in Admin Dashboard",
          url: `${adminUrl}/transactions`
        }
      )
    },
    text: (data: any) => {
      const userName = data.userName && data.userName !== 'User' && data.userName !== 'Unknown' ? data.userName : 'a user'
      const adminUrl = process.env.NEXT_PUBLIC_OFFICE_URL || 'https://bk.ciuna.com'
      return `
${data.status === 'pending' ? 'New Transaction Created' : `Transaction Status Updated to ${data.status.toUpperCase()}`} - #${data.transactionId}

${data.status === 'pending' 
  ? `A new transaction has been created by ${userName} and requires your attention.` 
  : `A transaction status has been updated to ${data.status}. Please review the details below.`}

View in Admin Dashboard: ${adminUrl}/transactions

© ${new Date().getFullYear()} Ciuna. All rights reserved.
    `
    }
  }
}
