'use client';

import { useState } from 'react';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@ciuna/ui';
import { useI18n } from '@/contexts/i18n-context';
import { DollarSign, Check } from 'lucide-react';

interface CurrencySelectorProps {
  variant?: 'button' | 'dropdown' | 'inline';
  showSymbol?: boolean;
  className?: string;
}

const CURRENCIES = [
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
];

export default function CurrencySelector({ 
  variant = 'dropdown',
  showSymbol = true,
  className = ''
}: CurrencySelectorProps) {
  const { userPreferences, updateUserPreferences, formatPrice } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrency = userPreferences?.currency_code || 'RUB';
  const currentCurrencyInfo = CURRENCIES.find(c => c.code === currentCurrency);

  const handleCurrencyChange = async (currencyCode: string) => {
    await updateUserPreferences({ currency_code: currencyCode });
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {CURRENCIES.slice(0, 8).map((currency) => (
          <Button
            key={currency.code}
            variant={currentCurrency === currency.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCurrencyChange(currency.code)}
            className="flex items-center space-x-2"
          >
            <span className="text-lg">{currency.flag}</span>
            <span>{currency.code}</span>
            {showSymbol && (
              <span className="text-sm text-gray-500">{currency.symbol}</span>
            )}
            {currentCurrency === currency.code && (
              <Check className="h-3 w-3" />
            )}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 ${className}`}
      >
        <DollarSign className="h-4 w-4" />
        <span className="text-lg">{currentCurrencyInfo?.flag || '💱'}</span>
        <span>{currentCurrencyInfo?.code || 'RUB'}</span>
        {showSymbol && (
          <span className="text-sm text-gray-500">
            {currentCurrencyInfo?.symbol || '₽'}
          </span>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center space-x-2 ${className}`}
        >
          <DollarSign className="h-4 w-4" />
          <span className="text-lg">{currentCurrencyInfo?.flag || '💱'}</span>
          <span>{currentCurrencyInfo?.code || 'RUB'}</span>
          {showSymbol && (
            <span className="text-sm text-gray-500">
              {currentCurrencyInfo?.symbol || '₽'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {CURRENCIES.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencyChange(currency.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{currency.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{currency.code}</span>
                <span className="text-xs text-gray-500">{currency.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showSymbol && (
                <span className="text-sm text-gray-500">{currency.symbol}</span>
              )}
              {currentCurrency === currency.code && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Currency display component
export function CurrencyDisplay({ 
  amount, 
  currencyCode, 
  showSymbol = true,
  className = ''
}: { 
  amount: number; 
  currencyCode?: string; 
  showSymbol?: boolean;
  className?: string;
}) {
  const { userPreferences, formatPrice } = useI18n();
  const currency = currencyCode || userPreferences?.currency_code || 'RUB';
  
  return (
    <span className={className}>
      {formatPrice(amount, currency)}
    </span>
  );
}

// Compact currency selector for mobile
export function CompactCurrencySelector({ className = '' }: { className?: string }) {
  const { userPreferences, updateUserPreferences } = useI18n();
  
  const currentCurrency = userPreferences?.currency_code || 'RUB';

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {CURRENCIES.slice(0, 6).map((currency) => (
        <Button
          key={currency.code}
          variant={currentCurrency === currency.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => updateUserPreferences({ currency_code: currency.code })}
          className="px-2 py-1 h-8"
        >
          <span className="text-sm">{currency.flag}</span>
        </Button>
      ))}
    </div>
  );
}
