export interface TwoFactorAuth {
    id: string;
    user_id: string;
    method: 'SMS' | 'TOTP' | 'EMAIL';
    secret?: string;
    phone_number?: string;
    email?: string;
    is_enabled: boolean;
    backup_codes?: string[];
    last_used?: string;
    created_at: string;
    updated_at: string;
}
export interface KYCVerification {
    id: string;
    user_id: string;
    status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    verification_type: 'IDENTITY' | 'ADDRESS' | 'DOCUMENT' | 'SELFIE';
    document_type?: string;
    document_number?: string;
    document_front_url?: string;
    document_back_url?: string;
    selfie_url?: string;
    address_proof_url?: string;
    verification_data: Record<string, any>;
    rejection_reason?: string;
    verified_at?: string;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}
export interface SecurityEvent {
    id: string;
    user_id?: string;
    event_type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    ip_address?: string;
    user_agent?: string;
    location_data: Record<string, any>;
    metadata: Record<string, any>;
    created_at: string;
}
export interface APIKey {
    id: string;
    user_id: string;
    name: string;
    key_hash: string;
    permissions: string[];
    last_used?: string;
    expires_at?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface PrivacyRequest {
    id: string;
    user_id: string;
    request_type: 'DATA_EXPORT' | 'DATA_DELETION' | 'DATA_RECTIFICATION' | 'CONSENT_WITHDRAWAL';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    description?: string;
    requested_data: Record<string, any>;
    processed_data?: Record<string, any>;
    verification_token?: string;
    completed_at?: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
}
export interface UserConsent {
    id: string;
    user_id: string;
    consent_type: string;
    granted: boolean;
    consent_text?: string;
    version: string;
    ip_address?: string;
    user_agent?: string;
    granted_at: string;
    withdrawn_at?: string;
    expires_at?: string;
}
export declare class SecurityService {
    /**
     * Enable 2FA for a user
     */
    static enable2FA(userId: string, method: 'SMS' | 'TOTP' | 'EMAIL', secret?: string, phoneNumber?: string, email?: string): Promise<{
        success: boolean;
        backupCodes?: string[];
        qrCode?: string;
    }>;
    /**
     * Verify 2FA code
     */
    static verify2FA(userId: string, code: string, method: 'SMS' | 'TOTP' | 'EMAIL' | 'BACKUP'): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Disable 2FA for a user
     */
    static disable2FA(userId: string, method: 'SMS' | 'TOTP' | 'EMAIL'): Promise<boolean>;
    /**
     * Get user's 2FA settings
     */
    static get2FASettings(userId: string): Promise<TwoFactorAuth[]>;
    /**
     * Submit KYC verification
     */
    static submitKYC(userId: string, verificationType: 'IDENTITY' | 'ADDRESS' | 'DOCUMENT' | 'SELFIE', documentType?: string, documentNumber?: string, documentFrontUrl?: string, documentBackUrl?: string, selfieUrl?: string, addressProofUrl?: string, verificationData?: Record<string, any>): Promise<{
        success: boolean;
        verificationId?: string;
    }>;
    /**
     * Get user's KYC status
     */
    static getKYCStatus(userId: string): Promise<KYCVerification[]>;
    /**
     * Log security event
     */
    static logSecurityEvent(userId: string | null, eventType: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', description: string, ipAddress?: string, userAgent?: string, locationData?: Record<string, any>, metadata?: Record<string, any>): Promise<string | null>;
    /**
     * Check rate limit
     */
    static checkRateLimit(identifier: string, action: string, maxAttempts?: number, windowMinutes?: number): Promise<boolean>;
    /**
     * Check account lockout
     */
    static checkAccountLockout(userId: string): Promise<boolean>;
    /**
     * Generate API key
     */
    static generateAPIKey(userId: string, name: string, permissions?: string[], expiresAt?: Date): Promise<{
        success: boolean;
        apiKey?: string;
    }>;
    /**
     * Get user's API keys
     */
    static getAPIKeys(userId: string): Promise<APIKey[]>;
    /**
     * Revoke API key
     */
    static revokeAPIKey(userId: string, keyId: string): Promise<boolean>;
    /**
     * Submit privacy request (GDPR)
     */
    static submitPrivacyRequest(userId: string, requestType: 'DATA_EXPORT' | 'DATA_DELETION' | 'DATA_RECTIFICATION' | 'CONSENT_WITHDRAWAL', description?: string, requestedData?: Record<string, any>): Promise<{
        success: boolean;
        requestId?: string;
        verificationToken?: string;
    }>;
    /**
     * Get user's privacy requests
     */
    static getPrivacyRequests(userId: string): Promise<PrivacyRequest[]>;
    /**
     * Update user consent
     */
    static updateConsent(userId: string, consentType: string, granted: boolean, consentText?: string, version?: string, ipAddress?: string, userAgent?: string): Promise<boolean>;
    /**
     * Get user's consents
     */
    static getConsents(userId: string): Promise<UserConsent[]>;
    private static generateBackupCodes;
    private static generateTOTPQRCode;
    private static verify2FACode;
    private static generateVerificationToken;
}
//# sourceMappingURL=security.d.ts.map