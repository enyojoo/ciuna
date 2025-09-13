import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '../lib/utils';
import { CURRENCY_INFO } from '@ciuna/types';
const CurrencySelector = React.forwardRef(({ value, onValueChange, className, showSymbols = true, showNames = true, disabled = false, ...props }, ref) => {
    const currencies = [
        'USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'KRW',
        'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY',
        'BRL', 'MXN', 'INR', 'ZAR', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'UAH'
    ];
    return (_jsx("select", { ref: ref, value: value, onChange: (e) => onValueChange(e.target.value), disabled: disabled, className: cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className), ...props, children: currencies.map((currency) => {
            const info = CURRENCY_INFO[currency];
            const displayText = showSymbols && showNames
                ? `${info.symbol} ${currency} - ${info.name}`
                : showSymbols
                    ? `${info.symbol} ${currency}`
                    : showNames
                        ? `${currency} - ${info.name}`
                        : currency;
            return (_jsx("option", { value: currency, children: displayText }, currency));
        }) }));
});
CurrencySelector.displayName = 'CurrencySelector';
export { CurrencySelector };
//# sourceMappingURL=currency-selector.js.map