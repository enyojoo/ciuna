import { NotificationType, NotificationChannel, NotificationStatus } from '@ciuna/types';
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
export declare class NotificationService {
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
    }): void;
    /**
     * Send multi-channel notification
     */
    static sendMultiChannelNotification(recipientId: string, type: NotificationType, title: string, message: string, channels: NotificationChannel[], data?: Record<string, any>): Promise<{
        success: boolean;
        results: any[];
    }>;
    /**
     * Send templated notification
     */
    static sendTemplatedNotification(recipientId: string, templateName: string, variables: Record<string, any>, channels: NotificationChannel[], data?: Record<string, any>): Promise<{
        success: boolean;
        results: any[];
    }>;
    /**
     * Create default notification preferences for user
     */
    private static createDefaultPreferences;
    /**
     * Update notification status
     */
    private static updateNotificationStatus;
    /**
     * Create a new notification
     */
    static createNotification(params: CreateNotificationParams): Promise<string | null>;
    /**
     * Get user notifications
     */
    static getUserNotifications(userId: string, options?: {
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
    }): Promise<UserNotification[]>;
    /**
     * Mark notification as read
     */
    static markAsRead(notificationId: string): Promise<boolean>;
    /**
     * Get notification templates
     */
    static getTemplates(type?: NotificationType, channel?: NotificationChannel, languageCode?: string): Promise<NotificationTemplate[]>;
    /**
     * Update user notification preferences
     */
    static updateUserPreferences(userId: string, preferences: Array<{
        type: NotificationType;
        channel: NotificationChannel;
        enabled: boolean;
    }>): Promise<boolean>;
    /**
     * Get user notification preferences
     */
    static getUserPreferences(userId: string): Promise<Array<{
        type: NotificationType;
        channel: NotificationChannel;
        enabled: boolean;
    }>>;
    /**
     * Send email notification
     */
    static sendEmail(to: string, subject: string, content: string, templateData?: Record<string, any>): Promise<boolean>;
    /**
     * Send SMS notification
     */
    static sendSMS(to: string, content: string, templateData?: Record<string, any>): Promise<boolean>;
    /**
     * Send push notification
     */
    static sendPush(deviceToken: string, title: string, body: string, data?: Record<string, any>): Promise<boolean>;
    /**
     * Process notification queue (to be called by background job)
     */
    static processQueue(): Promise<void>;
    /**
     * Process individual notification
     */
    private static processNotification;
}
//# sourceMappingURL=notifications.d.ts.map