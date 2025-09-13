import { supabase } from './client';
export class SecurityService {
    /**
     * Enable 2FA for a user
     */
    static async enable2FA(userId, method, secret, phoneNumber, email) {
        try {
            // Generate backup codes
            const backupCodes = this.generateBackupCodes();
            // For TOTP, generate QR code
            let qrCode;
            if (method === 'TOTP' && secret) {
                qrCode = this.generateTOTPQRCode(userId, secret);
            }
            const { data, error } = await supabase
                .from('two_factor_auth')
                .upsert({
                user_id: userId,
                method,
                secret: secret || null,
                phone_number: phoneNumber || null,
                email: email || null,
                is_enabled: true,
                backup_codes: backupCodes,
            }, { onConflict: 'user_id,method' })
                .select()
                .single();
            if (error) {
                console.error('Error enabling 2FA:', error);
                return { success: false };
            }
            // Log security event
            await this.logSecurityEvent(userId, '2FA_ENABLED', 'MEDIUM', `2FA enabled via ${method}`);
            return { success: true, backupCodes, qrCode };
        }
        catch (error) {
            console.error('Error in enable2FA:', error);
            return { success: false };
        }
    }
    /**
     * Verify 2FA code
     */
    static async verify2FA(userId, code, method) {
        try {
            // Check rate limiting
            const rateLimitOk = await this.checkRateLimit(userId, '2FA_VERIFICATION', 5, 15);
            if (!rateLimitOk) {
                return { success: false, message: 'Too many verification attempts. Please try again later.' };
            }
            // Check account lockout
            const isLocked = await this.checkAccountLockout(userId);
            if (isLocked) {
                return { success: false, message: 'Account is temporarily locked due to too many failed attempts.' };
            }
            let isValid = false;
            if (method === 'BACKUP') {
                // Verify backup code
                const { data: twoFactorData } = await supabase
                    .from('two_factor_auth')
                    .select('backup_codes')
                    .eq('user_id', userId)
                    .eq('is_enabled', true)
                    .single();
                if (twoFactorData?.backup_codes?.includes(code)) {
                    isValid = true;
                    // Remove used backup code
                    const updatedCodes = twoFactorData.backup_codes.filter((c) => c !== code);
                    await supabase
                        .from('two_factor_auth')
                        .update({ backup_codes: updatedCodes })
                        .eq('user_id', userId);
                }
            }
            else {
                // For TOTP, SMS, EMAIL - implement verification logic
                // This would integrate with actual 2FA providers
                isValid = await this.verify2FACode(userId, code, method);
            }
            // Log attempt
            await supabase
                .from('two_factor_attempts')
                .insert({
                user_id: userId,
                method,
                code: code.substring(0, 2) + '***', // Partial code for logging
                success: isValid,
            });
            if (isValid) {
                // Update last used timestamp
                await supabase
                    .from('two_factor_auth')
                    .update({ last_used: new Date().toISOString() })
                    .eq('user_id', userId)
                    .eq('method', method);
                // Reset failed login attempts
                await supabase
                    .from('profiles')
                    .update({ failed_login_attempts: 0, locked_until: null })
                    .eq('id', userId);
                await this.logSecurityEvent(userId, '2FA_SUCCESS', 'LOW', '2FA verification successful');
                return { success: true };
            }
            else {
                // Increment failed attempts
                await supabase.rpc('increment_failed_attempts', { p_user_id: userId });
                await this.logSecurityEvent(userId, '2FA_FAILED', 'MEDIUM', '2FA verification failed');
                return { success: false, message: 'Invalid verification code.' };
            }
        }
        catch (error) {
            console.error('Error in verify2FA:', error);
            return { success: false, message: 'Verification failed. Please try again.' };
        }
    }
    /**
     * Disable 2FA for a user
     */
    static async disable2FA(userId, method) {
        try {
            const { error } = await supabase
                .from('two_factor_auth')
                .update({ is_enabled: false })
                .eq('user_id', userId)
                .eq('method', method);
            if (error) {
                console.error('Error disabling 2FA:', error);
                return false;
            }
            await this.logSecurityEvent(userId, '2FA_DISABLED', 'MEDIUM', `2FA disabled for ${method}`);
            return true;
        }
        catch (error) {
            console.error('Error in disable2FA:', error);
            return false;
        }
    }
    /**
     * Get user's 2FA settings
     */
    static async get2FASettings(userId) {
        try {
            const { data, error } = await supabase
                .from('two_factor_auth')
                .select('*')
                .eq('user_id', userId);
            if (error) {
                console.error('Error getting 2FA settings:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in get2FASettings:', error);
            return [];
        }
    }
    /**
     * Submit KYC verification
     */
    static async submitKYC(userId, verificationType, documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl, addressProofUrl, verificationData) {
        try {
            const { data, error } = await supabase
                .from('kyc_verifications')
                .insert({
                user_id: userId,
                verification_type: verificationType,
                document_type: documentType,
                document_number: documentNumber,
                document_front_url: documentFrontUrl,
                document_back_url: documentBackUrl,
                selfie_url: selfieUrl,
                address_proof_url: addressProofUrl,
                verification_data: verificationData || {},
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            })
                .select('id')
                .single();
            if (error) {
                console.error('Error submitting KYC:', error);
                return { success: false };
            }
            await this.logSecurityEvent(userId, 'KYC_SUBMITTED', 'MEDIUM', `KYC ${verificationType} submitted`);
            return { success: true, verificationId: data.id };
        }
        catch (error) {
            console.error('Error in submitKYC:', error);
            return { success: false };
        }
    }
    /**
     * Get user's KYC status
     */
    static async getKYCStatus(userId) {
        try {
            const { data, error } = await supabase
                .from('kyc_verifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error getting KYC status:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in getKYCStatus:', error);
            return [];
        }
    }
    /**
     * Log security event
     */
    static async logSecurityEvent(userId, eventType, severity = 'LOW', description, ipAddress, userAgent, locationData, metadata) {
        try {
            const { data, error } = await supabase.rpc('log_security_event', {
                p_user_id: userId,
                p_event_type: eventType,
                p_severity: severity,
                p_description: description,
                p_ip_address: ipAddress || null,
                p_user_agent: userAgent || null,
                p_location_data: locationData || {},
                p_metadata: metadata || {},
            });
            if (error) {
                console.error('Error logging security event:', error);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Error in logSecurityEvent:', error);
            return null;
        }
    }
    /**
     * Check rate limit
     */
    static async checkRateLimit(identifier, action, maxAttempts = 10, windowMinutes = 60) {
        try {
            const { data, error } = await supabase.rpc('check_rate_limit', {
                p_identifier: identifier,
                p_action: action,
                p_max_attempts: maxAttempts,
                p_window_minutes: windowMinutes,
            });
            if (error) {
                console.error('Error checking rate limit:', error);
                return false;
            }
            return data;
        }
        catch (error) {
            console.error('Error in checkRateLimit:', error);
            return false;
        }
    }
    /**
     * Check account lockout
     */
    static async checkAccountLockout(userId) {
        try {
            const { data, error } = await supabase.rpc('check_account_lockout', {
                p_user_id: userId,
            });
            if (error) {
                console.error('Error checking account lockout:', error);
                return false;
            }
            return data;
        }
        catch (error) {
            console.error('Error in checkAccountLockout:', error);
            return false;
        }
    }
    /**
     * Generate API key
     */
    static async generateAPIKey(userId, name, permissions = [], expiresAt) {
        try {
            const { data, error } = await supabase.rpc('generate_api_key', {
                p_user_id: userId,
                p_name: name,
                p_permissions: permissions,
                p_expires_at: expiresAt?.toISOString() || null,
            });
            if (error) {
                console.error('Error generating API key:', error);
                return { success: false };
            }
            await this.logSecurityEvent(userId, 'API_KEY_CREATED', 'MEDIUM', `API key created: ${name}`);
            return { success: true, apiKey: data };
        }
        catch (error) {
            console.error('Error in generateAPIKey:', error);
            return { success: false };
        }
    }
    /**
     * Get user's API keys
     */
    static async getAPIKeys(userId) {
        try {
            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error getting API keys:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in getAPIKeys:', error);
            return [];
        }
    }
    /**
     * Revoke API key
     */
    static async revokeAPIKey(userId, keyId) {
        try {
            const { error } = await supabase
                .from('api_keys')
                .update({ is_active: false })
                .eq('id', keyId)
                .eq('user_id', userId);
            if (error) {
                console.error('Error revoking API key:', error);
                return false;
            }
            await this.logSecurityEvent(userId, 'API_KEY_REVOKED', 'MEDIUM', `API key revoked: ${keyId}`);
            return true;
        }
        catch (error) {
            console.error('Error in revokeAPIKey:', error);
            return false;
        }
    }
    /**
     * Submit privacy request (GDPR)
     */
    static async submitPrivacyRequest(userId, requestType, description, requestedData) {
        try {
            const verificationToken = this.generateVerificationToken();
            const { data, error } = await supabase
                .from('privacy_requests')
                .insert({
                user_id: userId,
                request_type: requestType,
                description,
                requested_data: requestedData || {},
                verification_token: verificationToken,
            })
                .select('id')
                .single();
            if (error) {
                console.error('Error submitting privacy request:', error);
                return { success: false };
            }
            await this.logSecurityEvent(userId, requestType, 'MEDIUM', `Privacy request submitted: ${requestType}`);
            return { success: true, requestId: data.id, verificationToken };
        }
        catch (error) {
            console.error('Error in submitPrivacyRequest:', error);
            return { success: false };
        }
    }
    /**
     * Get user's privacy requests
     */
    static async getPrivacyRequests(userId) {
        try {
            const { data, error } = await supabase
                .from('privacy_requests')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error getting privacy requests:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in getPrivacyRequests:', error);
            return [];
        }
    }
    /**
     * Update user consent
     */
    static async updateConsent(userId, consentType, granted, consentText, version = '1.0', ipAddress, userAgent) {
        try {
            const { error } = await supabase
                .from('user_consents')
                .insert({
                user_id: userId,
                consent_type: consentType,
                granted,
                consent_text: consentText,
                version,
                ip_address: ipAddress || null,
                user_agent: userAgent || null,
                granted_at: granted ? new Date().toISOString() : null,
                withdrawn_at: !granted ? new Date().toISOString() : null,
            });
            if (error) {
                console.error('Error updating consent:', error);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error in updateConsent:', error);
            return false;
        }
    }
    /**
     * Get user's consents
     */
    static async getConsents(userId) {
        try {
            const { data, error } = await supabase
                .from('user_consents')
                .select('*')
                .eq('user_id', userId)
                .order('granted_at', { ascending: false });
            if (error) {
                console.error('Error getting consents:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error in getConsents:', error);
            return [];
        }
    }
    // Helper methods
    static generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
        }
        return codes;
    }
    static generateTOTPQRCode(userId, secret) {
        // This would generate a QR code for TOTP setup
        // For now, return a placeholder
        return `otpauth://totp/Ciuna:${userId}?secret=${secret}&issuer=Ciuna`;
    }
    static async verify2FACode(userId, code, method) {
        // This would integrate with actual 2FA providers
        // For now, return a mock verification
        return code.length === 6 && /^\d+$/.test(code);
    }
    static generateVerificationToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
//# sourceMappingURL=security.js.map