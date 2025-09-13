'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { PaymentService, PaymentMethod, PaymentTransaction, PaymentProvider } from '@ciuna/sb';
import { useAuth } from '../lib/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink,
  Smartphone,
  Banknote,
  Building2
} from 'lucide-react';

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

export default function PaymentsPage() {
  const { user } = useAuth();
  const { formatPrice } = useI18n();
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [showAddMethod, setShowAddMethod] = useState(false);

  useEffect(() => {
    if (user) {
      loadPaymentData();
    }
  }, [user]);

  const loadPaymentData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [methods, txs, provs] = await Promise.all([
        PaymentService.getPaymentMethods(user.id),
        PaymentService.getUserTransactions(user.id, 20),
        PaymentService.getProviders()
      ]);

      setPaymentMethods(methods);
      setTransactions(txs);
      setProviders(provs);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!user) return;

    try {
      const success = await PaymentService.setDefaultPaymentMethod(user.id, methodId);
      if (success) {
        await loadPaymentData();
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to delete this payment method?')) {
      try {
        // In a real implementation, you would call a delete method
        console.log('Delete payment method:', methodId);
        await loadPaymentData();
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getProviderIcon = (providerType: string) => {
    const IconComponent = PROVIDER_ICONS[providerType] || CreditCard;
    return <IconComponent className="h-4 w-4" />;
  };

  const getMethodIcon = (methodType: string) => {
    const IconComponent = METHOD_ICONS[methodType] || CreditCard;
    return <IconComponent className="h-4 w-4" />;
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.display_name || 'Unknown Provider';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access payment settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">Manage your payment methods and view transaction history.</p>
        </div>

        <Tabs defaultValue="methods" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="methods" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your saved payment methods for faster checkout.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddMethod(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No payment methods
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add a payment method to make checkout faster and easier.
                    </p>
                    <Button onClick={() => setShowAddMethod(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Method
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(method.method_type)}
                            {getProviderIcon(providers.find(p => p.id === method.provider_id)?.provider_type || '')}
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
                                <CheckCircle className="h-4 w-4 text-green-600" />
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
                            {method.expires_at && (
                              <p className="text-xs text-gray-500">
                                Expires {new Date(method.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!method.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Edit method:', method.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported Providers */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Payment Providers</CardTitle>
                <CardDescription>
                  We support multiple payment providers for your convenience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg"
                    >
                      {getProviderIcon(provider.provider_type)}
                      <div>
                        <h3 className="font-medium">{provider.display_name}</h3>
                        <p className="text-sm text-gray-600">
                          {provider.supported_currencies.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View your recent payment transactions and their status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-gray-600">
                      Your payment transactions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {transaction.transaction_type === 'PAYMENT' ? 'Payment' :
                                 transaction.transaction_type === 'REFUND' ? 'Refund' :
                                 transaction.transaction_type === 'CHARGEBACK' ? 'Chargeback' :
                                 transaction.transaction_type === 'DISPUTE' ? 'Dispute' :
                                 transaction.transaction_type === 'TRANSFER' ? 'Transfer' :
                                 transaction.transaction_type}
                              </span>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatPrice(transaction.amount, transaction.currency_code)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                            {transaction.provider_transaction_id && (
                              <p className="text-xs text-gray-500 font-mono">
                                ID: {transaction.provider_transaction_id}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {transaction.provider_response?.payment_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(transaction.provider_response.payment_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
