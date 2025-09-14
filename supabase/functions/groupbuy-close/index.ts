import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { deal_id } = await req.json()

    if (!deal_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: deal_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get deal details
    const { data: deal, error: dealError } = await supabase
      .from('group_buy_deals')
      .select(`
        *,
        vendor_products!inner(
          id,
          name,
          price_rub,
          vendor_id
        )
      `)
      .eq('id', deal_id)
      .single()

    if (dealError || !deal) {
      return new Response(
        JSON.stringify({ error: 'Group buy deal not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (deal.status !== 'ACTIVE') {
      return new Response(
        JSON.stringify({ error: 'Deal is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if deal has expired
    if (new Date(deal.expires_at) < new Date()) {
      const { error: cancelError } = await supabase
        .from('group_buy_deals')
        .update({ status: 'CANCELLED' })
        .eq('id', deal_id)

      if (cancelError) {
        return new Response(
          JSON.stringify({ error: 'Failed to cancel expired deal' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          deal_id: deal.id,
          status: 'CANCELLED',
          reason: 'Deal expired'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get total quantity ordered
    const { data: orders, error: ordersError } = await supabase
      .from('group_buy_orders')
      .select('quantity')
      .eq('deal_id', deal_id)

    if (ordersError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch orders' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0)

    if (totalQuantity >= deal.min_quantity) {
      // Deal successful - mark as completed
      const { error: completeError } = await supabase
        .from('group_buy_deals')
        .update({ status: 'COMPLETED' })
        .eq('id', deal_id)

      if (completeError) {
        return new Response(
          JSON.stringify({ error: 'Failed to complete deal' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create orders for all participants with discounted prices
      const discountedPrice = Math.round(
        deal.vendor_products.price_rub * (1 - deal.discount_percentage / 100)
      )

      const orderPromises = orders.map(async (order) => {
        // Create order for each participant
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: order.buyer_id,
            seller_id: deal.vendor_products.vendor_id,
            vendor_product_id: deal.vendor_products.id,
            status: 'PENDING'
          })
          .select()
          .single()

        if (orderError) {
          console.error(`Failed to create order for buyer ${order.buyer_id}:`, orderError)
          return null
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            provider: 'YOOMONEY',
            amount: discountedPrice * order.quantity,
            status: 'AUTHORIZED',
            provider_ref: `groupbuy_${deal_id}_${order.buyer_id}_${Date.now()}`
          })

        if (paymentError) {
          console.error(`Failed to create payment for buyer ${order.buyer_id}:`, paymentError)
        }

        return newOrder
      })

      await Promise.all(orderPromises)

      return new Response(
        JSON.stringify({ 
          success: true, 
          deal_id: deal.id,
          status: 'COMPLETED',
          total_quantity: totalQuantity,
          min_quantity: deal.min_quantity,
          discount_percentage: deal.discount_percentage,
          discounted_price: discountedPrice,
          participants: orders.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Deal failed - mark as cancelled
      const { error: cancelError } = await supabase
        .from('group_buy_deals')
        .update({ status: 'CANCELLED' })
        .eq('id', deal_id)

      if (cancelError) {
        return new Response(
          JSON.stringify({ error: 'Failed to cancel deal' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          deal_id: deal.id,
          status: 'CANCELLED',
          total_quantity: totalQuantity,
          min_quantity: deal.min_quantity,
          reason: 'Insufficient quantity ordered'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
