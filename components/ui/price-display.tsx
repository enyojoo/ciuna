'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { convertCurrency, formatCurrency, SupportedCurrency } from '@/lib/currency'
import { CurrencyConversion } from '@/lib/types'
import { ArrowUpDown, RefreshCw } from 'lucide-react'

interface PriceDisplayProps {
  amount: number
  originalCurrency: SupportedCurrency
  userCurrency: SupportedCurrency
  showOriginal?: boolean
  showConversion?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({
  amount,
  originalCurrency,
  userCurrency,
  showOriginal = true,
  showConversion = true,
  size = 'md',
  className = ''
}: PriceDisplayProps) {
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  }

  const loadConversion = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await convertCurrency(amount, originalCurrency, userCurrency)
      setConversion(result)
    } catch (err) {
      setError('Failed to load conversion')
      console.error('Currency conversion error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [amount, originalCurrency, userCurrency])

  useEffect(() => {
    if (originalCurrency !== userCurrency && showConversion) {
      loadConversion()
    }
  }, [amount, originalCurrency, userCurrency, showConversion, loadConversion])

  const formatAmount = (amount: number, currency: SupportedCurrency) => {
    return formatCurrency(amount, currency)
  }

  if (originalCurrency === userCurrency) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        {formatAmount(amount, originalCurrency)}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center gap-2`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Converting...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center gap-2`}>
        <span className="text-muted-foreground">{formatAmount(amount, originalCurrency)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadConversion}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {conversion ? formatAmount(conversion.convertedAmount, userCurrency) : formatAmount(amount, originalCurrency)}
        </span>
        
        {showOriginal && (
          <Badge variant="secondary" className="text-xs">
            {formatAmount(amount, originalCurrency)}
          </Badge>
        )}
        
        {showConversion && conversion && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3 w-3" />
            <span>1 {originalCurrency} = {conversion.rate.toFixed(4)} {userCurrency}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface PriceSelectorProps {
  amount: number
  originalCurrency: SupportedCurrency
  onCurrencyChange: (currency: SupportedCurrency) => void
  availableCurrencies: SupportedCurrency[]
  className?: string
}

export function PriceSelector({
  amount,
  originalCurrency,
  onCurrencyChange,
  availableCurrencies,
  className = ''
}: PriceSelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(originalCurrency)
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadConversion = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await convertCurrency(amount, originalCurrency, selectedCurrency)
      setConversion(result)
    } catch (err) {
      console.error('Currency conversion error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [amount, originalCurrency, selectedCurrency])

  useEffect(() => {
    if (selectedCurrency !== originalCurrency) {
      loadConversion()
    } else {
      setConversion(null)
    }
  }, [amount, originalCurrency, selectedCurrency, loadConversion])

  const handleCurrencyChange = (currency: string) => {
    const newCurrency = currency as SupportedCurrency
    setSelectedCurrency(newCurrency)
    onCurrencyChange(newCurrency)
  }

  const displayAmount = conversion ? conversion.convertedAmount : amount
  const displayCurrency = selectedCurrency

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Price</span>
            <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map(currency => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Converting...</span>
              </div>
            ) : (
              formatCurrency(displayAmount, displayCurrency)
            )}
          </div>
          
          {conversion && (
            <div className="text-xs text-muted-foreground">
              Original: {formatCurrency(amount, originalCurrency)}
              <br />
              Rate: 1 {originalCurrency} = {conversion.rate.toFixed(4)} {displayCurrency}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
