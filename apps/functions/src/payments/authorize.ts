import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.22.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PaymentRequestSchema = z.object({
  amount_rub: z.number().int().positive(),
  currency: z.string().default('RUB'),
  description: z.string().optional(),
  provider: z.enum(['MOCKPAY', 'YOOMONEY', 'SBER', 'TINKOFF']),
  metadata: z.record(z.any()).optional(),
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

    const { amount_rub, currency, description, provider, metadata } = PaymentRequestSchema.parse(
      await req.json()
    );

    // Generate payment reference
    const providerRef = `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        provider,
        provider_ref: providerRef,
        amount_rub,
        currency,
        description,
        metadata: metadata || {},
        status: 'AUTHORIZED',
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to create payment: ${paymentError.message}`);
    }

    // Simulate payment provider API call
    let clientSecret: string | null = null;
    
    switch (provider) {
      case 'MOCKPAY':
        // Mock payment provider - always succeeds
        clientSecret = `mock_${providerRef}`;
        break;
      case 'YOOMONEY':
        // YooMoney API integration would go here
        clientSecret = `yoomoney_${providerRef}`;
        break;
      case 'SBER':
        // Sberbank API integration would go here
        clientSecret = `sber_${providerRef}`;
        break;
      case 'TINKOFF':
        // Tinkoff API integration would go here
        clientSecret = `tinkoff_${providerRef}`;
        break;
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          payment_id: payment.id,
          provider_ref: providerRef,
          client_secret: clientSecret,
          amount_rub,
          currency,
          status: 'AUTHORIZED',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment authorization error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment authorization failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
