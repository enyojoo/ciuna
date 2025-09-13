-- Enhanced Security & Compliance system
-- This migration creates tables for 2FA, KYC, compliance, and advanced security features

-- Create 2FA settings table
CREATE TABLE two_factor_auth (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('SMS', 'TOTP', 'EMAIL')),
    secret TEXT, -- For TOTP
    phone_number TEXT, -- For SMS
    email TEXT, -- For email backup
    is_enabled BOOLEAN DEFAULT FALSE,
    backup_codes TEXT[], -- Recovery codes
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, method)
);

-- Create 2FA verification attempts table
CREATE TABLE two_factor_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    method TEXT NOT NULL,
    code TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create KYC verification table
CREATE TABLE kyc_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED')),
    verification_type TEXT NOT NULL CHECK (verification_type IN ('IDENTITY', 'ADDRESS', 'DOCUMENT', 'SELFIE')),
    document_type TEXT, -- 'PASSPORT', 'DRIVER_LICENSE', 'NATIONAL_ID', 'UTILITY_BILL'
    document_number TEXT,
    document_front_url TEXT,
    document_back_url TEXT,
    selfie_url TEXT,
    address_proof_url TEXT,
    verification_data JSONB DEFAULT '{}',
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security events table for audit logging
CREATE TABLE security_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'EMAIL_CHANGE',
        '2FA_ENABLED', '2FA_DISABLED', '2FA_FAILED', 'KYC_SUBMITTED', 'KYC_APPROVED',
        'KYC_REJECTED', 'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED',
        'API_KEY_CREATED', 'API_KEY_REVOKED', 'DATA_EXPORT', 'DATA_DELETION'
    )),
    severity TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create API keys table for programmatic access
CREATE TABLE api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    permissions TEXT[] DEFAULT '{}',
    last_used TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rate limiting table
CREATE TABLE rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identifier TEXT NOT NULL, -- IP address, user ID, or API key
    action TEXT NOT NULL, -- 'LOGIN', 'API_CALL', 'PASSWORD_RESET', etc.
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier, action, window_start)
);

-- Create fraud detection table
CREATE TABLE fraud_indicators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    indicator_type TEXT NOT NULL CHECK (indicator_type IN (
        'SUSPICIOUS_IP', 'RAPID_REQUESTS', 'UNUSUAL_LOCATION', 'MULTIPLE_ACCOUNTS',
        'HIGH_VALUE_TRANSACTION', 'CHARGEBACK', 'DISPUTE', 'ACCOUNT_TAKEOVER'
    )),
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create data privacy requests table (GDPR compliance)
CREATE TABLE privacy_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('DATA_EXPORT', 'DATA_DELETION', 'DATA_RECTIFICATION', 'CONSENT_WITHDRAWAL')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')),
    description TEXT,
    requested_data JSONB DEFAULT '{}',
    processed_data JSONB DEFAULT '{}',
    verification_token TEXT,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consent management table
CREATE TABLE user_consents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'MARKETING_EMAILS', 'ANALYTICS_TRACKING', 'COOKIES', 'DATA_PROCESSING',
        'THIRD_PARTY_SHARING', 'PROFILING', 'AUTOMATED_DECISIONS'
    )),
    granted BOOLEAN NOT NULL,
    consent_text TEXT,
    version TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Add security fields to profiles table
ALTER TABLE profiles ADD COLUMN security_level TEXT DEFAULT 'STANDARD' CHECK (security_level IN ('BASIC', 'STANDARD', 'HIGH', 'MAXIMUM'));
ALTER TABLE profiles ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN locked_until TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN last_login_ip INET;
ALTER TABLE profiles ADD COLUMN password_changed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN email_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN phone_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN kyc_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100);

-- Create indexes for performance
CREATE INDEX idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX idx_two_factor_auth_method ON two_factor_auth(method);
CREATE INDEX idx_two_factor_attempts_user_id ON two_factor_attempts(user_id);
CREATE INDEX idx_two_factor_attempts_created_at ON two_factor_attempts(created_at);

CREATE INDEX idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX idx_kyc_verifications_type ON kyc_verifications(verification_type);

CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX idx_rate_limits_action ON rate_limits(action);
CREATE INDEX idx_rate_limits_expires_at ON rate_limits(expires_at);

CREATE INDEX idx_fraud_indicators_user_id ON fraud_indicators(user_id);
CREATE INDEX idx_fraud_indicators_type ON fraud_indicators(indicator_type);
CREATE INDEX idx_fraud_indicators_resolved ON fraud_indicators(is_resolved);

CREATE INDEX idx_privacy_requests_user_id ON privacy_requests(user_id);
CREATE INDEX idx_privacy_requests_type ON privacy_requests(request_type);
CREATE INDEX idx_privacy_requests_status ON privacy_requests(status);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX idx_user_consents_granted ON user_consents(granted);

-- Add triggers for updated_at columns
CREATE TRIGGER update_two_factor_auth_updated_at 
    BEFORE UPDATE ON two_factor_auth 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at 
    BEFORE UPDATE ON kyc_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_requests_updated_at 
    BEFORE UPDATE ON privacy_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- 2FA: Users can only access their own data
CREATE POLICY "Users can access their own 2FA settings" ON two_factor_auth
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own 2FA attempts" ON two_factor_attempts
    FOR ALL USING (auth.uid() = user_id);

-- KYC: Users can view their own, admins can manage all
CREATE POLICY "Users can view their own KYC data" ON kyc_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC data" ON kyc_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all KYC data" ON kyc_verifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Security events: Users can view their own, admins can view all
CREATE POLICY "Users can view their own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all security events" ON security_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- API keys: Users can manage their own
CREATE POLICY "Users can manage their own API keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Rate limits: System only
CREATE POLICY "System can manage rate limits" ON rate_limits
    FOR ALL USING (true);

-- Fraud indicators: Admins only
CREATE POLICY "Only admins can access fraud indicators" ON fraud_indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Privacy requests: Users can manage their own
CREATE POLICY "Users can manage their own privacy requests" ON privacy_requests
    FOR ALL USING (auth.uid() = user_id);

-- User consents: Users can manage their own
CREATE POLICY "Users can manage their own consents" ON user_consents
    FOR ALL USING (auth.uid() = user_id);

-- Create security functions
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INTEGER DEFAULT 10,
    p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Get current count for this identifier and action
    SELECT COALESCE(SUM(count), 0) INTO current_count
    FROM rate_limits
    WHERE identifier = p_identifier 
    AND action = p_action
    AND window_start >= window_start;
    
    -- Check if limit exceeded
    IF current_count >= p_max_attempts THEN
        RETURN FALSE;
    END IF;
    
    -- Increment counter
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, NOW())
    ON CONFLICT (identifier, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_severity TEXT DEFAULT 'INFO',
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_location_data JSONB DEFAULT '{}',
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_events (
        user_id, event_type, severity, description, ip_address, 
        user_agent, location_data, metadata
    ) VALUES (
        p_user_id, p_event_type, p_severity, p_description, p_ip_address,
        p_user_agent, p_location_data, p_metadata
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_account_lockout(
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    locked_until TIMESTAMPTZ;
    failed_attempts INTEGER;
BEGIN
    SELECT locked_until, failed_login_attempts 
    INTO locked_until, failed_attempts
    FROM profiles 
    WHERE id = p_user_id;
    
    -- Check if account is locked
    IF locked_until IS NOT NULL AND locked_until > NOW() THEN
        RETURN TRUE;
    END IF;
    
    -- Check if too many failed attempts
    IF failed_attempts >= 5 THEN
        -- Lock account for 30 minutes
        UPDATE profiles 
        SET locked_until = NOW() + INTERVAL '30 minutes'
        WHERE id = p_user_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_api_key(
    p_user_id UUID,
    p_name TEXT,
    p_permissions TEXT[] DEFAULT '{}',
    p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    api_key TEXT;
    key_hash TEXT;
    key_id UUID;
BEGIN
    -- Generate a secure API key
    api_key := 'ciuna_' || encode(gen_random_bytes(32), 'base64');
    key_hash := encode(digest(api_key, 'sha256'), 'hex');
    
    -- Store the key
    INSERT INTO api_keys (user_id, name, key_hash, permissions, expires_at)
    VALUES (p_user_id, p_name, key_hash, p_permissions, p_expires_at)
    RETURNING id INTO key_id;
    
    RETURN api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
