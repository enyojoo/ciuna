export declare class TwilioSMSProvider {
    private accountSid;
    private authToken;
    private fromNumber;
    constructor(accountSid: string, authToken: string, fromNumber: string);
    sendSMS(to: string, message: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
export declare class SendGridEmailProvider {
    private apiKey;
    private fromEmail;
    private fromName;
    constructor(apiKey: string, fromEmail: string, fromName: string);
    sendEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
export declare class FCMProvider {
    private serverKey;
    private projectId;
    constructor(serverKey: string, projectId: string);
    sendPushNotification(deviceToken: string, title: string, body: string, data?: Record<string, string>): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendToMultipleDevices(deviceTokens: string[], title: string, body: string, data?: Record<string, string>): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
export declare class NotificationProviderFactory {
    private static smsProvider;
    private static emailProvider;
    private static fcmProvider;
    static initialize(config: {
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
    static getSMSProvider(): TwilioSMSProvider;
    static getEmailProvider(): SendGridEmailProvider;
    static getFCMProvider(): FCMProvider;
}
export declare class NotificationTemplateEngine {
    static renderTemplate(template: string, variables: Record<string, any>): string;
    static renderEmailTemplate(subject: string, htmlContent: string, textContent: string, variables: Record<string, any>): {
        subject: string;
        htmlContent: string;
        textContent: string;
    };
}
//# sourceMappingURL=notification-providers.d.ts.map