import { createClient } from './client';

const supabase = createClient();

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

export class I18nService {
  private static translationsCache: Map<string, Map<string, string>> = new Map();
  private static languagesCache: Language[] | null = null;

  /**
   * Get all supported languages
   */
  static async getLanguages(): Promise<Language[]> {
    if (this.languagesCache) {
      return this.languagesCache;
    }

    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching languages:', error);
        return [];
      }

      this.languagesCache = data || [];
      return this.languagesCache;
    } catch (error) {
      console.error('Error in getLanguages:', error);
      return [];
    }
  }

  /**
   * Get translations for a specific language and namespace
   */
  static async getTranslations(
    languageCode: string,
    namespace: string = 'common'
  ): Promise<Map<string, string>> {
    const cacheKey = `${languageCode}:${namespace}`;
    
    if (this.translationsCache.has(cacheKey)) {
      return this.translationsCache.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language_code', languageCode)
        .eq('namespace', namespace);

      if (error) {
        console.error('Error fetching translations:', error);
        return new Map();
      }

      const translations = new Map<string, string>();
      (data || []).forEach((item: any) => {
        translations.set(item.key, item.value);
      });

      this.translationsCache.set(cacheKey, translations);
      return translations;
    } catch (error) {
      console.error('Error in getTranslations:', error);
      return new Map();
    }
  }

  /**
   * Get a single translation
   */
  static async getTranslation(
    key: string,
    languageCode: string = 'en',
    namespace: string = 'common'
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('get_translation', {
        p_key: key,
        p_language_code: languageCode,
        p_namespace: namespace,
      });

      if (error) {
        console.error('Error getting translation:', error);
        return key; // Return key as fallback
      }

      return data || key;
    } catch (error) {
      console.error('Error in getTranslation:', error);
      return key;
    }
  }

  /**
   * Get localized content for a specific item
   */
  static async getLocalizedContent(
    contentType: string,
    contentId: string,
    languageCode: string = 'en',
    fieldName: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_localized_content', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_language_code: languageCode,
        p_field_name: fieldName,
      });

      if (error) {
        console.error('Error getting localized content:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLocalizedContent:', error);
      return null;
    }
  }

  /**
   * Set localized content for a specific item
   */
  static async setLocalizedContent(
    contentType: string,
    contentId: string,
    languageCode: string,
    fieldName: string,
    fieldValue: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('set_localized_content', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_language_code: languageCode,
        p_field_name: fieldName,
        p_field_value: fieldValue,
      });

      if (error) {
        console.error('Error setting localized content:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in setLocalizedContent:', error);
      return null;
    }
  }

  /**
   * Get user language preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_language, timezone, date_format, time_format, currency_code')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting user preferences:', error);
        return null;
      }

      return {
        preferred_language: data.preferred_language || 'en',
        timezone: data.timezone || 'UTC',
        date_format: data.date_format || 'MM/DD/YYYY',
        time_format: data.time_format || '12h',
        currency_code: data.currency_code || 'RUB',
      };
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  }

  /**
   * Update user language preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_language: preferences.preferred_language,
          timezone: preferences.timezone,
          date_format: preferences.date_format,
          time_format: preferences.time_format,
          currency_code: preferences.currency_code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return false;
    }
  }

  /**
   * Clear translation cache
   */
  static clearCache(): void {
    this.translationsCache.clear();
    this.languagesCache = null;
  }

  /**
   * Format date according to user preferences
   */
  static formatDate(
    date: Date | string,
    languageCode: string = 'en',
    timezone: string = 'UTC'
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    try {
      return new Intl.DateTimeFormat(languageCode, {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateObj.toLocaleDateString();
    }
  }

  /**
   * Format time according to user preferences
   */
  static formatTime(
    date: Date | string,
    languageCode: string = 'en',
    timezone: string = 'UTC',
    format: '12h' | '24h' = '12h'
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    try {
      return new Intl.DateTimeFormat(languageCode, {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: format === '12h',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateObj.toLocaleTimeString();
    }
  }

  /**
   * Format currency according to user preferences
   */
  static formatCurrency(
    amount: number,
    currencyCode: string = 'RUB',
    languageCode: string = 'en'
  ): string {
    try {
      return new Intl.NumberFormat(languageCode, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount} ${currencyCode}`;
    }
  }

  /**
   * Format number according to locale
   */
  static formatNumber(
    number: number,
    languageCode: string = 'en',
    options?: Intl.NumberFormatOptions
  ): string {
    try {
      return new Intl.NumberFormat(languageCode, options).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  static formatRelativeTime(
    date: Date | string,
    languageCode: string = 'en',
    timezone: string = 'UTC'
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    try {
      const rtf = new Intl.RelativeTimeFormat(languageCode, { numeric: 'auto' });

      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
      }
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return dateObj.toLocaleDateString();
    }
  }
}

// Utility functions for common i18n operations
export const t = (key: string, languageCode: string = 'en', namespace: string = 'common') => {
  return I18nService.getTranslation(key, languageCode, namespace);
};

export const formatPrice = (amount: number, currencyCode: string = 'RUB', languageCode: string = 'en') => {
  return I18nService.formatCurrency(amount, currencyCode, languageCode);
};

export const formatDate = (date: Date | string, languageCode: string = 'en', timezone: string = 'UTC') => {
  return I18nService.formatDate(date, languageCode, timezone);
};

export const formatTime = (date: Date | string, languageCode: string = 'en', timezone: string = 'UTC', format: '12h' | '24h' = '12h') => {
  return I18nService.formatTime(date, languageCode, timezone, format);
};

export const formatRelativeTime = (date: Date | string, languageCode: string = 'en', timezone: string = 'UTC') => {
  return I18nService.formatRelativeTime(date, languageCode, timezone);
};
