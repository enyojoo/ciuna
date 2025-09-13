'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { PaymentService, PaymentTransaction, PaymentProvider } from '@ciuna/sb';
import { useAuth } from '../lib/auth-context';
import { useI18n } from '../contexts/i18n-context';
import PaymentMethodSelector from './payment-method-selector';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface PaymentProcessorProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (transaction: PaymentTransaction) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export default function PaymentProcessor({
  orderId,
  amount,
  currency,
  onSuccess,
  onError,
  onCancel
}: PaymentProcessorProps) {
  const { user } = useAuth();
  const { formatPrice } = useI18n();
  const [step, setStep] = useState<'select' | 'processing' | 'redirect' | 'success' | 'error'>('select');
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (transaction && step === 'processing') {
      // Start polling for transaction status
      startStatusPolling();
    }
  }, [transaction, step]);

  const startStatusPolling = () => {
    if (!transaction) return;

    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const updatedTransaction = await PaymentService.getTransactionStatus(transaction.id);
        if (updatedTransaction) {
          setTransaction(updatedTransaction);
          
          if (updatedTransaction.status === 'COMPLETED') {
            setStep('success');
            onSuccess(updatedTransaction);
            clearInterval(interval);
            setPolling(false);
          } else if (updatedTransaction.status === 'FAILED' || updatedTransaction.status === 'CANCELLED') {
            setStep('error');
            setError(updatedTransaction.failure_reason || 'Payment failed');
            onError(updatedTransaction.failure_reason || 'Payment failed');
            clearInterval(interval);
            setPolling(false);
          }
        }
      } catch (err) {
        console.error('Error polling transaction status:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 300000);
  };

  const handleMethodSelect = (method: any, provider: any) => {
    setSelectedMethod(method);
    setSelectedProvider(provider);
  };

  const handleProcessPayment = async () => {
    if (!user || !selectedMethod || !selectedProvider) return;

    setLoading(true);
    setError(null);

    try {
      const result = await PaymentService.createPayment(
        user.id,
        orderId,
        selectedProvider.id,
        selectedMethod.id,
        amount,
        currency,
        {
          orderId,
          amount,
          currency,
        }
      );

      if (result.success && result.transactionId) {
        // Get the created transaction
        const createdTransaction = await PaymentService.getTransactionStatus(result.transactionId);
        if (createdTransaction) {
          setTransaction(createdTransaction);
          
          if (result.paymentUrl) {
            setPaymentUrl(result.paymentUrl);
            setStep('redirect');
          } else {
            setStep('processing');
          }
        } else {
          throw new Error('Failed to retrieve transaction details');
        }
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      setStep('error');
      onError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalPayment = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  const handleRetry = () => {
    setStep('select');
    setError(null);
    setTransaction(null);
    setPaymentUrl('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PROCESSING':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
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

  if (step === 'select') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>
              Pay {formatPrice(amount, currency)} for your order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodSelector
              onSelect={handleMethodSelect}
              amount={amount}
              currency={currency}
              showAddNew={true}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleProcessPayment}
            disabled={!selectedMethod || loading}
            className="min-w-[120px]"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'redirect') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            Complete Payment
          </CardTitle>
          <CardDescription>
            You will be redirected to complete your payment securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <CreditCard className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Redirecting to Payment
            </h3>
            <p className="text-gray-600 mb-4">
              You will be redirected to {selectedProvider?.display_name} to complete your payment.
            </p>
            <Button onClick={handleExternalPayment} className="mb-4">
              <ExternalLink className="h-4 w-4 mr-2" />
              Complete Payment
            </Button>
            <p className="text-sm text-gray-500">
              Don't see the redirect? Click the button above to open the payment page.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleRetry}>
              Back to Payment Methods
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'processing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment
          </CardTitle>
          <CardDescription>
            Please wait while we process your payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Processing Your Payment
            </h3>
            <p className="text-gray-600 mb-4">
              This may take a few moments. Please don't close this page.
            </p>
            {transaction && (
              <div className="flex items-center justify-center space-x-2">
                {getStatusIcon(transaction.status)}
                {getStatusBadge(transaction.status)}
              </div>
            )}
          </div>

          {polling && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Checking payment status...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            Payment Successful
          </CardTitle>
          <CardDescription>
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payment Completed
            </h3>
            <p className="text-gray-600 mb-4">
              You have successfully paid {formatPrice(amount, currency)}.
            </p>
            {transaction && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Transaction ID:</span>
                    <p className="text-gray-600 font-mono">{transaction.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span>
                    <p className="text-gray-600">{formatPrice(transaction.amount, transaction.currency_code)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-gray-600">{transaction.status}</p>
                  </div>
                  <div>
                    <span className="font-medium">Processed:</span>
                    <p className="text-gray-600">
                      {transaction.processed_at ? 
                        new Date(transaction.processed_at).toLocaleString() : 
                        'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-2" />
            Payment Failed
          </CardTitle>
          <CardDescription>
            There was an error processing your payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'An unexpected error occurred while processing your payment.'}
            </p>
            {transaction && (
              <div className="bg-red-50 rounded-lg p-4 text-left">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Error Details</span>
                </div>
                <p className="text-sm text-red-700">
                  {transaction.failure_reason || 'Unknown error occurred'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleRetry}>
              Try Again
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
