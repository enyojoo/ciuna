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
    const { payment_id, reason } = await req.json()

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
          amount,
          escrow_status
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

    if (payment.status === 'REFUNDED') {
      return new Response(
        JSON.stringify({ error: 'Payment already refunded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update payment status to REFUNDED
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({ status: 'REFUNDED' })
      .eq('id', payment_id)

    if (updatePaymentError) {
      return new Response(
        JSON.stringify({ error: 'Failed to refund payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update order escrow status to REFUNDED
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ 
        escrow_status: 'REFUNDED',
        status: 'CANCELLED'
      })
      .eq('payment_id', payment_id)

    if (updateOrderError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update order status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add payout ledger entry for buyer (refund)
    const { error: refundError } = await supabase
      .from('payout_ledger')
      .insert({
        user_id: payment.orders.buyer_id,
        order_id: payment.orders.id,
        amount: payment.amount,
        type: 'CREDIT'
      })

    if (refundError) {
      console.error('Failed to create refund ledger entry:', refundError)
      // Don't fail the request for this
    }

    // If escrow was already released, add debit for seller
    if (payment.orders.escrow_status === 'RELEASED') {
      const { error: debitError } = await supabase
        .from('payout_ledger')
        .insert({
          user_id: payment.orders.seller_id,
          order_id: payment.orders.id,
          amount: payment.amount,
          type: 'DEBIT'
        })

      if (debitError) {
        console.error('Failed to create debit ledger entry:', debitError)
        // Don't fail the request for this
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: payment.id,
        status: 'REFUNDED',
        reason: reason || 'No reason provided'
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
