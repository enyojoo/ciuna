import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's listings
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        price_rub,
        condition,
        status,
        city,
        district,
        photo_urls,
        created_at,
        view_count
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    return NextResponse.json(listings || []);
  } catch (error) {
    console.error('Error in listings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
