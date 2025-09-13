import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Mark notification as read using the database function
    const { data: success, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Notification not found or already read' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
