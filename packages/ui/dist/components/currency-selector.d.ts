import React from 'react';
import { CurrencyCode } from '@ciuna/types';
export interface CurrencySelectorProps {
    value: CurrencyCode;
    onValueChange: (currency: CurrencyCode) => void;
    className?: string;
    showSymbols?: boolean;
    showNames?: boolean;
    disabled?: boolean;
}
declare const CurrencySelector: React.ForwardRefExoticComponent<CurrencySelectorProps & React.RefAttributes<HTMLSelectElement>>;
export { CurrencySelector };
//# sourceMappingURL=currency-selector.d.ts.map