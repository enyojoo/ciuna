import { z } from 'zod';
export const NotificationTypeSchema = z.enum([
    'ORDER_UPDATE',
    'MESSAGE',
    'BOOKING_CONFIRMATION',
    'DEAL_CLOSED',
    'ADMIN_ALERT',
    'PROMOTION',
    'PAYMENT_RECEIVED',
    'PAYMENT_SENT',
    'SHIPPING_UPDATE',
    'REVIEW_REQUEST',
    'LISTING_APPROVED',
    'LISTING_REJECTED',
    'VENDOR_APPROVED',
    'VENDOR_REJECTED',
    'SERVICE_BOOKING',
    'GROUP_BUY_UPDATE',
    'SECURITY_ALERT',
    'WELCOME',
    'PASSWORD_RESET',
    'EMAIL_VERIFICATION'
]);
export const NotificationChannelSchema = z.enum([
    'EMAIL',
    'SMS',
    'PUSH',
    'IN_APP'
]);
export const NotificationStatusSchema = z.enum([
    'PENDING',
    'SENT',
    'FAILED',
    'DELIVERED',
    'READ'
]);
export const NotificationSchema = z.object({
    id: z.string().uuid(),
    recipient_id: z.string().uuid(),
    type: NotificationTypeSchema,
    channel: NotificationChannelSchema,
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(1000),
    data: z.record(z.any()).optional(),
    status: NotificationStatusSchema.default('PENDING'),
    sent_at: z.string().datetime().nullable(),
    read_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});
export const NotificationPreferenceSchema = z.object({
    profile_id: z.string().uuid(),
    email_enabled: z.boolean().default(true),
    push_enabled: z.boolean().default(true),
    sms_enabled: z.boolean().default(false),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});
export const NotificationTemplateSchema = z.object({
    id: z.number().int().positive(),
    type: NotificationTypeSchema,
    channel: NotificationChannelSchema,
    language_code: z.string().length(2),
    subject: z.string().optional(),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    html_content: z.string().optional(),
    variables: z.array(z.string()).default([]),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});
export const UserNotificationPreferenceSchema = z.object({
    user_id: z.string().uuid(),
    type: NotificationTypeSchema,
    channel: NotificationChannelSchema,
    enabled: z.boolean().default(true),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});
//# sourceMappingURL=notifications.js.map