'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useLocation, useFeatureAccess } from '@/lib/contexts/location-context'
import { getLocationDisplay } from '@/lib/location'
import { UserLocation, SupportedCurrency } from '@/lib/currency'
import { MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react'

interface LocationSelectorProps {
  className?: string
}

export function LocationSelector({ className = '' }: LocationSelectorProps) {
  const { location, currency, setLocation, setCurrency, isLoading } = useLocation()
  const { featureAccess, canAccess } = useFeatureAccess()
  const [isOpen, setIsOpen] = useState(false)

  const locations: { value: UserLocation; label: string; flag: string }[] = [
    { value: 'russia', label: 'Russia', flag: '🇷🇺' },
    { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'us', label: 'United States', flag: '🇺🇸' },
    { value: 'germany', label: 'Germany', flag: '🇩🇪' },
    { value: 'france', label: 'France', flag: '🇫🇷' },
    { value: 'canada', label: 'Canada', flag: '🇨🇦' },
    { value: 'australia', label: 'Australia', flag: '🇦🇺' },
    { value: 'other', label: 'Other', flag: '🌍' }
  ]

  const currencies: { value: SupportedCurrency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'RUB', label: 'Russian Ruble', symbol: '₽' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
    { value: 'JPY', label: 'Japanese Yen', symbol: '¥' }
  ]

  const currentLocation = locations.find(l => l.value === location)
  const currentCurrency = currencies.find(c => c.value === currency)

  const features = [
    { key: 'list', label: 'List Items', description: 'Create listings for sale' },
    { key: 'sell', label: 'Sell Products', description: 'Sell through vendor products' },
    { key: 'buy', label: 'Buy Items', description: 'Purchase from other users' },
    { key: 'services', label: 'Local Services', description: 'Offer or book local services' },
    { key: 'group_buy', label: 'Group Buying', description: 'Participate in group deals' }
  ]

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`${className} justify-start`}
      >
        <MapPin className="mr-2 h-4 w-4" />
        {currentLocation ? (
          <span>{currentLocation.flag} {currentLocation.label}</span>
        ) : (
          <span>Select Location</span>
        )}
      </Button>
    )
  }

  return (
    <Card className={`${className} w-full max-w-md`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Currency
        </CardTitle>
        <CardDescription>
          Choose your location and preferred currency to see available features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select
            value={location || ''}
            onValueChange={(value) => setLocation(value as UserLocation)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>
                  <div className="flex items-center gap-2">
                    <span>{loc.flag}</span>
                    <span>{loc.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <Select
            value={currency || ''}
            onValueChange={(value) => setCurrency(value as SupportedCurrency)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  <div className="flex items-center gap-2">
                    <span>{curr.symbol}</span>
                    <span>{curr.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {featureAccess && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Available Features</div>
            <div className="space-y-2">
              {features.map((feature) => {
                const hasAccess = canAccess(feature.key)
                return (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{feature.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {feature.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAccess ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={hasAccess ? 'default' : 'secondary'}>
                        {hasAccess ? 'Available' : 'Not Available'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface LocationIndicatorProps {
  className?: string
  showCurrency?: boolean
}

export function LocationIndicator({ className = '', showCurrency = true }: LocationIndicatorProps) {
  const { location, currency, isLoading } = useLocation()

  if (isLoading) {
    return (
      <div className={`${className} flex items-center gap-2 text-sm text-muted-foreground`}>
        <div className="animate-pulse bg-muted h-4 w-4 rounded" />
        <span>Loading...</span>
      </div>
    )
  }

  if (!location) {
    return (
      <div className={`${className} flex items-center gap-2 text-sm text-muted-foreground`}>
        <MapPin className="h-4 w-4" />
        <span>Location not set</span>
      </div>
    )
  }

  return (
    <div className={`${className} flex items-center gap-2 text-sm`}>
      <MapPin className="h-4 w-4" />
      <span>{getLocationDisplay(location)}</span>
      {showCurrency && currency && (
        <>
          <span className="text-muted-foreground">•</span>
          <DollarSign className="h-4 w-4" />
          <span>{currency}</span>
        </>
      )}
    </div>
  )
}
