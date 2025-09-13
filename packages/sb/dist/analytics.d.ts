export interface AnalyticsEvent {
    user_id?: string;
    session_id?: string;
    event_type: string;
    event_category: string;
    event_action: string;
    event_label?: string;
    event_value?: number;
    properties?: Record<string, any>;
    page_url?: string;
    referrer?: string;
    user_agent?: string;
    ip_address?: string;
    country_code?: string;
    city?: string;
    device_type?: string;
    browser?: string;
    os?: string;
}
export interface ConversionEvent {
    user_id?: string;
    session_id?: string;
    conversion_type: 'LISTING_CREATED' | 'LISTING_PURCHASED' | 'VENDOR_REGISTERED' | 'SERVICE_BOOKED' | 'PAYMENT_COMPLETED' | 'REVIEW_SUBMITTED' | 'MESSAGE_SENT' | 'PROFILE_COMPLETED';
    conversion_value?: number;
    currency_code?: string;
    item_id?: string;
    item_type?: string;
    properties?: Record<string, any>;
}
export interface PageView {
    user_id?: string;
    session_id?: string;
    page_path: string;
    page_title?: string;
    page_category?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    duration_seconds?: number;
    scroll_depth?: number;
    exit_page?: boolean;
}
export interface PerformanceMetric {
    page_path?: string;
    load_time_ms?: number;
    first_contentful_paint_ms?: number;
    largest_contentful_paint_ms?: number;
    first_input_delay_ms?: number;
    cumulative_layout_shift?: number;
    time_to_interactive_ms?: number;
    user_id?: string;
    session_id?: string;
    device_type?: string;
    browser?: string;
}
export interface ErrorEvent {
    user_id?: string;
    session_id?: string;
    error_type: string;
    error_message: string;
    error_stack?: string;
    page_url?: string;
    user_agent?: string;
    properties?: Record<string, any>;
}
export declare class AnalyticsService {
    /**
     * Track a custom analytics event
     */
    static trackEvent(event: AnalyticsEvent): Promise<string | null>;
    /**
     * Track a conversion event
     */
    static trackConversion(event: ConversionEvent): Promise<string | null>;
    /**
     * Track a page view
     */
    static trackPageView(pageView: PageView): Promise<string | null>;
    /**
     * Track performance metrics
     */
    static trackPerformance(metric: PerformanceMetric): Promise<string | null>;
    /**
     * Track an error event
     */
    static trackError(errorEvent: ErrorEvent): Promise<string | null>;
    /**
     * Get analytics dashboard data
     */
    static getDashboardData(startDate: Date, endDate: Date): Promise<any | null>;
    /**
     * Get user analytics data
     */
    static getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<any | null>;
    /**
     * Get conversion funnel data
     */
    static getConversionFunnel(startDate: Date, endDate: Date): Promise<any | null>;
    /**
     * Get real-time metrics
     */
    static getRealTimeMetrics(): Promise<any | null>;
}
export declare const trackUserAction: (action: string, category: string, label?: string, value?: number) => Promise<string | null>;
export declare const trackPageView: (path: string, title?: string, category?: string) => Promise<string | null>;
export declare const trackConversion: (type: ConversionEvent['conversion_type'], value?: number, currency?: string, itemId?: string, itemType?: string) => Promise<string | null>;
export declare const trackError: (error: Error, context?: string) => Promise<string | null>;
//# sourceMappingURL=analytics.d.ts.map