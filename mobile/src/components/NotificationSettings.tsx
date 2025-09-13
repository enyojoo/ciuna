import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NotificationService, NotificationPermissions } from '../services/notifications';
import { Ionicons } from '@expo/vector-icons';

interface NotificationSettingsProps {
  onClose?: () => void;
}

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'push' | 'email' | 'sms';
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [permissions, setPermissions] = useState<NotificationPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'messages',
      title: 'Messages',
      description: 'Get notified about new messages and conversations',
      enabled: true,
      type: 'push',
    },
    {
      id: 'orders',
      title: 'Orders',
      description: 'Updates about your orders and transactions',
      enabled: true,
      type: 'push',
    },
    {
      id: 'listings',
      title: 'Listings',
      description: 'Notifications about your listings and inquiries',
      enabled: true,
      type: 'push',
    },
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Promotional offers and platform updates',
      enabled: false,
      type: 'push',
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Important security alerts and account updates',
      enabled: true,
      type: 'push',
    },
    {
      id: 'email_messages',
      title: 'Email Messages',
      description: 'Receive message notifications via email',
      enabled: false,
      type: 'email',
    },
    {
      id: 'email_orders',
      title: 'Email Orders',
      description: 'Receive order updates via email',
      enabled: true,
      type: 'email',
    },
    {
      id: 'sms_orders',
      title: 'SMS Orders',
      description: 'Receive critical order updates via SMS',
      enabled: false,
      type: 'sms',
    },
  ]);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const notificationPermissions = await NotificationService.checkPermissions();
      setPermissions(notificationPermissions);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const newPermissions = await NotificationService.requestPermissions();
      setPermissions(newPermissions);
      
      if (newPermissions.granted) {
        Alert.alert('Success', 'Notification permissions granted!');
      } else {
        Alert.alert(
          'Permission Denied',
          'Notification permissions are required to receive updates. You can enable them in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // In a real app, you would open device settings
              console.log('Open device settings');
            }},
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions');
    }
  };

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const testNotification = async () => {
    try {
      const success = await NotificationService.testNotification();
      if (success) {
        Alert.alert('Success', 'Test notification sent!');
      } else {
        Alert.alert('Error', 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const clearBadge = async () => {
    try {
      await NotificationService.clearBadge();
      Alert.alert('Success', 'Notification badge cleared');
    } catch (error) {
      console.error('Error clearing badge:', error);
      Alert.alert('Error', 'Failed to clear notification badge');
    }
  };

  const getPreferenceIcon = (type: string) => {
    switch (type) {
      case 'push':
        return 'notifications';
      case 'email':
        return 'mail';
      case 'sms':
        return 'chatbubble';
      default:
        return 'notifications';
    }
  };

  const getPreferenceColor = (type: string) => {
    switch (type) {
      case 'push':
        return '#007AFF';
      case 'email':
        return '#FF9500';
      case 'sms':
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  const renderPreference = (preference: NotificationPreference) => (
    <View key={preference.id} style={styles.preferenceItem}>
      <View style={styles.preferenceIcon}>
        <Ionicons
          name={getPreferenceIcon(preference.type) as any}
          size={24}
          color={getPreferenceColor(preference.type)}
        />
      </View>
      
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{preference.title}</Text>
        <Text style={styles.preferenceDescription}>{preference.description}</Text>
      </View>
      
      <Switch
        value={preference.enabled}
        onValueChange={() => togglePreference(preference.id)}
        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        thumbColor={preference.enabled ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      {/* Permission Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.permissionItem}>
          <View style={styles.permissionIcon}>
            <Ionicons
              name={permissions?.granted ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={permissions?.granted ? '#34C759' : '#FF3B30'}
            />
          </View>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>
              {permissions?.granted ? 'Notifications Enabled' : 'Notifications Disabled'}
            </Text>
            <Text style={styles.permissionDescription}>
              {permissions?.granted
                ? 'You will receive push notifications'
                : 'Enable notifications to receive updates'
              }
            </Text>
          </View>
          {!permissions?.granted && (
            <TouchableOpacity style={styles.enableButton} onPress={requestPermissions}>
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Push Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        {preferences
          .filter(pref => pref.type === 'push')
          .map(renderPreference)}
      </View>

      {/* Email Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Notifications</Text>
        {preferences
          .filter(pref => pref.type === 'email')
          .map(renderPreference)}
      </View>

      {/* SMS Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SMS Notifications</Text>
        {preferences
          .filter(pref => pref.type === 'sms')
          .map(renderPreference)}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={testNotification}>
          <Ionicons name="send" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={clearBadge}>
          <Ionicons name="trash" size={20} color="#FF3B30" />
          <Text style={styles.actionButtonText}>Clear Badge</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Notification preferences are synced across all your devices.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  section: {
    marginTop: 20,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  permissionIcon: {
    marginRight: 15,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  preferenceIcon: {
    marginRight: 15,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
