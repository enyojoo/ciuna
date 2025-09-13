export interface PaymentProvider {
    id: string;
    name: string;
    display_name: string;
    provider_type: 'YOOMONEY' | 'STRIPE' | 'CASH' | 'BANK_TRANSFER';
    is_active: boolean;
    supported_currencies: string[];
    supported_countries: string[];
    config: Record<string, any>;
    created_at: string;
    updated_at: string;
}
export interface PaymentMethod {
    id: string;
    user_id: string;
    provider_id: string;
    method_type: 'CARD' | 'BANK_ACCOUNT' | 'WALLET' | 'CASH' | 'CRYPTO';
    provider_method_id?: string;
    is_default: boolean;
    is_verified: boolean;
    metadata: Record<string, any>;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}
export interface PaymentTransaction {
    id: string;
    user_id: string;
    order_id?: string;
    provider_id: string;
    payment_method_id?: string;
    transaction_type: 'PAYMENT' | 'REFUND' | 'CHARGEBACK' | 'DISPUTE' | 'TRANSFER';
    amount: number;
    currency_code: string;
    exchange_rate?: number;
    amount_original?: number;
    currency_original?: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'DISPUTED' | 'CHARGEBACK';
    provider_transaction_id?: string;
    provider_response: Record<string, any>;
    failure_reason?: string;
    metadata: Record<string, any>;
    processed_at?: string;
    created_at: string;
    updated_at: string;
}
export interface EscrowAccount {
    id: string;
    order_id: string;
    buyer_id: string;
    seller_id: string;
    amount: number;
    currency_code: string;
    status: 'PENDING' | 'FUNDED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
    release_conditions: Record<string, any>;
    released_at?: string;
    released_by?: string;
    created_at: string;
    updated_at: string;
}
export interface ExchangeRate {
    id: string;
    from_currency: string;
    to_currency: string;
    rate: number;
    provider: string;
    valid_from: string;
    valid_until?: string;
    created_at: string;
}
export declare class PaymentService {
    /**
     * Get available payment providers
     */
    static getProviders(): Promise<PaymentProvider[]>;
    /**
     * Get user's payment methods
     */
    static getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
    /**
     * Add a new payment method
     */
    static addPaymentMethod(userId: string, providerId: string, methodType: PaymentMethod['method_type'], providerMethodId?: string, metadata?: Record<string, any>): Promise<{
        success: boolean;
        paymentMethodId?: string;
    }>;
    /**
     * Set default payment method
     */
    static setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean>;
    /**
     * Create a payment transaction
     */
    static createPayment(userId: string, orderId: string, providerId: string, paymentMethodId: string, amount: number, currencyCode: string, metadata?: Record<string, any>): Promise<{
        success: boolean;
        transactionId?: string;
        paymentUrl?: string;
    }>;
    /**
     * Process payment with specific provider
     */
    private static processPaymentWithProvider;
    /**
     * Process YooMoney payment
     */
    private static processYooMoneyPayment;
    /**
     * Process Stripe payment
     */
    private static processStripePayment;
    /**
     * Process cash payment
     */
    private static processCashPayment;
    /**
     * Process bank transfer payment
     */
    private static processBankTransferPayment;
    /**
     * Get payment transaction status
     */
    static getTransactionStatus(transactionId: string): Promise<PaymentTransaction | null>;
    /**
     * Get user's payment transactions
     */
    static getUserTransactions(userId: string, limit?: number, offset?: number): Promise<PaymentTransaction[]>;
    /**
     * Create escrow account
     */
    static createEscrowAccount(orderId: string, buyerId: string, sellerId: string, amount: number, currencyCode: string, releaseConditions?: Record<string, any>): Promise<{
        success: boolean;
        escrowAccountId?: string;
    }>;
    /**
     * Release escrow funds
     */
    static releaseEscrowFunds(escrowAccountId: string, releasedBy: string): Promise<boolean>;
    /**
     * Get exchange rate
     */
    static getExchangeRate(fromCurrency: string, toCurrency: string, date?: Date): Promise<number | null>;
    /**
     * Convert currency amount
     */
    static convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<{
        success: boolean;
        convertedAmount?: number;
        rate?: number;
    }>;
    /**
     * Process payment webhook
     */
    static processWebhook(providerId: string, webhookId: string, eventType: string, payload: Record<string, any>, signature?: string): Promise<{
        success: boolean;
        webhookId?: string;
    }>;
}
//# sourceMappingURL=payments.d.ts.map