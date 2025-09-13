'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { BusinessService, SubscriptionPlan, UserSubscription } from '@ciuna/sb';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { 
  Check, 
  X, 
  Crown, 
  Star, 
  Building2,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const { formatPrice } = useI18n();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        BusinessService.getSubscriptionPlans(),
        BusinessService.getUserSubscription(user.id)
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    try {
      const result = await BusinessService.createSubscription(
        user.id,
        planId,
        billingCycle
      );

      if (result.success) {
        // Redirect to payment or show success
        alert('Subscription created successfully!');
        await loadSubscriptionData();
      } else {
        alert('Failed to create subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !currentSubscription) return;

    if (confirm('Are you sure you want to cancel your subscription?')) {
      try {
        const success = await BusinessService.cancelSubscription(user.id, true);
        if (success) {
          alert('Subscription will be cancelled at the end of the current period.');
          await loadSubscriptionData();
        } else {
          alert('Failed to cancel subscription. Please try again.');
        }
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'BASIC':
        return <Star className="h-6 w-6" />;
      case 'PREMIUM':
        return <Crown className="h-6 w-6" />;
      case 'ENTERPRISE':
        return <Building2 className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'BASIC':
        return 'text-blue-600 bg-blue-100';
      case 'PREMIUM':
        return 'text-purple-600 bg-purple-100';
      case 'ENTERPRISE':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId;
  };

  const getSubscriptionStatus = () => {
    if (!currentSubscription) return null;

    switch (currentSubscription.status) {
      case 'TRIAL':
        return { text: 'Trial', color: 'bg-blue-100 text-blue-800' };
      case 'ACTIVE':
        return { text: 'Active', color: 'bg-green-100 text-green-800' };
      case 'PAUSED':
        return { text: 'Paused', color: 'bg-yellow-100 text-yellow-800' };
      case 'CANCELLED':
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
      case 'EXPIRED':
        return { text: 'Expired', color: 'bg-gray-100 text-gray-800' };
      case 'PAST_DUE':
        return { text: 'Past Due', color: 'bg-orange-100 text-orange-800' };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to view subscriptions.</CardDescription>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-2">
            Choose the perfect plan for your business needs.
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Subscription</span>
                <Badge className={getSubscriptionStatus()?.color}>
                  {getSubscriptionStatus()?.text}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900">Plan</h3>
                  <p className="text-sm text-gray-600">
                    {currentSubscription.billing_cycle === 'YEARLY' ? 'Yearly' : 'Monthly'} billing
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Price</h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(currentSubscription.price, currentSubscription.currency_code)}
                    /{currentSubscription.billing_cycle === 'YEARLY' ? 'year' : 'month'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Next Billing</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {currentSubscription.status === 'ACTIVE' && (
                <div className="mt-6 flex space-x-4">
                  <Button variant="outline" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'YEARLY'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-green-600">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'YEARLY' ? plan.price_yearly : plan.price_monthly;
            const isCurrent = isCurrentPlan(plan.id);
            const isPopular = plan.plan_type === 'PREMIUM';

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isPopular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={getPlanColor(plan.plan_type)}>
                      {getPlanIcon(plan.plan_type)}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {formatPrice(price || plan.price_monthly, plan.currency_code)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'YEARLY' ? 'year' : 'month'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {Object.entries(plan.features).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            {key.replace(/_/g, ' ').toLowerCase()}: {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      {isCurrent ? (
                        <Button className="w-full" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleSubscribe(plan.id)}
                        >
                          {plan.plan_type === 'ENTERPRISE' ? 'Contact Sales' : 'Subscribe'}
                        </Button>
                      )}
                    </div>

                    {plan.trial_days > 0 && (
                      <p className="text-xs text-center text-gray-500">
                        {plan.trial_days}-day free trial
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What happens if I cancel?
              </h3>
              <p className="text-gray-600">
                You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all new subscriptions. Contact our support team for assistance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I get a custom plan?
              </h3>
              <p className="text-gray-600">
                Yes, we offer custom Enterprise plans for large businesses. Contact our sales team to discuss your specific needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
