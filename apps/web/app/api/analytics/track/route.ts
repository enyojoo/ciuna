import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@ciuna/sb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventCategory, eventAction, eventLabel, eventValue, properties } = body;

    if (!eventType || !eventCategory || !eventAction) {
      return NextResponse.json({ 
        error: 'eventType, eventCategory, and eventAction are required' 
      }, { status: 400 });
    }

    // Track the event
    const eventId = await AnalyticsService.trackEvent({
      event_type: eventType,
      event_category: eventCategory,
      event_action: eventAction,
      event_label: eventLabel,
      event_value: eventValue,
      properties: properties || {},
      page_url: request.headers.get('referer') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    if (!eventId) {
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
