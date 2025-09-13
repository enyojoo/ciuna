import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@ciuna/sb';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    // Get real-time metrics for the last hour
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get analytics dashboard data using the database function
    const { data, error } = await supabase.rpc('get_analytics_dashboard_data', {
      p_start_date: oneHourAgo.toISOString(),
      p_end_date: now.toISOString(),
    });

    if (error) {
      console.error('Error fetching real-time data:', error);
      return NextResponse.json({ error: 'Failed to fetch real-time data' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in real-time analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
