import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@ciuna/sb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user notification preferences
    const { data: preferences, error } = await supabase
      .from('user_notification_preferences')
      .select('type, channel, enabled')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    return NextResponse.json(preferences || []);
  } catch (error) {
    console.error('Error in notification preferences GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json({ error: 'User ID and preferences are required' }, { status: 400 });
    }

    // Validate preferences format
    if (!Array.isArray(preferences)) {
      return NextResponse.json({ error: 'Preferences must be an array' }, { status: 400 });
    }

    // Transform preferences for database insertion
    const preferencesData = preferences.map((pref: any) => ({
      user_id: userId,
      type: pref.type,
      channel: pref.channel,
      enabled: pref.enabled,
      updated_at: new Date().toISOString(),
    }));

    // Upsert preferences (update existing, insert new)
    const { error: upsertError } = await supabase
      .from('user_notification_preferences')
      .upsert(preferencesData, { 
        onConflict: 'user_id,type,channel',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Error upserting notification preferences:', upsertError);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in notification preferences POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
