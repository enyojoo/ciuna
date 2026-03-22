// Combined Transaction Service — send transactions from the primary `transactions` table only.
import { transactionService, adminService } from "./database"

export interface CombinedTransaction {
  id: string
  transaction_id: string
  type: "send" | "receive" | "card_funding"
  user_id: string
  status: string
  created_at: string
  updated_at: string
  user?: {
    first_name: string
    last_name: string
    email: string
  }
  send_amount?: number
  send_currency?: string
  receive_amount?: number
  receive_currency?: string
  recipient?: any
  crypto_amount?: number
  crypto_currency?: string
  fiat_amount?: number
  fiat_currency?: string
  stellar_transaction_hash?: string
  blockchain_tx_hash?: string
  crypto_wallet?: any
  destination_type?: "bank" | "card"
  bridge_card_account_id?: string
}

export const combinedTransactionService = {
  async getUserAllTransactions(
    userId: string,
    filters: {
      type?: "all" | "send" | "receive"
      status?: string
      limit?: number
    } = {},
  ): Promise<CombinedTransaction[]> {
    const limit = filters.limit || 100

    const sendTransactions = await transactionService
      .getByUserId(userId, limit, userId)
      .catch((error) => {
        console.error("Error fetching send transactions:", error)
        return []
      })

    const sendTxns: CombinedTransaction[] = (sendTransactions || []).map((tx) => ({
      id: tx.id,
      transaction_id: tx.transaction_id,
      type: "send" as const,
      user_id: tx.user_id,
      status: tx.status,
      created_at: tx.created_at,
      updated_at: tx.updated_at,
      send_amount: tx.send_amount,
      send_currency: tx.send_currency,
      receive_amount: tx.receive_amount,
      receive_currency: tx.receive_currency,
      recipient: tx.recipient,
    }))

    let combined: CombinedTransaction[] = [...sendTxns]

    if (filters.type === "send") {
      combined = sendTxns
    } else if (filters.type === "receive") {
      combined = []
    }

    if (filters.status) {
      combined = combined.filter((tx) => tx.status === filters.status)
    }

    combined.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    return combined.slice(0, limit)
  },

  async getAdminAllTransactions(
    filters: {
      type?: "all" | "send" | "receive"
      status?: string
      search?: string
      limit?: number
    } = {},
  ): Promise<CombinedTransaction[]> {
    const limit = filters.limit || 100

    const sendTransactions = await adminService
      .getAllTransactions({
        status: filters.status,
        search: filters.search,
        limit,
      })
      .catch((error) => {
        console.error("Error fetching send transactions in getAdminAllTransactions:", error)
        return []
      })

    const sendTxns: CombinedTransaction[] = (sendTransactions || [])
      .filter((tx) => tx && tx.id)
      .map((tx) => ({
        id: tx.id,
        transaction_id: tx.transaction_id || tx.id,
        type: "send" as const,
        user_id: tx.user_id,
        status: tx.status || "pending",
        created_at: tx.created_at || new Date().toISOString(),
        updated_at: tx.updated_at || tx.created_at || new Date().toISOString(),
        send_amount: tx.send_amount,
        send_currency: tx.send_currency,
        receive_amount: tx.receive_amount,
        receive_currency: tx.receive_currency,
        recipient: tx.recipient,
        user: tx.user,
      }))

    let combined: CombinedTransaction[] = [...sendTxns]

    if (filters.type === "send") {
      combined = sendTxns
    } else if (filters.type === "receive") {
      combined = []
    }

    if (filters.status) {
      combined = combined.filter((tx) => tx.status === filters.status)
    }

    combined.sort((a, b) => {
      try {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      } catch {
        return 0
      }
    })

    return combined.slice(0, limit)
  },
}
