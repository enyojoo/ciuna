import { createClient } from './client';

const supabase = createClient();

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

export class PaymentService {
  /**
   * Get available payment providers
   */
  static async getProviders(): Promise<PaymentProvider[]> {
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
    } catch (error) {
      console.error('Error in getProviders:', error);
      return [];
    }
  }

  /**
   * Get user's payment methods
   */
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
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
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      return [];
    }
  }

  /**
   * Add a new payment method
   */
  static async addPaymentMethod(
    userId: string,
    providerId: string,
    methodType: PaymentMethod['method_type'],
    providerMethodId?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; paymentMethodId?: string }> {
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
    } catch (error) {
      console.error('Error in addPaymentMethod:', error);
      return { success: false };
    }
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<boolean> {
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
    } catch (error) {
      console.error('Error in setDefaultPaymentMethod:', error);
      return false;
    }
  }

  /**
   * Create a payment transaction
   */
  static async createPayment(
    userId: string,
    orderId: string,
    providerId: string,
    paymentMethodId: string,
    amount: number,
    currencyCode: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; transactionId?: string; paymentUrl?: string }> {
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
      const paymentResult = await this.processPaymentWithProvider(
        providerId,
        transactionId,
        amount,
        currencyCode,
        paymentMethodId,
        metadata
      );

      return {
        success: paymentResult.success,
        transactionId,
        paymentUrl: paymentResult.paymentUrl,
      };
    } catch (error) {
      console.error('Error in createPayment:', error);
      return { success: false };
    }
  }

  /**
   * Process payment with specific provider
   */
  private static async processPaymentWithProvider(
    providerId: string,
    transactionId: string,
    amount: number,
    currencyCode: string,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; paymentUrl?: string }> {
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
    } catch (error) {
      console.error('Error processing payment with provider:', error);
      return { success: false };
    }
  }

  /**
   * Process YooMoney payment
   */
  private static async processYooMoneyPayment(
    provider: PaymentProvider,
    transactionId: string,
    amount: number,
    currencyCode: string,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; paymentUrl?: string }> {
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
    } catch (error) {
      console.error('Error processing YooMoney payment:', error);
      return { success: false };
    }
  }

  /**
   * Process Stripe payment
   */
  private static async processStripePayment(
    provider: PaymentProvider,
    transactionId: string,
    amount: number,
    currencyCode: string,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; paymentUrl?: string }> {
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
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      return { success: false };
    }
  }

  /**
   * Process cash payment
   */
  private static async processCashPayment(
    provider: PaymentProvider,
    transactionId: string,
    amount: number,
    currencyCode: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; paymentUrl?: string }> {
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
    } catch (error) {
      console.error('Error processing cash payment:', error);
      return { success: false };
    }
  }

  /**
   * Process bank transfer payment
   */
  private static async processBankTransferPayment(
    provider: PaymentProvider,
    transactionId: string,
    amount: number,
    currencyCode: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; paymentUrl?: string }> {
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
    } catch (error) {
      console.error('Error processing bank transfer payment:', error);
      return { success: false };
    }
  }

  /**
   * Get payment transaction status
   */
  static async getTransactionStatus(transactionId: string): Promise<PaymentTransaction | null> {
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
    } catch (error) {
      console.error('Error in getTransactionStatus:', error);
      return null;
    }
  }

  /**
   * Get user's payment transactions
   */
  static async getUserTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PaymentTransaction[]> {
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
    } catch (error) {
      console.error('Error in getUserTransactions:', error);
      return [];
    }
  }

  /**
   * Create escrow account
   */
  static async createEscrowAccount(
    orderId: string,
    buyerId: string,
    sellerId: string,
    amount: number,
    currencyCode: string,
    releaseConditions?: Record<string, any>
  ): Promise<{ success: boolean; escrowAccountId?: string }> {
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
    } catch (error) {
      console.error('Error in createEscrowAccount:', error);
      return { success: false };
    }
  }

  /**
   * Release escrow funds
   */
  static async releaseEscrowFunds(
    escrowAccountId: string,
    releasedBy: string
  ): Promise<boolean> {
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
    } catch (error) {
      console.error('Error in releaseEscrowFunds:', error);
      return false;
    }
  }

  /**
   * Get exchange rate
   */
  static async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    date?: Date
  ): Promise<number | null> {
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
    } catch (error) {
      console.error('Error in getExchangeRate:', error);
      return null;
    }
  }

  /**
   * Convert currency amount
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ success: boolean; convertedAmount?: number; rate?: number }> {
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
    } catch (error) {
      console.error('Error in convertCurrency:', error);
      return { success: false };
    }
  }

  /**
   * Process payment webhook
   */
  static async processWebhook(
    providerId: string,
    webhookId: string,
    eventType: string,
    payload: Record<string, any>,
    signature?: string
  ): Promise<{ success: boolean; webhookId?: string }> {
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
    } catch (error) {
      console.error('Error in processWebhook:', error);
      return { success: false };
    }
  }
}
