'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Globe, 
  DollarSign, 
  Truck, 
  CreditCard, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { currencyService } from '@/lib/currency'
import { locationService } from '@/lib/location'
import { SupportedCurrency, UserLocation } from '@/lib/currency'
import { FeatureAccessRule, ShippingProvider, PaymentMethod, CurrencyExchangeRate } from '@/lib/types'

interface GlobalSettingsProps {
  className?: string
}

export function GlobalSettings({ className = '' }: GlobalSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Currency Management
  const [exchangeRates, setExchangeRates] = useState<CurrencyExchangeRate[]>([])
  const [newRate, setNewRate] = useState({ from: 'USD', to: 'EUR', rate: 0.85 })

  // Feature Access Management
  const [featureRules, setFeatureRules] = useState<FeatureAccessRule[]>([])
  const [editingRule, setEditingRule] = useState<FeatureAccessRule | null>(null)

  // Shipping Providers Management
  const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([])
  const [newProvider, setNewProvider] = useState({
    name: '',
    code: '',
    countries: [] as string[],
    supported_currencies: [] as string[],
    is_active: true
  })

  // Payment Methods Management
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: '',
    code: '',
    countries: [] as string[],
    supported_currencies: [] as string[],
    is_active: true
  })

  const supabase = createClient()

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await Promise.all([
        loadExchangeRates(),
        loadFeatureRules(),
        loadShippingProviders(),
        loadPaymentMethods()
      ])
    } catch (err) {
      setError('Failed to load settings data')
      console.error('Load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadExchangeRates = async () => {
    const { data, error } = await supabase
      .from('currency_exchange_rates')
      .select('*')
      .order('from_currency', { ascending: true })

    if (error) throw error
    setExchangeRates(data || [])
  }

  const loadFeatureRules = async () => {
    const { data, error } = await supabase
      .from('feature_access_rules')
      .select('*')
      .order('location', { ascending: true })

    if (error) throw error
    setFeatureRules(data || [])
  }

  const loadShippingProviders = async () => {
    const { data, error } = await supabase
      .from('shipping_providers')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    setShippingProviders(data || [])
  }

  const loadPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    setPaymentMethods(data || [])
  }

  const updateExchangeRate = async (rate: CurrencyExchangeRate) => {
    const { error } = await supabase
      .from('currency_exchange_rates')
      .update({ rate: rate.rate, last_updated: new Date().toISOString() })
      .eq('id', rate.id)

    if (error) throw error
    await loadExchangeRates()
  }

  const addExchangeRate = async () => {
    const { error } = await supabase
      .from('currency_exchange_rates')
      .upsert({
        from_currency: newRate.from,
        to_currency: newRate.to,
        rate: newRate.rate,
        last_updated: new Date().toISOString()
      })

    if (error) throw error
    setNewRate({ from: 'USD', to: 'EUR', rate: 0.85 })
    await loadExchangeRates()
  }

  const updateFeatureRule = async (rule: FeatureAccessRule) => {
    const { error } = await supabase
      .from('feature_access_rules')
      .update({ 
        is_enabled: rule.is_enabled,
        configuration: rule.configuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', rule.id)

    if (error) throw error
    await loadFeatureRules()
  }

  const addShippingProvider = async () => {
    const { error } = await supabase
      .from('shipping_providers')
      .insert([newProvider])

    if (error) throw error
    setNewProvider({
      name: '',
      code: '',
      countries: [],
      supported_currencies: [],
      is_active: true
    })
    await loadShippingProviders()
  }

  const addPaymentMethod = async () => {
    const { error } = await supabase
      .from('payment_methods')
      .insert([newPaymentMethod])

    if (error) throw error
    setNewPaymentMethod({
      name: '',
      code: '',
      countries: [],
      supported_currencies: [],
      is_active: true
    })
    await loadPaymentMethods()
  }

  const refreshExchangeRates = async () => {
    setIsLoading(true)
    try {
      await currencyService.updateExchangeRates()
      await loadExchangeRates()
      setSuccess('Exchange rates updated successfully')
    } catch (err) {
      setError('Failed to update exchange rates')
    } finally {
      setIsLoading(false)
    }
  }

  const showSuccess = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const showError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 3000)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Global Settings
          </h2>
          <p className="text-muted-foreground">
            Manage currencies, locations, and global marketplace features
          </p>
        </div>
        <Button onClick={refreshExchangeRates} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Exchange Rates
        </Button>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Tabs defaultValue="currencies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Currencies Tab */}
        <TabsContent value="currencies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exchange Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Exchange Rates
                </CardTitle>
                <CardDescription>
                  Manage currency exchange rates for real-time conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exchangeRates.map((rate) => (
                  <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{rate.from_currency}</Badge>
                      <span>→</span>
                      <Badge variant="outline">{rate.to_currency}</Badge>
                      <span className="font-medium">{rate.rate.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.0001"
                        value={rate.rate}
                        onChange={(e) => {
                          const updatedRate = { ...rate, rate: parseFloat(e.target.value) }
                          setExchangeRates(prev => 
                            prev.map(r => r.id === rate.id ? updatedRate : r)
                          )
                        }}
                        className="w-24 h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateExchangeRate(rate)}
                        disabled={isLoading}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add New Rate */}
                <div className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg">
                  <Select value={newRate.from} onValueChange={(value) => setNewRate(prev => ({ ...prev, from: value as SupportedCurrency }))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(currencyService.CURRENCY_SYMBOLS).map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>→</span>
                  <Select value={newRate.to} onValueChange={(value) => setNewRate(prev => ({ ...prev, to: value as SupportedCurrency }))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(currencyService.CURRENCY_SYMBOLS).map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newRate.rate}
                    onChange={(e) => setNewRate(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-24"
                    placeholder="Rate"
                  />
                  <Button onClick={addExchangeRate} disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Currency Status */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Status</CardTitle>
                <CardDescription>
                  Overview of supported currencies and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(currencyService.CURRENCY_SYMBOLS).map(([currency, symbol]) => {
                    const rateCount = exchangeRates.filter(r => r.from_currency === currency).length
                    return (
                      <div key={currency} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{symbol}</span>
                          <span>{currency}</span>
                        </div>
                        <Badge variant={rateCount > 0 ? 'default' : 'secondary'}>
                          {rateCount} rates
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Access Rules
              </CardTitle>
              <CardDescription>
                Configure which features are available in each location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{rule.location}</Badge>
                      <span className="font-medium">{rule.feature_name}</span>
                      <Switch
                        checked={rule.is_enabled}
                        onCheckedChange={(enabled) => {
                          const updatedRule = { ...rule, is_enabled: enabled }
                          setFeatureRules(prev => 
                            prev.map(r => r.id === rule.id ? updatedRule : r)
                          )
                          updateFeatureRule(updatedRule)
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.is_enabled ? 'default' : 'secondary'}>
                        {rule.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Providers
              </CardTitle>
              <CardDescription>
                Manage shipping providers and their availability by location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shippingProviders.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">Code: {provider.code}</p>
                      <div className="flex gap-1 mt-1">
                        {provider.countries.map(country => (
                          <Badge key={country} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={provider.is_active}
                      onCheckedChange={(active) => {
                        // Update provider status
                        const updatedProvider = { ...provider, is_active: active }
                        setShippingProviders(prev => 
                          prev.map(p => p.id === provider.id ? updatedProvider : p)
                        )
                        // Update in database
                        supabase
                          .from('shipping_providers')
                          .update({ is_active: active })
                          .eq('id', provider.id)
                      }}
                    />
                    <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Add New Provider */}
              <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                <h4 className="font-medium">Add New Shipping Provider</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Provider Name"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Provider Code"
                    value={newProvider.code}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <Button onClick={addShippingProvider} disabled={!newProvider.name || !newProvider.code}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage payment methods and their availability by location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">Code: {method.code}</p>
                      <div className="flex gap-1 mt-1">
                        {method.countries.map(country => (
                          <Badge key={country} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.is_active}
                      onCheckedChange={(active) => {
                        // Update method status
                        const updatedMethod = { ...method, is_active: active }
                        setPaymentMethods(prev => 
                          prev.map(m => m.id === method.id ? updatedMethod : m)
                        )
                        // Update in database
                        supabase
                          .from('payment_methods')
                          .update({ is_active: active })
                          .eq('id', method.id)
                      }}
                    />
                    <Badge variant={method.is_active ? 'default' : 'secondary'}>
                      {method.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Add New Payment Method */}
              <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                <h4 className="font-medium">Add New Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Method Name"
                    value={newPaymentMethod.name}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Method Code"
                    value={newPaymentMethod.code}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <Button onClick={addPaymentMethod} disabled={!newPaymentMethod.name || !newPaymentMethod.code}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
