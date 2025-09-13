'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
// import { RadioGroup, RadioGroupItem } from '@ciuna/ui'; // Not available
// import { Label } from '@ciuna/ui'; // Not available
import { PaymentService, PaymentProvider, PaymentMethod } from '@ciuna/sb';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2, 
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';

interface PaymentMethodSelectorProps {
  onSelect: (paymentMethod: PaymentMethod | null, provider: PaymentProvider | null) => void;
  selectedMethodId?: string;
  amount: number;
  currency: string;
  showAddNew?: boolean;
}

const PROVIDER_ICONS: { [key: string]: React.ComponentType<any> } = {
  'YOOMONEY': Smartphone,
  'STRIPE': CreditCard,
  'CASH': Banknote,
  'BANK_TRANSFER': Building2,
};

const METHOD_ICONS: { [key: string]: React.ComponentType<any> } = {
  'CARD': CreditCard,
  'BANK_ACCOUNT': Building2,
  'WALLET': Smartphone,
  'CASH': Banknote,
  'CRYPTO': CreditCard,
};

export default function PaymentMethodSelector({
  onSelect,
  selectedMethodId,
  amount,
  currency,
  showAddNew = true
}: PaymentMethodSelectorProps) {
  const { user } = useAuth();
  const { formatPrice } = useI18n();
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>(selectedMethodId || '');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadPaymentData();
    }
  }, [user]);

  useEffect(() => {
    // Notify parent of selection
    const method = paymentMethods.find(m => m.id === selectedMethod);
    const provider = providers.find(p => p.id === selectedProvider);
    onSelect(method || null, provider || null);
  }, [selectedMethod, selectedProvider, paymentMethods, providers, onSelect]);

  const loadPaymentData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [providersData, methodsData] = await Promise.all([
        PaymentService.getProviders(),
        PaymentService.getPaymentMethods(user.id)
      ]);

      setProviders(providersData);
      setPaymentMethods(methodsData);

      // Set default selections
      if (methodsData.length > 0 && !selectedMethodId) {
        const defaultMethod = methodsData.find(m => m.is_default) || methodsData[0];
        setSelectedMethod(defaultMethod.id);
        setSelectedProvider(defaultMethod.provider_id);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedProvider(method.provider_id);
    }
  };

  const handleAddNewMethod = () => {
    // This would open a modal or navigate to add payment method page
    console.log('Add new payment method');
  };

  const getProviderIcon = (providerType: string) => {
    const IconComponent = PROVIDER_ICONS[providerType] || CreditCard;
    return <IconComponent className="h-5 w-5" />;
  };

  const getMethodIcon = (methodType: string) => {
    const IconComponent = METHOD_ICONS[methodType] || CreditCard;
    return <IconComponent className="h-4 w-4" />;
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.display_name || 'Unknown Provider';
  };

  const isProviderSupported = (provider: PaymentProvider) => {
    return provider.supported_currencies.includes(currency) && provider.is_active;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Loading payment methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Choose how you want to pay {formatPrice(amount, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payment methods
            </h3>
            <p className="text-gray-600 mb-4">
              Add a payment method to complete your purchase.
            </p>
            {showAddNew && (
              <Button onClick={handleAddNewMethod}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const provider = providers.find(p => p.id === method.provider_id);
                const isSupported = provider ? isProviderSupported(provider) : false;
                
                return (
                  <div key={method.id} className="relative">
                    <input
                      type="radio"
                      value={method.id}
                      id={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => handleMethodSelect(method.id)}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={method.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(method.method_type)}
                          {getProviderIcon(provider?.provider_type || '')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {method.method_type === 'CARD' ? 'Card' :
                               method.method_type === 'BANK_ACCOUNT' ? 'Bank Account' :
                               method.method_type === 'WALLET' ? 'Digital Wallet' :
                               method.method_type === 'CASH' ? 'Cash' :
                               method.method_type === 'CRYPTO' ? 'Cryptocurrency' :
                               method.method_type}
                            </span>
                            {method.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                            {method.is_verified && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {getProviderName(method.provider_id)}
                          </p>
                          {method.metadata?.last4 && (
                            <p className="text-xs text-gray-500">
                              •••• {method.metadata.last4}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!isSupported && (
                          <div className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Not supported</span>
                          </div>
                        )}
                        {selectedMethod === method.id && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {showAddNew && (
              <Button
                variant="outline"
                onClick={handleAddNewMethod}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Payment Method
              </Button>
            )}
          </div>
        )}

        {/* Available Providers */}
        {providers.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Supported Payment Providers
            </h4>
            <div className="flex flex-wrap gap-2">
              {providers
                .filter(provider => isProviderSupported(provider))
                .map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {getProviderIcon(provider.provider_type)}
                    <span>{provider.display_name}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
