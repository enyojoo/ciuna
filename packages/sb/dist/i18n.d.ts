export interface Language {
    id: number;
    code: string;
    name: string;
    native_name: string;
    rtl: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface Translation {
    id: string;
    key: string;
    language_code: string;
    namespace: string;
    value: string;
    context?: string;
    created_at: string;
    updated_at: string;
}
export interface LocalizedContent {
    id: string;
    content_type: string;
    content_id: string;
    language_code: string;
    field_name: string;
    field_value: string;
    created_at: string;
    updated_at: string;
}
export interface UserPreferences {
    preferred_language: string;
    timezone: string;
    date_format: string;
    time_format: string;
    currency_code: string;
}
export declare class I18nService {
    private static translationsCache;
    private static languagesCache;
    /**
     * Get all supported languages
     */
    static getLanguages(): Promise<Language[]>;
    /**
     * Get translations for a specific language and namespace
     */
    static getTranslations(languageCode: string, namespace?: string): Promise<Map<string, string>>;
    /**
     * Get a single translation
     */
    static getTranslation(key: string, languageCode?: string, namespace?: string): Promise<string>;
    /**
     * Get localized content for a specific item
     */
    static getLocalizedContent(contentType: string, contentId: string, languageCode: string, fieldName: string): Promise<string | null>;
    /**
     * Set localized content for a specific item
     */
    static setLocalizedContent(contentType: string, contentId: string, languageCode: string, fieldName: string, fieldValue: string): Promise<string | null>;
    /**
     * Get user language preferences
     */
    static getUserPreferences(userId: string): Promise<UserPreferences | null>;
    /**
     * Update user language preferences
     */
    static updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean>;
    /**
     * Clear translation cache
     */
    static clearCache(): void;
    /**
     * Format date according to user preferences
     */
    static formatDate(date: Date | string, languageCode?: string, timezone?: string): string;
    /**
     * Format time according to user preferences
     */
    static formatTime(date: Date | string, languageCode?: string, timezone?: string, format?: '12h' | '24h'): string;
    /**
     * Format currency according to user preferences
     */
    static formatCurrency(amount: number, currencyCode?: string, languageCode?: string): string;
    /**
     * Format number according to locale
     */
    static formatNumber(number: number, languageCode?: string, options?: Intl.NumberFormatOptions): string;
    /**
     * Get relative time (e.g., "2 hours ago")
     */
    static formatRelativeTime(date: Date | string, languageCode?: string, timezone?: string): string;
}
export declare const t: (key: string, languageCode?: string, namespace?: string) => Promise<string>;
export declare const formatPrice: (amount: number, currencyCode?: string, languageCode?: string) => string;
export declare const formatDate: (date: Date | string, languageCode?: string, timezone?: string) => string;
export declare const formatTime: (date: Date | string, languageCode?: string, timezone?: string, format?: "12h" | "24h") => string;
export declare const formatRelativeTime: (date: Date | string, languageCode?: string, timezone?: string) => string;
//# sourceMappingURL=i18n.d.ts.map