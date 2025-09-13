import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@ciuna/sb';

const supabase = createClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get analytics dashboard data using the database function
    const { data, error } = await supabase.rpc('get_analytics_dashboard_data', {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error fetching dashboard data:', error);
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in analytics dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
