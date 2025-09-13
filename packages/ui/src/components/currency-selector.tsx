import React from 'react';
import { cn } from '../lib/utils';
import { CurrencyCode, CURRENCY_INFO } from '@ciuna/types';

export interface CurrencySelectorProps {
  value: CurrencyCode;
  onValueChange: (currency: CurrencyCode) => void;
  className?: string;
  showSymbols?: boolean;
  showNames?: boolean;
  disabled?: boolean;
}

const CurrencySelector = React.forwardRef<HTMLSelectElement, CurrencySelectorProps>(
  ({ value, onValueChange, className, showSymbols = true, showNames = true, disabled = false, ...props }, ref) => {
    const currencies: CurrencyCode[] = [
      'USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'KRW',
      'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY',
      'BRL', 'MXN', 'INR', 'ZAR', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'UAH'
    ];

    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value as CurrencyCode)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {currencies.map((currency) => {
          const info = CURRENCY_INFO[currency];
          const displayText = showSymbols && showNames 
            ? `${info.symbol} ${currency} - ${info.name}`
            : showSymbols 
            ? `${info.symbol} ${currency}`
            : showNames
            ? `${currency} - ${info.name}`
            : currency;

          return (
            <option key={currency} value={currency}>
              {displayText}
            </option>
          );
        })}
      </select>
    );
  }
);

CurrencySelector.displayName = 'CurrencySelector';

export { CurrencySelector };
