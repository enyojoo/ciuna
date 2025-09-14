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
    const { order_id, amount, provider = 'YOOMONEY' } = await req.json()

    if (!order_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: order_id, amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify order exists and get details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        listings!inner(id, seller_id, price),
        vendor_products!inner(id, vendor_id, price_rub),
        service_bookings!inner(id, service_id)
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        provider,
        amount,
        status: 'AUTHORIZED',
        provider_ref: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
      .select()
      .single()

    if (paymentError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update order with payment_id
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_id: payment.id, status: 'PAID' })
      .eq('id', order_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: payment.id,
        status: 'AUTHORIZED'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
