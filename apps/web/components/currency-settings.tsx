'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { CurrencySelector } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { CurrencyCode, CurrencyService } from '@ciuna/types';
import { useAuth } from '../lib/auth-context';
import { formatPrice } from '../lib/utils';

interface CurrencySettingsProps {
  onSave?: () => void;
}

export function CurrencySettings({ onSave }: CurrencySettingsProps) {
  const { user } = useAuth();
  const [primaryCurrency, setPrimaryCurrency] = useState<CurrencyCode>('RUB');
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('RUB');
  const [autoConvert, setAutoConvert] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await CurrencyService.getUserCurrencyPreferences(user.id);
      
      if (preferences) {
        setPrimaryCurrency(preferences.primary_currency || 'RUB');
        setDisplayCurrency(preferences.display_currency || 'RUB');
        setAutoConvert(preferences.auto_convert ?? true);
      }
    } catch (error) {
      console.error('Error loading currency preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await CurrencyService.updateUserCurrencyPreferences(user.id, {
        primary_currency: primaryCurrency,
        display_currency: displayCurrency,
        auto_convert: autoConvert,
      });
      
      onSave?.();
    } catch (error) {
      console.error('Error saving currency preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
        <CardDescription>
          Configure your preferred currencies for buying and selling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Primary Currency
          </label>
          <p className="text-sm text-gray-500">
            The currency you prefer to use when creating listings
          </p>
          <CurrencySelector
            value={primaryCurrency}
            onValueChange={setPrimaryCurrency}
            showSymbols={true}
            showNames={true}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Display Currency
          </label>
          <p className="text-sm text-gray-500">
            The currency you want to see prices in
          </p>
          <CurrencySelector
            value={displayCurrency}
            onValueChange={setDisplayCurrency}
            showSymbols={true}
            showNames={true}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoConvert}
              onChange={(e) => setAutoConvert(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Auto-convert prices
            </span>
          </label>
          <p className="text-sm text-gray-500">
            Automatically convert prices to your display currency
          </p>
        </div>

        {autoConvert && primaryCurrency !== displayCurrency && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Price Conversion Preview
            </h4>
            <div className="text-sm text-blue-700">
              <p>100 {primaryCurrency} → {formatPrice(100, displayCurrency)}</p>
              <p className="text-xs text-blue-600 mt-1">
                Exchange rates are updated automatically
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => loadUserPreferences()}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
