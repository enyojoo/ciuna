import { supabase } from './client';
export class PaymentService {
    /**
     * Get available payment providers
     */
    static async getProviders() {
        try {
            const { data, error } = await supabase
                .from('payment_providers')
                .select('*')
                .eq('is_active', true)
                .order('display_name');
            if (error) {
                console.error('Error fetching payment providers:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in getProviders:', error);
            return [];
        }
    }
    /**
     * Get user's payment methods
     */
    static async getPaymentMethods(userId) {
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .select(`
          *,
          payment_providers (
            id,
            name,
            display_name,
            provider_type
          )
        `)
                .eq('user_id', userId)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching payment methods:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in getPaymentMethods:', error);
            return [];
        }
    }
    /**
     * Add a new payment method
     */
    static async addPaymentMethod(userId, providerId, methodType, providerMethodId, metadata) {
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .insert({
                user_id: userId,
                provider_id: providerId,
                method_type: methodType,
                provider_method_id: providerMethodId,
                metadata: metadata || {},
            })
                .select('id')
                .single();
            if (error) {
                console.error('Error adding payment method:', error);
                return { success: false };
            }
            return { success: true, paymentMethodId: data.id };
        }
        catch (error) {
            console.error('Error in addPaymentMethod:', error);
            return { success: false };
        }
    }
    /**
     * Set default payment method
     */
    static async setDefaultPaymentMethod(userId, paymentMethodId) {
        try {
            // First, unset all other default methods
            await supabase
                .from('payment_methods')
                .update({ is_default: false })
                .eq('user_id', userId);
            // Set the new default
            const { error } = await supabase
                .from('payment_methods')
                .update({ is_default: true })
                .eq('id', paymentMethodId)
                .eq('user_id', userId);
            if (error) {
                console.error('Error setting default payment method:', error);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error in setDefaultPaymentMethod:', error);
            return false;
        }
    }
    /**
     * Create a payment transaction
     */
    static async createPayment(userId, orderId, providerId, paymentMethodId, amount, currencyCode, metadata) {
        try {
            // Create transaction in database
            const { data: transactionId, error: dbError } = await supabase.rpc('create_payment_transaction', {
                p_user_id: userId,
                p_order_id: orderId,
                p_provider_id: providerId,
                p_payment_method_id: paymentMethodId,
                p_amount: amount,
                p_currency_code: currencyCode,
                p_metadata: metadata || {},
            });
            if (dbError) {
                console.error('Error creating payment transaction:', dbError);
                return { success: false };
            }
            // Process payment with provider
            const paymentResult = await this.processPaymentWithProvider(providerId, transactionId, amount, currencyCode, paymentMethodId, metadata);
            return {
                success: paymentResult.success,
                transactionId,
                paymentUrl: paymentResult.paymentUrl,
            };
        }
        catch (error) {
            console.error('Error in createPayment:', error);
            return { success: false };
        }
    }
    /**
     * Process payment with specific provider
     */
    static async processPaymentWithProvider(providerId, transactionId, amount, currencyCode, paymentMethodId, metadata) {
        try {
            // Get provider configuration
            const { data: provider, error } = await supabase
                .from('payment_providers')
                .select('*')
                .eq('id', providerId)
                .single();
            if (error || !provider) {
                return { success: false };
            }
            switch (provider.provider_type) {
                case 'YOOMONEY':
                    return await this.processYooMoneyPayment(provider, transactionId, amount, currencyCode, paymentMethodId, metadata);
                case 'STRIPE':
                    return await this.processStripePayment(provider, transactionId, amount, currencyCode, paymentMethodId, metadata);
                case 'CASH':
                    return await this.processCashPayment(provider, transactionId, amount, currencyCode, metadata);
                case 'BANK_TRANSFER':
                    return await this.processBankTransferPayment(provider, transactionId, amount, currencyCode, metadata);
                default:
                    return { success: false };
            }
        }
        catch (error) {
            console.error('Error processing payment with provider:', error);
            return { success: false };
        }
    }
    /**
     * Process YooMoney payment
     */
    static async processYooMoneyPayment(provider, transactionId, amount, currencyCode, paymentMethodId, metadata) {
        try {
            // Mock YooMoney integration
            // In a real implementation, you would:
            // 1. Create a payment request with YooMoney API
            // 2. Get payment URL for user to complete payment
            // 3. Store provider transaction ID
            const mockPaymentUrl = `https://yoomoney.ru/checkout/payments/v2/show?orderId=${transactionId}`;
            // Update transaction with provider response
            await supabase
                .from('payment_transactions')
                .update({
                provider_transaction_id: `ym_${transactionId}`,
                provider_response: {
                    payment_url: mockPaymentUrl,
                    status: 'pending',
                },
                status: 'PROCESSING',
            })
                .eq('id', transactionId);
            return { success: true, paymentUrl: mockPaymentUrl };
        }
        catch (error) {
            console.error('Error processing YooMoney payment:', error);
            return { success: false };
        }
    }
    /**
     * Process Stripe payment
     */
    static async processStripePayment(provider, transactionId, amount, currencyCode, paymentMethodId, metadata) {
        try {
            // Mock Stripe integration
            // In a real implementation, you would:
            // 1. Create a PaymentIntent with Stripe API
            // 2. Confirm payment with payment method
            // 3. Handle webhook responses
            const mockPaymentUrl = `https://checkout.stripe.com/pay/${transactionId}`;
            // Update transaction with provider response
            await supabase
                .from('payment_transactions')
                .update({
                provider_transaction_id: `pi_${transactionId}`,
                provider_response: {
                    payment_url: mockPaymentUrl,
                    status: 'requires_payment_method',
                },
                status: 'PROCESSING',
            })
                .eq('id', transactionId);
            return { success: true, paymentUrl: mockPaymentUrl };
        }
        catch (error) {
            console.error('Error processing Stripe payment:', error);
            return { success: false };
        }
    }
    /**
     * Process cash payment
     */
    static async processCashPayment(provider, transactionId, amount, currencyCode, metadata) {
        try {
            // Cash payments require manual verification
            await supabase
                .from('payment_transactions')
                .update({
                provider_transaction_id: `cash_${transactionId}`,
                provider_response: {
                    status: 'pending_verification',
                    instructions: 'Payment will be verified upon receipt of cash',
                },
                status: 'PENDING',
            })
                .eq('id', transactionId);
            return { success: true };
        }
        catch (error) {
            console.error('Error processing cash payment:', error);
            return { success: false };
        }
    }
    /**
     * Process bank transfer payment
     */
    static async processBankTransferPayment(provider, transactionId, amount, currencyCode, metadata) {
        try {
            // Bank transfer payments require manual verification
            await supabase
                .from('payment_transactions')
                .update({
                provider_transaction_id: `bank_${transactionId}`,
                provider_response: {
                    status: 'pending_verification',
                    instructions: 'Transfer funds to the provided bank account',
                    bank_details: {
                        account_number: '1234567890',
                        routing_number: '123456789',
                        bank_name: 'Example Bank',
                    },
                },
                status: 'PENDING',
            })
                .eq('id', transactionId);
            return { success: true };
        }
        catch (error) {
            console.error('Error processing bank transfer payment:', error);
            return { success: false };
        }
    }
    /**
     * Get payment transaction status
     */
    static async getTransactionStatus(transactionId) {
        try {
            const { data, error } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('id', transactionId)
                .single();
            if (error) {
                console.error('Error fetching transaction status:', error);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Error in getTransactionStatus:', error);
            return null;
        }
    }
    /**
     * Get user's payment transactions
     */
    static async getUserTransactions(userId, limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            if (error) {
                console.error('Error fetching user transactions:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in getUserTransactions:', error);
            return [];
        }
    }
    /**
     * Create escrow account
     */
    static async createEscrowAccount(orderId, buyerId, sellerId, amount, currencyCode, releaseConditions) {
        try {
            const { data, error } = await supabase
                .from('escrow_accounts')
                .insert({
                order_id: orderId,
                buyer_id: buyerId,
                seller_id: sellerId,
                amount: amount,
                currency_code: currencyCode,
                release_conditions: releaseConditions || {},
            })
                .select('id')
                .single();
            if (error) {
                console.error('Error creating escrow account:', error);
                return { success: false };
            }
            return { success: true, escrowAccountId: data.id };
        }
        catch (error) {
            console.error('Error in createEscrowAccount:', error);
            return { success: false };
        }
    }
    /**
     * Release escrow funds
     */
    static async releaseEscrowFunds(escrowAccountId, releasedBy) {
        try {
            const { error } = await supabase
                .from('escrow_accounts')
                .update({
                status: 'RELEASED',
                released_at: new Date().toISOString(),
                released_by: releasedBy,
            })
                .eq('id', escrowAccountId);
            if (error) {
                console.error('Error releasing escrow funds:', error);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error in releaseEscrowFunds:', error);
            return false;
        }
    }
    /**
     * Get exchange rate
     */
    static async getExchangeRate(fromCurrency, toCurrency, date) {
        try {
            const { data, error } = await supabase.rpc('get_exchange_rate', {
                p_from_currency: fromCurrency,
                p_to_currency: toCurrency,
                p_date: date?.toISOString() || new Date().toISOString(),
            });
            if (error) {
                console.error('Error getting exchange rate:', error);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Error in getExchangeRate:', error);
            return null;
        }
    }
    /**
     * Convert currency amount
     */
    static async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            if (fromCurrency === toCurrency) {
                return { success: true, convertedAmount: amount, rate: 1 };
            }
            const rate = await this.getExchangeRate(fromCurrency, toCurrency);
            if (!rate) {
                return { success: false };
            }
            const convertedAmount = Math.round(amount * rate);
            return { success: true, convertedAmount, rate };
        }
        catch (error) {
            console.error('Error in convertCurrency:', error);
            return { success: false };
        }
    }
    /**
     * Process payment webhook
     */
    static async processWebhook(providerId, webhookId, eventType, payload, signature) {
        try {
            const { data, error } = await supabase.rpc('process_payment_webhook', {
                p_provider_id: providerId,
                p_webhook_id: webhookId,
                p_event_type: eventType,
                p_payload: payload,
                p_signature: signature || null,
            });
            if (error) {
                console.error('Error processing webhook:', error);
                return { success: false };
            }
            return { success: true, webhookId: data };
        }
        catch (error) {
            console.error('Error in processWebhook:', error);
            return { success: false };
        }
    }
}
//# sourceMappingURL=payments.js.map