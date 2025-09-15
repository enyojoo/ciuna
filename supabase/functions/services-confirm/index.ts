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
    const { booking_id } = await req.json()

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get booking details with service and provider info
    const { data: booking, error: bookingError } = await supabase
      .from('service_bookings')
      .select(`
        *,
        services!inner(
          id,
          price,
          provider_id,
          service_providers!inner(
            id,
            profile_id
          )
        )
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Service booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (booking.status !== 'CONFIRMED') {
      return new Response(
        JSON.stringify({ error: 'Booking is not in CONFIRMED status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update booking status to COMPLETED
    const { error: updateBookingError } = await supabase
      .from('service_bookings')
      .update({ 
        status: 'COMPLETED',
        escrow_status: 'RELEASED'
      })
      .eq('id', booking_id)

    if (updateBookingError) {
      return new Response(
        JSON.stringify({ error: 'Failed to complete booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create or update order for this service booking
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('service_booking_id', booking_id)
      .single()

    let orderId = existingOrder?.id

    if (!existingOrder) {
      // Create new order for the service
      const { data: newOrder, error: createOrderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: booking.client_id,
          seller_id: booking.services.service_providers.profile_id,
          service_booking_id: booking_id,
          status: 'DELIVERED',
          escrow_status: 'RELEASED'
        })
        .select()
        .single()

      if (createOrderError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      orderId = newOrder.id
    } else {
      // Update existing order
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({
          status: 'DELIVERED',
          escrow_status: 'RELEASED'
        })
        .eq('id', orderId)

      if (updateOrderError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create payment record for the service
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        provider: 'YOOMONEY',
        amount: booking.services.price,
        status: 'CAPTURED',
        provider_ref: `service_${booking_id}_${Date.now()}`
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError)
      // Don't fail the request for this
    }

    // Update order with payment_id if payment was created
    if (payment) {
      await supabase
        .from('orders')
        .update({ payment_id: payment.id })
        .eq('id', orderId)
    }

    // Add payout ledger entry for service provider
    const { error: payoutError } = await supabase
      .from('payout_ledger')
      .insert({
        user_id: booking.services.service_providers.profile_id,
        order_id: orderId,
        amount: booking.services.price,
        type: 'CREDIT'
      })

    if (payoutError) {
      console.error('Failed to create payout ledger entry:', payoutError)
      // Don't fail the request for this
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking_id: booking.id,
        order_id: orderId,
        status: 'COMPLETED',
        escrow_status: 'RELEASED',
        amount: booking.services.price
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
