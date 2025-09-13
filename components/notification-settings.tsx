'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Switch } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { NotificationType, NotificationChannel } from '@ciuna/types';

interface NotificationPreference {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

interface NotificationSettingsProps {
  userId: string;
}

const NOTIFICATION_TYPES: { [key in NotificationType]: { label: string; description: string } } = {
  ORDER_UPDATE: { label: 'Order Updates', description: 'Updates about your orders and purchases' },
  MESSAGE: { label: 'Messages', description: 'New messages from other users' },
  BOOKING_CONFIRMATION: { label: 'Booking Confirmations', description: 'Service booking confirmations' },
  DEAL_CLOSED: { label: 'Deal Closed', description: 'When a deal is completed' },
  ADMIN_ALERT: { label: 'Admin Alerts', description: 'Important system announcements' },
  PROMOTION: { label: 'Promotions', description: 'Special offers and promotions' },
  PAYMENT_RECEIVED: { label: 'Payment Received', description: 'When you receive payments' },
  PAYMENT_SENT: { label: 'Payment Sent', description: 'When you send payments' },
  SHIPPING_UPDATE: { label: 'Shipping Updates', description: 'Updates about shipping and delivery' },
  REVIEW_REQUEST: { label: 'Review Requests', description: 'Requests to review purchases' },
  LISTING_APPROVED: { label: 'Listing Approved', description: 'When your listings are approved' },
  LISTING_REJECTED: { label: 'Listing Rejected', description: 'When your listings are rejected' },
  VENDOR_APPROVED: { label: 'Vendor Approved', description: 'When your vendor application is approved' },
  VENDOR_REJECTED: { label: 'Vendor Rejected', description: 'When your vendor application is rejected' },
  SERVICE_BOOKING: { label: 'Service Bookings', description: 'New service booking requests' },
  GROUP_BUY_UPDATE: { label: 'Group Buy Updates', description: 'Updates about group buying opportunities' },
  SECURITY_ALERT: { label: 'Security Alerts', description: 'Important security notifications' },
  WELCOME: { label: 'Welcome Messages', description: 'Welcome and onboarding messages' },
  PASSWORD_RESET: { label: 'Password Reset', description: 'Password reset notifications' },
  EMAIL_VERIFICATION: { label: 'Email Verification', description: 'Email verification requests' }
};

const CHANNELS: { [key in NotificationChannel]: { label: string; description: string } } = {
  EMAIL: { label: 'Email', description: 'Receive notifications via email' },
  SMS: { label: 'SMS', description: 'Receive notifications via text message' },
  PUSH: { label: 'Push', description: 'Receive push notifications on your device' },
  IN_APP: { label: 'In-App', description: 'Show notifications within the app' }
};

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/user/notification-preferences?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (type: NotificationType, channel: NotificationChannel, enabled: boolean) => {
    setPreferences(prev => {
      const existing = prev.find(p => p.type === type && p.channel === channel);
      if (existing) {
        return prev.map(p => 
          p.type === type && p.channel === channel 
            ? { ...p, enabled }
            : p
        );
      } else {
        return [...prev, { type, channel, enabled }];
      }
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences: preferences.map(p => ({
            type: p.type,
            channel: p.channel,
            enabled: p.enabled
          }))
        }),
      });

      if (response.ok) {
        // Show success message
        console.log('Preferences saved successfully');
      } else {
        console.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPreference = (type: NotificationType, channel: NotificationChannel): boolean => {
    const pref = preferences.find(p => p.type === type && p.channel === channel);
    return pref ? pref.enabled : true; // Default to enabled
  };

  const notificationCategories = {
    'Orders & Payments': ['ORDER_UPDATE', 'PAYMENT_RECEIVED', 'PAYMENT_SENT', 'SHIPPING_UPDATE'],
    'Messages & Communication': ['MESSAGE', 'BOOKING_CONFIRMATION', 'SERVICE_BOOKING'],
    'Listings & Vendors': ['LISTING_APPROVED', 'LISTING_REJECTED', 'VENDOR_APPROVED', 'VENDOR_REJECTED'],
    'Security & Account': ['SECURITY_ALERT', 'WELCOME', 'PASSWORD_RESET', 'EMAIL_VERIFICATION'],
    'Promotions & Updates': ['PROMOTION', 'ADMIN_ALERT', 'GROUP_BUY_UPDATE', 'REVIEW_REQUEST', 'DEAL_CLOSED']
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Loading your notification preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Choose how you want to be notified about different activities on Ciuna.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="push">Push</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="inapp">In-App</TabsTrigger>
          </TabsList>

          {Object.entries(CHANNELS).map(([channelKey, channelInfo]) => (
            <TabsContent key={channelKey} value={channelKey.toLowerCase()}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{channelInfo.label} Notifications</h3>
                  <p className="text-sm text-gray-600">{channelInfo.description}</p>
                </div>

                {Object.entries(notificationCategories).map(([categoryName, types]) => (
                  <div key={categoryName} className="space-y-4">
                    <h4 className="font-medium text-gray-900">{categoryName}</h4>
                    <div className="space-y-3">
                      {types.map((type) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {NOTIFICATION_TYPES[type as NotificationType].label}
                            </div>
                            <div className="text-sm text-gray-600">
                              {NOTIFICATION_TYPES[type as NotificationType].description}
                            </div>
                          </div>
                          <Switch
                            checked={getPreference(type as NotificationType, channelKey as NotificationChannel)}
                            onCheckedChange={(enabled) => 
                              updatePreference(type as NotificationType, channelKey as NotificationChannel, enabled)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end mt-6 pt-6 border-t">
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
