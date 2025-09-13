-- Payment Integration System
-- This migration creates tables for YooMoney, Stripe, and cash payment processing

-- Create payment providers table
CREATE TABLE IF NOT EXISTS payment_providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('YOOMONEY', 'STRIPE', 'CASH', 'BANK_TRANSFER')),
    is_active BOOLEAN DEFAULT TRUE,
    supported_currencies TEXT[] DEFAULT '{}',
    supported_countries TEXT[] DEFAULT '{}',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES payment_providers(id) ON DELETE CASCADE NOT NULL,
    method_type TEXT NOT NULL CHECK (method_type IN ('CARD', 'BANK_ACCOUNT', 'WALLET', 'CASH', 'CRYPTO')),
    provider_method_id TEXT, -- External provider's method ID
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES payment_providers(id) ON DELETE CASCADE NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PAYMENT', 'REFUND', 'CHARGEBACK', 'DISPUTE', 'TRANSFER')),
    amount INTEGER NOT NULL, -- Amount in smallest currency unit (cents)
    currency_code TEXT NOT NULL,
    exchange_rate NUMERIC(10, 6),
    amount_original INTEGER, -- Original amount in original currency
    currency_original TEXT, -- Original currency
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 
        'REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED', 'CHARGEBACK'
    )),
    provider_transaction_id TEXT, -- External provider's transaction ID
    provider_response JSONB DEFAULT '{}',
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create escrow accounts table
CREATE TABLE escrow_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    currency_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'FUNDED', 'RELEASED', 'REFUNDED', 'DISPUTED'
    )),
    release_conditions JSONB DEFAULT '{}',
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment webhooks table
CREATE TABLE payment_webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID REFERENCES payment_providers(id) ON DELETE CASCADE NOT NULL,
    webhook_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature TEXT,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment disputes table
CREATE TABLE payment_disputes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE NOT NULL,
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('CHARGEBACK', 'DISPUTE', 'FRAUD', 'UNAUTHORIZED')),
    reason TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'CLOSED')),
    evidence JSONB DEFAULT '{}',
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange rates table already exists from multi-currency support migration
-- No need to recreate it

-- Add payment-related fields to orders table
ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN (
    'PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED'
));
ALTER TABLE orders ADD COLUMN payment_method_id UUID REFERENCES payment_methods(id);
ALTER TABLE orders ADD COLUMN escrow_account_id UUID REFERENCES escrow_accounts(id);
ALTER TABLE orders ADD COLUMN payment_deadline TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX idx_payment_providers_type ON payment_providers(provider_type);
CREATE INDEX idx_payment_providers_active ON payment_providers(is_active);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_provider_id ON payment_methods(provider_id);
CREATE INDEX idx_payment_methods_verified ON payment_methods(is_verified);

CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_provider_id ON payment_transactions(provider_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX idx_payment_transactions_provider_tx_id ON payment_transactions(provider_transaction_id);

CREATE INDEX idx_escrow_accounts_order_id ON escrow_accounts(order_id);
CREATE INDEX idx_escrow_accounts_buyer_id ON escrow_accounts(buyer_id);
CREATE INDEX idx_escrow_accounts_seller_id ON escrow_accounts(seller_id);
CREATE INDEX idx_escrow_accounts_status ON escrow_accounts(status);

CREATE INDEX idx_payment_webhooks_provider_id ON payment_webhooks(provider_id);
CREATE INDEX idx_payment_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX idx_payment_webhooks_created_at ON payment_webhooks(created_at);

CREATE INDEX idx_payment_disputes_transaction_id ON payment_disputes(transaction_id);
CREATE INDEX idx_payment_disputes_status ON payment_disputes(status);

-- Exchange rates indexes already created in multi-currency migration

-- Add triggers for updated_at columns
CREATE TRIGGER update_payment_providers_updated_at 
    BEFORE UPDATE ON payment_providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_accounts_updated_at 
    BEFORE UPDATE ON escrow_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_disputes_updated_at 
    BEFORE UPDATE ON payment_disputes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert payment providers
INSERT INTO payment_providers (name, display_name, provider_type, supported_currencies, supported_countries, config) VALUES
('yoomoney', 'YooMoney', 'YOOMONEY', ARRAY['RUB'], ARRAY['RU'], '{"api_url": "https://yoomoney.ru/api", "test_mode": true}'),
('stripe', 'Stripe', 'STRIPE', ARRAY['USD', 'EUR', 'GBP', 'RUB'], ARRAY['US', 'EU', 'GB', 'RU'], '{"api_url": "https://api.stripe.com", "test_mode": true}'),
('cash', 'Cash Payment', 'CASH', ARRAY['RUB', 'USD', 'EUR'], ARRAY['RU', 'US', 'EU'], '{"requires_verification": true}'),
('bank_transfer', 'Bank Transfer', 'BANK_TRANSFER', ARRAY['RUB', 'USD', 'EUR'], ARRAY['RU', 'US', 'EU'], '{"requires_verification": true}');

-- Create RLS policies
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;
-- Exchange rates RLS already enabled in multi-currency migration

-- Payment providers: public read access
CREATE POLICY "Payment providers are publicly readable" ON payment_providers
    FOR SELECT USING (is_active = true);

-- Payment methods: users can manage their own
CREATE POLICY "Users can manage their own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- Payment transactions: users can view their own, admins can view all
CREATE POLICY "Users can view their own transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON payment_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Escrow accounts: participants can view their own
CREATE POLICY "Escrow participants can view their accounts" ON escrow_accounts
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Payment webhooks: system only
CREATE POLICY "System can manage webhooks" ON payment_webhooks
    FOR ALL USING (true);

-- Payment disputes: users can view their own, admins can manage all
CREATE POLICY "Users can view their own disputes" ON payment_disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payment_transactions 
            WHERE payment_transactions.id = payment_disputes.transaction_id 
            AND payment_transactions.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all disputes" ON payment_disputes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Exchange rates RLS policy already exists in multi-currency migration

-- Create payment functions
CREATE OR REPLACE FUNCTION create_payment_transaction(
    p_user_id UUID,
    p_order_id UUID,
    p_provider_id UUID,
    p_payment_method_id UUID,
    p_amount INTEGER,
    p_currency_code TEXT,
    p_transaction_type TEXT DEFAULT 'PAYMENT',
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
    provider_config JSONB;
BEGIN
    -- Get provider configuration
    SELECT config INTO provider_config
    FROM payment_providers
    WHERE id = p_provider_id AND is_active = true;
    
    IF provider_config IS NULL THEN
        RAISE EXCEPTION 'Invalid or inactive payment provider';
    END IF;
    
    -- Create transaction
    INSERT INTO payment_transactions (
        user_id, order_id, provider_id, payment_method_id,
        amount, currency_code, transaction_type, metadata
    ) VALUES (
        p_user_id, p_order_id, p_provider_id, p_payment_method_id,
        p_amount, p_currency_code, p_transaction_type, p_metadata
    ) RETURNING id INTO transaction_id;
    
    -- Update order payment status
    UPDATE orders 
    SET payment_status = 'PENDING'
    WHERE id = p_order_id;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION process_payment_webhook(
    p_provider_id UUID,
    p_webhook_id TEXT,
    p_event_type TEXT,
    p_payload JSONB,
    p_signature TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    webhook_id UUID;
BEGIN
    -- Store webhook
    INSERT INTO payment_webhooks (
        provider_id, webhook_id, event_type, payload, signature
    ) VALUES (
        p_provider_id, p_webhook_id, p_event_type, p_payload, p_signature
    ) RETURNING id INTO webhook_id;
    
    -- Process webhook based on event type
    -- This would contain provider-specific logic
    -- For now, just mark as processed
    UPDATE payment_webhooks 
    SET processed = true, processed_at = NOW()
    WHERE id = webhook_id;
    
    RETURN webhook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exchange rate function already exists from multi-currency support migration
-- The existing function handles TEXT to currency_code conversion automatically
