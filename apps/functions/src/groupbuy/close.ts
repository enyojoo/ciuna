import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.22.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CloseDealRequestSchema = z.object({
  deal_id: z.number().int().positive(),
});

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { deal_id } = CloseDealRequestSchema.parse(
      await req.json()
    );

    // Get group buy deal
    const { data: deal, error: dealError } = await supabaseClient
      .from('group_buy_deals')
      .select(`
        *,
        vendor_products!inner(*),
        group_buy_orders(*)
      `)
      .eq('id', deal_id)
      .single();

    if (dealError || !deal) {
      throw new Error('Group buy deal not found');
    }

    if (deal.status !== 'ACTIVE') {
      throw new Error(`Deal is not active. Current status: ${deal.status}`);
    }

    if (deal.current_quantity < deal.min_quantity) {
      throw new Error(`Minimum quantity not reached. Current: ${deal.current_quantity}, Required: ${deal.min_quantity}`);
    }

    // Calculate discount per unit
    const originalPrice = deal.vendor_products.price_rub;
    const discountAmount = Math.round(originalPrice * (deal.discount_percentage / 100));
    const discountedPrice = originalPrice - discountAmount;

    // Update all orders with discounted prices
    const { error: ordersUpdateError } = await supabaseClient
      .from('group_buy_orders')
      .update({
        price_per_unit_rub: discountedPrice,
        total_amount_rub: discountedPrice * deal.group_buy_orders.length,
        discount_amount_rub: discountAmount * deal.group_buy_orders.length,
        status: 'CONFIRMED',
      })
      .eq('deal_id', deal_id)
      .eq('status', 'PENDING');

    if (ordersUpdateError) {
      throw new Error(`Failed to update orders: ${ordersUpdateError.message}`);
    }

    // Update deal status
    const { error: dealUpdateError } = await supabaseClient
      .from('group_buy_deals')
      .update({
        status: 'COMPLETED',
        current_quantity: deal.current_quantity,
      })
      .eq('id', deal_id);

    if (dealUpdateError) {
      throw new Error(`Failed to update deal: ${dealUpdateError.message}`);
    }

    // Create orders for each group buy order
    const orders = [];
    for (const groupOrder of deal.group_buy_orders) {
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          buyer_id: groupOrder.buyer_id,
          seller_id: deal.vendor_products.vendor_id,
          vendor_product_id: deal.vendor_product_id,
          payment_id: groupOrder.payment_id,
          total_amount_rub: groupOrder.total_amount_rub,
          escrow_amount_rub: groupOrder.total_amount_rub,
          status: 'PENDING',
        })
        .select()
        .single();

      if (orderError) {
        console.error(`Failed to create order for group buy order ${groupOrder.id}:`, orderError);
        continue;
      }

      orders.push(order);

      // Update group buy order with order reference
      await supabaseClient
        .from('group_buy_orders')
        .update({ order_id: order.id })
        .eq('id', groupOrder.id);
    }

    // Send notifications to all participants
    // This would integrate with your notification service
    console.log(`Group buy deal ${deal_id} completed with ${orders.length} orders`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          deal_id,
          status: 'COMPLETED',
          total_orders: orders.length,
          discount_percentage: deal.discount_percentage,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          total_savings: discountAmount * deal.current_quantity,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Group buy close error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to close group buy deal',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
