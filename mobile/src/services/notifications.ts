import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  channelId?: string;
}

export interface ScheduledNotification {
  id: string;
  content: NotificationData;
  trigger: Notifications.NotificationTriggerInput;
}

export class NotificationService {
  private static expoPushToken: string | null = null;
  private static notificationListener: Notifications.Subscription | null = null;
  private static responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize notification service
   */
  static async initialize(): Promise<boolean> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request permissions
      const permissions = await this.requestPermissions();
      if (!permissions.granted) {
        return false;
      }

      // Get push token
      if (Device.isDevice) {
        this.expoPushToken = await this.getExpoPushToken();
      }

      // Set up listeners
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<NotificationPermissions> {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }

  /**
   * Check notification permissions
   */
  static async checkPermissions(): Promise<NotificationPermissions> {
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }

  /**
   * Get Expo push token
   */
  static async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      return token.data;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  /**
   * Send local notification
   */
  static async sendLocalNotification(
    notification: NotificationData
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          badge: notification.badge,
          priority: notification.priority || 'default',
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  /**
   * Schedule notification
   */
  static async scheduleNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          badge: notification.badge,
          priority: notification.priority || 'default',
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel notification
   */
  static async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return false;
    }
  }

  /**
   * Get scheduled notifications
   */
  static async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.map(notification => ({
        id: notification.identifier,
        content: notification.content as NotificationData,
        trigger: notification.trigger,
      }));
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Set notification badge count
   */
  static async setBadgeCount(count: number): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(count);
      return true;
    } catch (error) {
      console.error('Error setting badge count:', error);
      return false;
    }
  }

  /**
   * Clear notification badge
   */
  static async clearBadge(): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(0);
      return true;
    } catch (error) {
      console.error('Error clearing badge:', error);
      return false;
    }
  }

  /**
   * Set up notification listeners
   */
  private static setupNotificationListeners(): void {
    // Notification received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Handle notification received
      }
    );

    // Notification tapped/opened
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle notification response
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification response
   */
  private static handleNotificationResponse(
    response: Notifications.NotificationResponse
  ): void {
    const data = response.notification.request.content.data;
    
    // Navigate based on notification data
    if (data?.type === 'message') {
      // Navigate to messages
      console.log('Navigate to messages');
    } else if (data?.type === 'order') {
      // Navigate to order details
      console.log('Navigate to order:', data.orderId);
    } else if (data?.type === 'listing') {
      // Navigate to listing details
      console.log('Navigate to listing:', data.listingId);
    }
  }

  /**
   * Remove notification listeners
   */
  static removeNotificationListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Create notification channels (Android)
   */
  static async createNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Orders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('marketing', {
        name: 'Marketing',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  /**
   * Send notification to specific user
   */
  static async sendNotificationToUser(
    userId: string,
    notification: NotificationData,
    channelId?: string
  ): Promise<boolean> {
    try {
      // In a real implementation, you would send this to your backend
      // which would then send the push notification
      console.log('Sending notification to user:', userId, notification);
      return true;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }

  /**
   * Get notification settings
   */
  static async getNotificationSettings(): Promise<any> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  /**
   * Check if notifications are enabled
   */
  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.status === 'granted';
    } catch (error) {
      console.error('Error checking if notifications are enabled:', error);
      return false;
    }
  }

  /**
   * Get push token
   */
  static getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Test notification
   */
  static async testNotification(): Promise<boolean> {
    try {
      const notificationId = await this.sendLocalNotification({
        title: 'Test Notification',
        body: 'This is a test notification from Ciuna',
        data: { type: 'test' },
      });

      return !!notificationId;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}
