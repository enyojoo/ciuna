'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nService, Language, UserPreferences } from '@ciuna/sb';

interface I18nContextType {
  // Current language state
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  
  // Available languages
  languages: Language[];
  loading: boolean;
  
  // User preferences
  userPreferences: UserPreferences | null;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Translation functions
  t: (key: string, namespace?: string) => string;
  tWithFallback: (key: string, fallback: string, namespace?: string) => string;
  
  // Formatting functions
  formatPrice: (amount: number, currencyCode?: string) => string;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string, format?: '12h' | '24h') => string;
  formatRelativeTime: (date: Date | string) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  
  // RTL support
  isRTL: boolean;
  
  // Loading state
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  userId?: string;
  defaultLanguage?: string;
}

export function I18nProvider({ 
  children, 
  userId, 
  defaultLanguage = 'en' 
}: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load languages and user preferences on mount
  useEffect(() => {
    loadInitialData();
  }, [userId]);

  // Update current language when user preferences change
  useEffect(() => {
    if (userPreferences?.preferred_language) {
      setCurrentLanguage(userPreferences.preferred_language);
    }
  }, [userPreferences]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load languages
      const languagesData = await I18nService.getLanguages();
      setLanguages(languagesData);
      
      // Load user preferences if userId is provided
      if (userId) {
        const preferences = await I18nService.getUserPreferences(userId);
        setUserPreferences(preferences);
        
        if (preferences?.preferred_language) {
          setCurrentLanguage(preferences.preferred_language);
        }
      }
    } catch (error) {
      console.error('Error loading i18n data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const success = await I18nService.updateUserPreferences(userId, preferences);
      
      if (success) {
        const updatedPreferences = await I18nService.getUserPreferences(userId);
        setUserPreferences(updatedPreferences);
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setCurrentLanguage(language);
    
    // Update user preferences if userId is provided
    if (userId) {
      await updateUserPreferences({ preferred_language: language });
    }
  };

  // Translation function with caching
  const t = (key: string, namespace: string = 'common'): string => {
    // For now, return the key as fallback
    // In a real implementation, you'd load translations and cache them
    return key;
  };

  const tWithFallback = (key: string, fallback: string, namespace: string = 'common'): string => {
    const translation = t(key, namespace);
    return translation !== key ? translation : fallback;
  };

  // Formatting functions using current language and user preferences
  const formatPrice = (amount: number, currencyCode?: string): string => {
    const currency = currencyCode || userPreferences?.currency_code || 'RUB';
    return I18nService.formatCurrency(amount, currency, currentLanguage);
  };

  const formatDate = (date: Date | string): string => {
    const timezone = userPreferences?.timezone || 'UTC';
    return I18nService.formatDate(date, currentLanguage, timezone);
  };

  const formatTime = (date: Date | string, format?: '12h' | '24h'): string => {
    const timezone = userPreferences?.timezone || 'UTC';
    const timeFormat = format || userPreferences?.time_format || '12h';
    return I18nService.formatTime(date, currentLanguage, timezone, timeFormat);
  };

  const formatRelativeTime = (date: Date | string): string => {
    const timezone = userPreferences?.timezone || 'UTC';
    return I18nService.formatRelativeTime(date, currentLanguage, timezone);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return I18nService.formatNumber(number, currentLanguage, options);
  };

  // Check if current language is RTL
  const currentLang = languages.find(lang => lang.code === currentLanguage);
  const isRTL = currentLang?.rtl || false;

  const value: I18nContextType = {
    currentLanguage,
    setCurrentLanguage: handleLanguageChange,
    languages,
    loading,
    userPreferences,
    updateUserPreferences,
    t,
    tWithFallback,
    formatPrice,
    formatDate,
    formatTime,
    formatRelativeTime,
    formatNumber,
    isRTL,
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Convenience hooks for specific functionality
export function useTranslation() {
  const { t, tWithFallback } = useI18n();
  return { t, tWithFallback };
}

export function useFormatting() {
  const { formatPrice, formatDate, formatTime, formatRelativeTime, formatNumber } = useI18n();
  return { formatPrice, formatDate, formatTime, formatRelativeTime, formatNumber };
}

export function useLanguage() {
  const { currentLanguage, setCurrentLanguage, languages, isRTL } = useI18n();
  return { currentLanguage, setCurrentLanguage, languages, isRTL };
}
