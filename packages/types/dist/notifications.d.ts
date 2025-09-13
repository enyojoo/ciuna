import { z } from 'zod';
export declare const NotificationTypeSchema: z.ZodEnum<["ORDER_UPDATE", "MESSAGE", "BOOKING_CONFIRMATION", "DEAL_CLOSED", "ADMIN_ALERT", "PROMOTION", "PAYMENT_RECEIVED", "PAYMENT_SENT", "SHIPPING_UPDATE", "REVIEW_REQUEST", "LISTING_APPROVED", "LISTING_REJECTED", "VENDOR_APPROVED", "VENDOR_REJECTED", "SERVICE_BOOKING", "GROUP_BUY_UPDATE", "SECURITY_ALERT", "WELCOME", "PASSWORD_RESET", "EMAIL_VERIFICATION"]>;
export declare const NotificationChannelSchema: z.ZodEnum<["EMAIL", "SMS", "PUSH", "IN_APP"]>;
export declare const NotificationStatusSchema: z.ZodEnum<["PENDING", "SENT", "FAILED", "DELIVERED", "READ"]>;
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    recipient_id: z.ZodString;
    type: z.ZodEnum<["ORDER_UPDATE", "MESSAGE", "BOOKING_CONFIRMATION", "DEAL_CLOSED", "ADMIN_ALERT", "PROMOTION", "PAYMENT_RECEIVED", "PAYMENT_SENT", "SHIPPING_UPDATE", "REVIEW_REQUEST", "LISTING_APPROVED", "LISTING_REJECTED", "VENDOR_APPROVED", "VENDOR_REJECTED", "SERVICE_BOOKING", "GROUP_BUY_UPDATE", "SECURITY_ALERT", "WELCOME", "PASSWORD_RESET", "EMAIL_VERIFICATION"]>;
    channel: z.ZodEnum<["EMAIL", "SMS", "PUSH", "IN_APP"]>;
    title: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "SENT", "FAILED", "DELIVERED", "READ"]>>;
    sent_at: z.ZodNullable<z.ZodString>;
    read_at: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    message: string;
    type: "ORDER_UPDATE" | "MESSAGE" | "BOOKING_CONFIRMATION" | "DEAL_CLOSED" | "ADMIN_ALERT" | "PROMOTION" | "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "SHIPPING_UPDATE" | "REVIEW_REQUEST" | "LISTING_APPROVED" | "LISTING_REJECTED" | "VENDOR_APPROVED" | "VENDOR_REJECTED" | "SERVICE_BOOKING" | "GROUP_BUY_UPDATE" | "SECURITY_ALERT" | "WELCOME" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";
    status: "PENDING" | "DELIVERED" | "SENT" | "FAILED" | "READ";
    title: string;
    sent_at: string | null;
    read_at: string | null;
    recipient_id: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
    data?: Record<string, any> | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    message: string;
    type: "ORDER_UPDATE" | "MESSAGE" | "BOOKING_CONFIRMATION" | "DEAL_CLOSED" | "ADMIN_ALERT" | "PROMOTION" | "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "SHIPPING_UPDATE" | "REVIEW_REQUEST" | "LISTING_APPROVED" | "LISTING_REJECTED" | "VENDOR_APPROVED" | "VENDOR_REJECTED" | "SERVICE_BOOKING" | "GROUP_BUY_UPDATE" | "SECURITY_ALERT" | "WELCOME" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";
    title: string;
    sent_at: string | null;
    read_at: string | null;
    recipient_id: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
    status?: "PENDING" | "DELIVERED" | "SENT" | "FAILED" | "READ" | undefined;
    data?: Record<string, any> | undefined;
}>;
export declare const NotificationPreferenceSchema: z.ZodObject<{
    profile_id: z.ZodString;
    email_enabled: z.ZodDefault<z.ZodBoolean>;
    push_enabled: z.ZodDefault<z.ZodBoolean>;
    sms_enabled: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    created_at: string;
    updated_at: string;
    profile_id: string;
    email_enabled: boolean;
    push_enabled: boolean;
    sms_enabled: boolean;
}, {
    created_at: string;
    updated_at: string;
    profile_id: string;
    email_enabled?: boolean | undefined;
    push_enabled?: boolean | undefined;
    sms_enabled?: boolean | undefined;
}>;
export declare const NotificationTemplateSchema: z.ZodObject<{
    id: z.ZodNumber;
    type: z.ZodEnum<["ORDER_UPDATE", "MESSAGE", "BOOKING_CONFIRMATION", "DEAL_CLOSED", "ADMIN_ALERT", "PROMOTION", "PAYMENT_RECEIVED", "PAYMENT_SENT", "SHIPPING_UPDATE", "REVIEW_REQUEST", "LISTING_APPROVED", "LISTING_REJECTED", "VENDOR_APPROVED", "VENDOR_REJECTED", "SERVICE_BOOKING", "GROUP_BUY_UPDATE", "SECURITY_ALERT", "WELCOME", "PASSWORD_RESET", "EMAIL_VERIFICATION"]>;
    channel: z.ZodEnum<["EMAIL", "SMS", "PUSH", "IN_APP"]>;
    language_code: z.ZodString;
    subject: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    content: z.ZodString;
    html_content: z.ZodOptional<z.ZodString>;
    variables: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string;
    updated_at: string;
    type: "ORDER_UPDATE" | "MESSAGE" | "BOOKING_CONFIRMATION" | "DEAL_CLOSED" | "ADMIN_ALERT" | "PROMOTION" | "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "SHIPPING_UPDATE" | "REVIEW_REQUEST" | "LISTING_APPROVED" | "LISTING_REJECTED" | "VENDOR_APPROVED" | "VENDOR_REJECTED" | "SERVICE_BOOKING" | "GROUP_BUY_UPDATE" | "SECURITY_ALERT" | "WELCOME" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";
    title: string;
    variables: string[];
    is_active: boolean;
    content: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
    language_code: string;
    subject?: string | undefined;
    html_content?: string | undefined;
}, {
    id: number;
    created_at: string;
    updated_at: string;
    type: "ORDER_UPDATE" | "MESSAGE" | "BOOKING_CONFIRMATION" | "DEAL_CLOSED" | "ADMIN_ALERT" | "PROMOTION" | "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "SHIPPING_UPDATE" | "REVIEW_REQUEST" | "LISTING_APPROVED" | "LISTING_REJECTED" | "VENDOR_APPROVED" | "VENDOR_REJECTED" | "SERVICE_BOOKING" | "GROUP_BUY_UPDATE" | "SECURITY_ALERT" | "WELCOME" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";
    title: string;
    content: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
    language_code: string;
    variables?: string[] | undefined;
    is_active?: boolean | undefined;
    subject?: string | undefined;
    html_content?: string | undefined;
}>;
export declare const UserNotificationPreferenceSchema: z.ZodObject<{
    user_id: z.ZodString;
    type: z.ZodEnum<["ORDER_UPDATE", "MESSAGE", "BOOKING_CONFIRMATION", "DEAL_CLOSED", "ADMIN_ALERT", "PROMOTION", "PAYMENT_RECEIVED", "PAYMENT_SENT", "SHIPPING_UPDATE", "REVIEW_REQUEST", "LISTING_APPROVED", "LISTING_REJECTED", "VENDOR_APPROVED", "VENDOR_REJECTED", "SERVICE_BOOKING", "GROUP_BUY_UPDATE", "SECURITY_ALERT", "WELCOME", "PASSWORD_RESET", "EMAIL_VERIFICATION"]>;
    channel: z.ZodEnum<["EMAIL", "SMS", "PUSH", "IN_APP"]>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    created_at: string;
    updated_at: string;
    type: "ORDER_UPDATE" | "MESSAGE" | "BOOKING_CONFIRMATION" | "DEAL_CLOSED" | "ADMIN_ALERT" | "PROMOTION" | "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "SHIPPING_UPDATE" | "REVIEW_REQUEST" | "LISTING_APPROVED" | "LISTING_REJECTED" | "VENDOR_APPROVED" | "VENDOR_REJECTED" | "SERVICE_BOOKING" | "GROUP_BUY_UPDATE" | "SECURITY_ALERT" | "WELCOME" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";
    user_id: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
    enabled: boolean;
}, {
    created_at: string;
    updated_at: string;
    type: "ORDER_UPDATE" | "MESSAGE" | "BOOKING_CONFIRMATION" | "DEAL_CLOSED" | "ADMIN_ALERT" | "PROMOTION" | "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "SHIPPING_UPDATE" | "REVIEW_REQUEST" | "LISTING_APPROVED" | "LISTING_REJECTED" | "VENDOR_APPROVED" | "VENDOR_REJECTED" | "SERVICE_BOOKING" | "GROUP_BUY_UPDATE" | "SECURITY_ALERT" | "WELCOME" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";
    user_id: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
    enabled?: boolean | undefined;
}>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
export type UserNotificationPreference = z.infer<typeof UserNotificationPreferenceSchema>;
//# sourceMappingURL=notifications.d.ts.map