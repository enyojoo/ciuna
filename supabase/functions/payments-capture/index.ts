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
    const { payment_id } = await req.json()

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: payment_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get payment and order details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        orders!inner(
          id,
          buyer_id,
          seller_id,
          amount
        )
      `)
      .eq('id', payment_id)
      .single()

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (payment.status !== 'AUTHORIZED') {
      return new Response(
        JSON.stringify({ error: 'Payment is not in AUTHORIZED status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update payment status to CAPTURED
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({ status: 'CAPTURED' })
      .eq('id', payment_id)

    if (updatePaymentError) {
      return new Response(
        JSON.stringify({ error: 'Failed to capture payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update order escrow status to RELEASED
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ escrow_status: 'RELEASED' })
      .eq('payment_id', payment_id)

    if (updateOrderError) {
      return new Response(
        JSON.stringify({ error: 'Failed to release escrow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add payout ledger entry for seller
    const { error: payoutError } = await supabase
      .from('payout_ledger')
      .insert({
        user_id: payment.orders.seller_id,
        order_id: payment.orders.id,
        amount: payment.amount,
        type: 'CREDIT'
      })

    if (payoutError) {
      console.error('Failed to create payout ledger entry:', payoutError)
      // Don't fail the request for this
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: payment.id,
        status: 'CAPTURED'
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
