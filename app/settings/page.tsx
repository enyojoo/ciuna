'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { useI18n } from '@/contexts/i18n-context';
import LanguageSelector from '@/components/language-selector';
import CurrencySelector from '@/components/currency-selector';
import NotificationSettings from '@/components/notification-settings';
import { useAuth } from '@/lib/auth-context';
import { Settings, Globe, DollarSign, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    userPreferences, 
    updateUserPreferences, 
    isLoading: i18nLoading 
  } = useI18n();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSavePreferences = async (preferences: any) => {
    try {
      setLoading(true);
      setMessage(null);
      
      await updateUserPreferences(preferences);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    await handleSavePreferences({ preferred_language: language });
  };

  const handleCurrencyChange = async (currency: string) => {
    await handleSavePreferences({ currency_code: currency });
  };

  const handleTimezoneChange = async (timezone: string) => {
    await handleSavePreferences({ timezone });
  };

  const handleDateFormatChange = async (dateFormat: string) => {
    await handleSavePreferences({ date_format: dateFormat });
  };

  const handleTimeFormatChange = async (timeFormat: string) => {
    await handleSavePreferences({ time_format: timeFormat });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Language</span>
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Currency</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your basic account details and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={userPreferences?.timezone || 'UTC'}
                      onChange={(e) => handleTimezoneChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Europe/Moscow">Moscow (UTC+3)</option>
                      <option value="Europe/London">London (UTC+0)</option>
                      <option value="America/New_York">New York (UTC-5)</option>
                      <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                      <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                      <option value="Asia/Shanghai">Shanghai (UTC+8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={userPreferences?.date_format || 'MM/DD/YYYY'}
                      onChange={(e) => handleDateFormatChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Format
                    </label>
                    <select
                      value={userPreferences?.time_format || '12h'}
                      onChange={(e) => handleTimeFormatChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language Preferences</CardTitle>
                <CardDescription>Choose your preferred language for the interface.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Language
                    </label>
                    <LanguageSelector 
                      variant="inline" 
                      showFlag={true} 
                      showNativeName={true}
                      className="justify-start"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Your language preference affects:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Interface text and labels</li>
                      <li>Date and time formatting</li>
                      <li>Number formatting</li>
                      <li>Currency display</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currency Settings */}
          <TabsContent value="currency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Currency Preferences</CardTitle>
                <CardDescription>Set your preferred currency for price display.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Currency
                    </label>
                    <CurrencySelector 
                      variant="inline" 
                      showSymbol={true}
                      className="justify-start"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Your currency preference affects:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Price display throughout the platform</li>
                      <li>Payment processing</li>
                      <li>Financial reports and analytics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
