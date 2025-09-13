import { useCallback } from 'react';
import { AnalyticsService } from '@ciuna/sb';

interface UseAnalyticsOptions {
  userId?: string;
  sessionId?: string;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { userId, sessionId } = options;

  const trackEvent = useCallback(async (
    eventType: string,
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number,
    properties?: Record<string, any>
  ) => {
    try {
      await AnalyticsService.trackEvent({
        user_id: userId,
        session_id: sessionId,
        event_type: eventType,
        event_category: eventCategory,
        event_action: eventAction,
        event_label: eventLabel,
        event_value: eventValue,
        properties: properties || {},
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [userId, sessionId]);

  const trackPageView = useCallback(async (
    pagePath: string,
    pageTitle?: string,
    pageCategory?: string
  ) => {
    try {
      await AnalyticsService.trackPageView({
        user_id: userId,
        session_id: sessionId,
        page_path: pagePath,
        page_title: pageTitle,
        page_category: pageCategory,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [userId, sessionId]);

  const trackConversion = useCallback(async (
    conversionType: 'LISTING_CREATED' | 'LISTING_PURCHASED' | 'VENDOR_REGISTERED' | 'SERVICE_BOOKED' | 'PAYMENT_COMPLETED' | 'REVIEW_SUBMITTED' | 'MESSAGE_SENT' | 'PROFILE_COMPLETED',
    conversionValue?: number,
    currencyCode?: string,
    itemId?: string,
    itemType?: string,
    properties?: Record<string, any>
  ) => {
    try {
      await AnalyticsService.trackConversion({
        user_id: userId,
        session_id: sessionId,
        conversion_type: conversionType,
        conversion_value: conversionValue,
        currency_code: currencyCode,
        item_id: itemId,
        item_type: itemType,
        properties: properties || {},
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }, [userId, sessionId]);

  const trackError = useCallback(async (
    error: Error,
    context?: string
  ) => {
    try {
      await AnalyticsService.trackError({
        user_id: userId,
        session_id: sessionId,
        error_type: error.name,
        error_message: error.message,
        error_stack: error.stack,
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        properties: { context },
      });
    } catch (trackingError) {
      console.error('Error tracking error:', trackingError);
    }
  }, [userId, sessionId]);

  const trackPerformance = useCallback(async (
    loadTime: number,
    firstContentfulPaint?: number,
    largestContentfulPaint?: number,
    firstInputDelay?: number,
    cumulativeLayoutShift?: number,
    timeToInteractive?: number
  ) => {
    try {
      await AnalyticsService.trackPerformance({
        user_id: userId,
        session_id: sessionId,
        page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        load_time_ms: loadTime,
        first_contentful_paint_ms: firstContentfulPaint,
        largest_contentful_paint_ms: largestContentfulPaint,
        first_input_delay_ms: firstInputDelay,
        cumulative_layout_shift: cumulativeLayoutShift,
        time_to_interactive_ms: timeToInteractive,
        device_type: typeof window !== 'undefined' ? 
          /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop' : undefined,
        browser: typeof window !== 'undefined' ? 
          navigator.userAgent.split(' ').pop()?.split('/')[0] : undefined,
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }, [userId, sessionId]);

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError,
    trackPerformance,
  };
}

// Common tracking functions
export const trackUserAction = (action: string, category: string, label?: string, value?: number) => {
  return {
    eventType: 'user_action',
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
  };
};

export const trackButtonClick = (buttonName: string, location?: string) => {
  return trackUserAction('click', 'button', buttonName, undefined);
};

export const trackFormSubmit = (formName: string, success: boolean) => {
  return trackUserAction('submit', 'form', formName, success ? 1 : 0);
};

export const trackSearch = (query: string, resultsCount?: number) => {
  return trackUserAction('search', 'search', query, resultsCount);
};

export const trackListingView = (listingId: string, listingTitle: string) => {
  return trackUserAction('view', 'listing', listingTitle, undefined);
};

export const trackListingCreate = (listingId: string, category: string) => {
  return trackUserAction('create', 'listing', category, undefined);
};

export const trackPurchase = (orderId: string, amount: number, currency: string) => {
  return trackUserAction('purchase', 'ecommerce', orderId, amount);
};
