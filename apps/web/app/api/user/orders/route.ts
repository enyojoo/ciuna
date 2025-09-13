import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@ciuna/sb';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's orders (both buying and selling)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        seller_id,
        listing_id,
        vendor_product_id,
        service_booking_id,
        status,
        created_at,
        total_amount_rub,
        listings (
          title,
          photo_urls
        ),
        vendor_products (
          name,
          photo_urls
        ),
        service_bookings (
          services (
            title,
            service_providers (
              name
            )
          )
        ),
        profiles!orders_buyer_id_fkey (
          first_name,
          last_name
        ),
        profiles!orders_seller_id_fkey (
          first_name,
          last_name
        )
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedOrders = orders?.map(order => {
      const isBuying = order.buyer_id === user.id;
      const otherUser = isBuying ? order.profiles : order.profiles;
      const otherUserName = otherUser ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() : 'Unknown User';
      
      let title = '';
      let photo_url = '';
      
      if (order.listings) {
        title = order.listings.title;
        photo_url = order.listings.photo_urls?.[0] || '';
      } else if (order.vendor_products) {
        title = order.vendor_products.name;
        photo_url = order.vendor_products.photo_urls?.[0] || '';
      } else if (order.service_bookings) {
        title = order.service_bookings.services.title;
        photo_url = ''; // Services don't have photos in this schema
      }

      return {
        id: order.id,
        type: isBuying ? 'buying' : 'selling',
        title,
        price_rub: order.total_amount_rub,
        status: order.status,
        created_at: order.created_at,
        buyer_name: isBuying ? undefined : otherUserName,
        seller_name: isBuying ? otherUserName : undefined,
        photo_url
      };
    }) || [];

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
