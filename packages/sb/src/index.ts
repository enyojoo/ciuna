// Supabase client configuration and utilities
export * from './client';
export * from './auth';
export * from './database';
export * from './storage';
export * from './realtime';
export * from './notifications';
export * from './notification-providers';
export * from './analytics';
export * from './i18n';
export * from './security';
export * from './payments';
export * from './search';
export * from './business';

// Export types
export * from './types';

// Export currency utilities (avoiding duplicate ExchangeRate export)
export { CurrencyService } from './currency';