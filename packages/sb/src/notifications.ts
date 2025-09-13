import { createClient } from './client';
import { NotificationType, NotificationChannel, NotificationStatus } from '@ciuna/types';
import { 
  NotificationProviderFactory, 
  NotificationTemplateEngine 
} from './notification-providers';

const supabase = createClient();

export interface NotificationData {
  [key: string]: any;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  data?: NotificationData;
  scheduledFor?: Date;
}

export interface NotificationTemplate {
  id: number;
  type: NotificationType;
  channel: NotificationChannel;
  language_code: string;
  subject?: string;
  title: string;
  content: string;
  variables: Record<string, any>;
  is_active: boolean;
}

export interface UserNotification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject?: string;
  title: string;
  content: string;
  data: NotificationData;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export class NotificationService {
  /**
   * Initialize notification providers
   */
  static initializeProviders(config: {
    twilio: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    };
    sendgrid: {
      apiKey: string;
      fromEmail: string;
      fromName: string;
    };
    firebase: {
      serverKey: string;
      projectId: string;
    };
  }): void {
    NotificationProviderFactory.initialize(config);
  }

  /**
   * Send multi-channel notification
   */
  static async sendMultiChannelNotification(
    recipientId: string,
    type: NotificationType,
    title: string,
    message: string,
    channels: NotificationChannel[],
    data?: Record<string, any>
  ): Promise<{ success: boolean; results: any[] }> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(recipientId);
      if (!preferences || preferences.length === 0) {
        // Create default preferences if none exist
        await this.createDefaultPreferences(recipientId);
      }

      // Filter channels based on user preferences
      const enabledChannels = channels.filter(channel => {
        const pref = preferences?.find(p => p.channel === channel && p.type === type);
        return pref ? pref.enabled : true; // Default to enabled if no preference found
      });

      if (enabledChannels.length === 0) {
        return { success: false, results: [] };
      }

      // Create notification record
      const notificationId = await this.createNotification({
        userId: recipientId,
        type,
        channel: enabledChannels[0], // Primary channel
        title,
        content: message,
        data
      });

      if (!notificationId) {
        throw new Error('Failed to create notification');
      }

      // Send via external providers
      const results = [];
      for (const channel of enabledChannels) {
        try {
          let result;
          switch (channel) {
            case 'EMAIL':
              result = await this.sendEmail(
                data?.email || `${recipientId}@example.com`, // Fallback email
                title,
                message,
                data
              );
              break;
            case 'SMS':
              result = await this.sendSMS(
                data?.phone || '+1234567890', // Fallback phone
                message,
                data
              );
              break;
            case 'PUSH':
              result = await this.sendPush(
                data?.deviceToken || 'default_token', // Fallback token
                title,
                message,
                data
              );
              break;
            case 'IN_APP':
              // In-app notifications are handled by the frontend
              result = true;
              break;
          }
          results.push({ channel, success: result, result: result ? 'sent' : 'failed' });
        } catch (error) {
          results.push({ channel, success: false, error: error.message });
        }
      }

      // Update notification status
      const allSuccessful = results.every(r => r.success);
      await this.updateNotificationStatus(notificationId, allSuccessful ? 'SENT' : 'FAILED');

      return { success: allSuccessful, results };
    } catch (error) {
      console.error('Error sending multi-channel notification:', error);
      return { success: false, results: [] };
    }
  }

  /**
   * Send templated notification
   */
  static async sendTemplatedNotification(
    recipientId: string,
    templateName: string,
    variables: Record<string, any>,
    channels: NotificationChannel[],
    data?: Record<string, any>
  ): Promise<{ success: boolean; results: any[] }> {
    try {
      // Get template from database
      const templates = await this.getTemplates();
      const template = templates.find(t => 
        t.title.toLowerCase().includes(templateName.toLowerCase()) && 
        t.is_active
      );

      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      // Render template with variables
      const renderedTitle = NotificationTemplateEngine.renderTemplate(template.title, variables);
      const renderedContent = NotificationTemplateEngine.renderTemplate(template.content, variables);
      const renderedSubject = template.subject ? 
        NotificationTemplateEngine.renderTemplate(template.subject, variables) : 
        renderedTitle;

      // Send notification
      return await this.sendMultiChannelNotification(
        recipientId,
        template.type,
        renderedTitle,
        renderedContent,
        channels,
        { ...data, template: templateName, variables, subject: renderedSubject }
      );
    } catch (error) {
      console.error('Error sending templated notification:', error);
      return { success: false, results: [] };
    }
  }

  /**
   * Create default notification preferences for user
   */
  private static async createDefaultPreferences(userId: string): Promise<void> {
    const defaultPreferences = [
      { type: 'ORDER_UPDATE' as NotificationType, channel: 'EMAIL' as NotificationChannel, enabled: true },
      { type: 'ORDER_UPDATE' as NotificationType, channel: 'PUSH' as NotificationChannel, enabled: true },
      { type: 'MESSAGE' as NotificationType, channel: 'PUSH' as NotificationChannel, enabled: true },
      { type: 'MESSAGE' as NotificationType, channel: 'IN_APP' as NotificationChannel, enabled: true },
      { type: 'PAYMENT_RECEIVED' as NotificationType, channel: 'EMAIL' as NotificationChannel, enabled: true },
      { type: 'PAYMENT_RECEIVED' as NotificationType, channel: 'SMS' as NotificationChannel, enabled: false },
      { type: 'SECURITY_ALERT' as NotificationType, channel: 'EMAIL' as NotificationChannel, enabled: true },
      { type: 'SECURITY_ALERT' as NotificationType, channel: 'SMS' as NotificationChannel, enabled: true },
    ];

    await this.updateUserPreferences(userId, defaultPreferences);
  }

  /**
   * Update notification status
   */
  private static async updateNotificationStatus(
    notificationId: string, 
    status: NotificationStatus
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          status,
          sent_at: status === 'SENT' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error updating notification status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateNotificationStatus:', error);
      return false;
    }
  }
  /**
   * Create a new notification
   */
  static async createNotification(params: CreateNotificationParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: params.userId,
        p_type: params.type,
        p_channel: params.channel,
        p_title: params.title,
        p_content: params.content,
        p_data: params.data || {},
        p_scheduled_for: params.scheduledFor?.toISOString() || new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<UserNotification[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_notifications', {
        p_user_id: userId,
        p_limit: options.limit || 50,
        p_offset: options.offset || 0,
        p_unread_only: options.unreadOnly || false,
      });

      if (error) {
        console.error('Error getting user notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
      });

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * Get notification templates
   */
  static async getTemplates(
    type?: NotificationType,
    channel?: NotificationChannel,
    languageCode: string = 'en'
  ): Promise<NotificationTemplate[]> {
    try {
      let query = supabase
        .from('notification_templates')
        .select('*')
        .eq('language_code', languageCode)
        .eq('is_active', true);

      if (type) {
        query = query.eq('type', type);
      }

      if (channel) {
        query = query.eq('channel', channel);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting notification templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTemplates:', error);
      return [];
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Array<{
      type: NotificationType;
      channel: NotificationChannel;
      enabled: boolean;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert(
          preferences.map(pref => ({
            user_id: userId,
            type: pref.type,
            channel: pref.channel,
            enabled: pref.enabled,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'user_id,type,channel' }
        );

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return false;
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<Array<{
    type: NotificationType;
    channel: NotificationChannel;
    enabled: boolean;
  }>> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('type, channel, enabled')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user preferences:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return [];
    }
  }

  /**
   * Send email notification
   */
  static async sendEmail(
    to: string,
    subject: string,
    content: string,
    templateData?: Record<string, any>
  ): Promise<boolean> {
    try {
      const emailProvider = NotificationProviderFactory.getEmailProvider();
      
      // Render HTML content if template data is provided
      let htmlContent = content;
      if (templateData) {
        htmlContent = NotificationTemplateEngine.renderTemplate(content, templateData);
        subject = NotificationTemplateEngine.renderTemplate(subject, templateData);
      }

      const result = await emailProvider.sendEmail(
        to,
        subject,
        htmlContent,
        content // text fallback
      );

      return result.success;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMS(
    to: string,
    content: string,
    templateData?: Record<string, any>
  ): Promise<boolean> {
    try {
      const smsProvider = NotificationProviderFactory.getSMSProvider();
      
      // Render content if template data is provided
      let renderedContent = content;
      if (templateData) {
        renderedContent = NotificationTemplateEngine.renderTemplate(content, templateData);
      }

      const result = await smsProvider.sendSMS(to, renderedContent);

      return result.success;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  static async sendPush(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      const fcmProvider = NotificationProviderFactory.getFCMProvider();
      
      // Render content if template data is provided
      let renderedTitle = title;
      let renderedBody = body;
      if (data) {
        renderedTitle = NotificationTemplateEngine.renderTemplate(title, data);
        renderedBody = NotificationTemplateEngine.renderTemplate(body, data);
      }

      const result = await fcmProvider.sendPushNotification(
        deviceToken,
        renderedTitle,
        renderedBody,
        data
      );

      return result.success;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Process notification queue (to be called by background job)
   */
  static async processQueue(): Promise<void> {
    try {
      // Get pending notifications from queue
      const { data: queueItems, error } = await supabase
        .from('notification_queues')
        .select(`
          *,
          notifications (
            id,
            user_id,
            type,
            channel,
            subject,
            title,
            content,
            data,
            recipient_email,
            recipient_phone,
            recipient_device_token
          )
        `)
        .eq('status', 'PENDING')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error getting queue items:', error);
        return;
      }

      if (!queueItems || queueItems.length === 0) {
        return;
      }

      // Process each notification
      for (const item of queueItems) {
        await this.processNotification(item);
      }
    } catch (error) {
      console.error('Error processing notification queue:', error);
    }
  }

  /**
   * Process individual notification
   */
  private static async processNotification(queueItem: any): Promise<void> {
    const notification = queueItem.notifications;
    if (!notification) return;

    try {
      // Update queue item status
      await supabase
        .from('notification_queues')
        .update({ status: 'PROCESSING' })
        .eq('id', queueItem.id);

      let success = false;

      // Send based on channel
      switch (notification.channel) {
        case 'EMAIL':
          success = await this.sendEmail(
            notification.recipient_email,
            notification.subject || notification.title,
            notification.content,
            notification.data
          );
          break;
        case 'SMS':
          success = await this.sendSMS(
            notification.recipient_phone,
            notification.content,
            notification.data
          );
          break;
        case 'PUSH':
          success = await this.sendPush(
            notification.recipient_device_token,
            notification.title,
            notification.content,
            notification.data
          );
          break;
        case 'IN_APP':
          // In-app notifications are handled by the frontend
          success = true;
          break;
      }

      // Update notification status
      const status = success ? 'SENT' : 'FAILED';
      const updateData: any = {
        status,
        sent_at: success ? new Date().toISOString() : null,
        failed_at: success ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!success) {
        updateData.failure_reason = 'Failed to send notification';
        updateData.retry_count = queueItem.attempts + 1;
      }

      await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', notification.id);

      // Update queue item status
      await supabase
        .from('notification_queues')
        .update({
          status: success ? 'COMPLETED' : 'FAILED',
          attempts: queueItem.attempts + 1,
          error_message: success ? null : 'Failed to send notification',
        })
        .eq('id', queueItem.id);

    } catch (error) {
      console.error('Error processing notification:', error);
      
      // Mark as failed
      await supabase
        .from('notifications')
        .update({
          status: 'FAILED',
          failed_at: new Date().toISOString(),
          failure_reason: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notification.id);

      await supabase
        .from('notification_queues')
        .update({
          status: 'FAILED',
          attempts: queueItem.attempts + 1,
          error_message: error.message,
        })
        .eq('id', queueItem.id);
    }
  }
}
