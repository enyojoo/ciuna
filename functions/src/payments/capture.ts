import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.22.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CaptureRequestSchema = z.object({
  payment_id: z.string().uuid(),
  amount_rub: z.number().int().positive().optional(),
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

    const { payment_id, amount_rub } = CaptureRequestSchema.parse(
      await req.json()
    );

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'AUTHORIZED') {
      throw new Error(`Payment cannot be captured. Current status: ${payment.status}`);
    }

    const captureAmount = amount_rub || payment.amount_rub;

    if (captureAmount > payment.amount_rub) {
      throw new Error('Capture amount cannot exceed authorized amount');
    }

    // Simulate payment provider capture API call
    let captureRef: string;
    
    switch (payment.provider) {
      case 'MOCKPAY':
        // Mock payment provider - always succeeds
        captureRef = `capture_${payment.provider_ref}`;
        break;
      case 'YOOMONEY':
        // YooMoney capture API would go here
        captureRef = `yoomoney_capture_${payment.provider_ref}`;
        break;
      case 'SBER':
        // Sberbank capture API would go here
        captureRef = `sber_capture_${payment.provider_ref}`;
        break;
      case 'TINKOFF':
        // Tinkoff capture API would go here
        captureRef = `tinkoff_capture_${payment.provider_ref}`;
        break;
      default:
        throw new Error(`Unsupported payment provider: ${payment.provider}`);
    }

    // Update payment status
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: 'CAPTURED',
        processed_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          capture_ref: captureRef,
          captured_amount: captureAmount,
        },
      })
      .eq('id', payment_id);

    if (updateError) {
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          payment_id,
          capture_ref: captureRef,
          captured_amount: captureAmount,
          status: 'CAPTURED',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment capture error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment capture failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
