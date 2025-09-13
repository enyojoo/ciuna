import { supabase } from './client';

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

export class AnalyticsService {
  /**
   * Track a custom analytics event
   */
  static async trackEvent(event: AnalyticsEvent): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('track_event', {
        p_user_id: event.user_id || null,
        p_session_id: event.session_id || null,
        p_event_type: event.event_type,
        p_event_category: event.event_category,
        p_event_action: event.event_action,
        p_event_label: event.event_label || null,
        p_event_value: event.event_value || null,
        p_properties: event.properties || {},
        p_page_url: event.page_url || null,
        p_referrer: event.referrer || null,
        p_user_agent: event.user_agent || null,
        p_ip_address: event.ip_address || null,
        p_country_code: event.country_code || null,
        p_city: event.city || null,
        p_device_type: event.device_type || null,
        p_browser: event.browser || null,
        p_os: event.os || null,
      });

      if (error) {
        console.error('Error tracking event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in trackEvent:', error);
      return null;
    }
  }

  /**
   * Track a conversion event
   */
  static async trackConversion(event: ConversionEvent): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('track_conversion', {
        p_user_id: event.user_id || null,
        p_session_id: event.session_id || null,
        p_conversion_type: event.conversion_type,
        p_conversion_value: event.conversion_value || null,
        p_currency_code: event.currency_code || 'RUB',
        p_item_id: event.item_id || null,
        p_item_type: event.item_type || null,
        p_properties: event.properties || {},
      });

      if (error) {
        console.error('Error tracking conversion:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in trackConversion:', error);
      return null;
    }
  }

  /**
   * Track a page view
   */
  static async trackPageView(pageView: PageView): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('page_views')
        .insert({
          user_id: pageView.user_id || null,
          session_id: pageView.session_id || null,
          page_path: pageView.page_path,
          page_title: pageView.page_title || null,
          page_category: pageView.page_category || null,
          referrer: pageView.referrer || null,
          utm_source: pageView.utm_source || null,
          utm_medium: pageView.utm_medium || null,
          utm_campaign: pageView.utm_campaign || null,
          utm_term: pageView.utm_term || null,
          utm_content: pageView.utm_content || null,
          duration_seconds: pageView.duration_seconds || null,
          scroll_depth: pageView.scroll_depth || null,
          exit_page: pageView.exit_page || false,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking page view:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in trackPageView:', error);
      return null;
    }
  }

  /**
   * Track performance metrics
   */
  static async trackPerformance(metric: PerformanceMetric): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .insert({
          page_path: metric.page_path || null,
          load_time_ms: metric.load_time_ms || null,
          first_contentful_paint_ms: metric.first_contentful_paint_ms || null,
          largest_contentful_paint_ms: metric.largest_contentful_paint_ms || null,
          first_input_delay_ms: metric.first_input_delay_ms || null,
          cumulative_layout_shift: metric.cumulative_layout_shift || null,
          time_to_interactive_ms: metric.time_to_interactive_ms || null,
          user_id: metric.user_id || null,
          session_id: metric.session_id || null,
          device_type: metric.device_type || null,
          browser: metric.browser || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking performance metric:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in trackPerformance:', error);
      return null;
    }
  }

  /**
   * Track an error event
   */
  static async trackError(errorEvent: ErrorEvent): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('error_events')
        .insert({
          user_id: errorEvent.user_id || null,
          session_id: errorEvent.session_id || null,
          error_type: errorEvent.error_type,
          error_message: errorEvent.error_message,
          error_stack: errorEvent.error_stack || null,
          page_url: errorEvent.page_url || null,
          user_agent: errorEvent.user_agent || null,
          properties: errorEvent.properties || {},
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking error event:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in trackError:', error);
      return null;
    }
  }

  /**
   * Get analytics dashboard data
   */
  static async getDashboardData(
    startDate: Date,
    endDate: Date
  ): Promise<any | null> {
    try {
      const { data, error } = await supabase.rpc('get_analytics_dashboard_data', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) {
        console.error('Error getting dashboard data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return null;
    }
  }

  /**
   * Get user analytics data
   */
  static async getUserAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any | null> {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting user analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      return null;
    }
  }

  /**
   * Get conversion funnel data
   */
  static async getConversionFunnel(
    startDate: Date,
    endDate: Date
  ): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('conversion_events')
        .select('conversion_type, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting conversion funnel:', error);
        return null;
      }

      // Process data to create funnel
      const funnel = data.reduce((acc: any, event: any) => {
        const date = new Date(event.created_at).toDateString();
        if (!acc[date]) {
          acc[date] = {};
        }
        if (!acc[date][event.conversion_type]) {
          acc[date][event.conversion_type] = 0;
        }
        acc[date][event.conversion_type]++;
        return acc;
      }, {});

      return funnel;
    } catch (error) {
      console.error('Error in getConversionFunnel:', error);
      return null;
    }
  }

  /**
   * Get real-time metrics
   */
  static async getRealTimeMetrics(): Promise<any | null> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const { data, error } = await supabase.rpc('get_analytics_dashboard_data', {
        p_start_date: oneHourAgo.toISOString(),
        p_end_date: now.toISOString(),
      });

      if (error) {
        console.error('Error getting real-time metrics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getRealTimeMetrics:', error);
      return null;
    }
  }
}

// Utility functions for common tracking scenarios
export const trackUserAction = (action: string, category: string, label?: string, value?: number) => {
  return AnalyticsService.trackEvent({
    event_type: 'user_action',
    event_category: category,
    event_action: action,
    event_label: label,
    event_value: value,
  });
};

export const trackPageView = (path: string, title?: string, category?: string) => {
  return AnalyticsService.trackPageView({
    page_path: path,
    page_title: title,
    page_category: category,
  });
};

export const trackConversion = (
  type: ConversionEvent['conversion_type'],
  value?: number,
  currency?: string,
  itemId?: string,
  itemType?: string
) => {
  return AnalyticsService.trackConversion({
    conversion_type: type,
    conversion_value: value,
    currency_code: currency,
    item_id: itemId,
    item_type: itemType,
  });
};

export const trackError = (error: Error, context?: string) => {
  return AnalyticsService.trackError({
    error_type: error.name,
    error_message: error.message,
    error_stack: error.stack,
    page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    properties: { context },
  });
};
