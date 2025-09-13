import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.22.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QuoteRequestSchema = z.object({
  from_country: z.string().length(2),
  to_country: z.string().length(2).default('RU'),
  weight_kg: z.number().positive(),
  dimensions: z.object({
    length_cm: z.number().positive(),
    width_cm: z.number().positive(),
    height_cm: z.number().positive(),
  }),
  value_rub: z.number().int().positive(),
  contents: z.string(),
  service_level: z.enum(['ECONOMY', 'STANDARD', 'EXPRESS', 'OVERNIGHT']).default('STANDARD'),
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

    const { 
      from_country, 
      to_country, 
      weight_kg, 
      dimensions, 
      value_rub, 
      contents, 
      service_level 
    } = QuoteRequestSchema.parse(await req.json());

    // Calculate volumetric weight
    const volumetricWeight = (dimensions.length_cm * dimensions.width_cm * dimensions.height_cm) / 5000;
    const chargeableWeight = Math.max(weight_kg, volumetricWeight);

    // Get base shipping rates (this would come from your shipping provider APIs)
    const baseRates = await getShippingRates(from_country, to_country, chargeableWeight, service_level);
    
    // Calculate duty and taxes
    const dutyEstimate = await calculateDuty(value_rub, from_country, to_country, contents);
    
    // Calculate total cost
    const baseCost = baseRates.base_cost_rub;
    const totalCost = baseCost + dutyEstimate;

    // Save quote to database
    const { data: quote, error: quoteError } = await supabaseClient
      .from('intl_shipment_quotes')
      .insert({
        from_country,
        to_country,
        volumetric_weight_kg: chargeableWeight,
        base_cost_rub: baseCost,
        duty_estimate_rub: dutyEstimate,
        total_cost_rub: totalCost,
        estimated_days: baseRates.estimated_days,
        carrier: baseRates.carrier,
        service_level,
        tracking_available: baseRates.tracking_available,
        insurance_included: baseRates.insurance_included,
        customs_handling: baseRates.customs_handling,
      })
      .select()
      .single();

    if (quoteError) {
      console.error('Failed to save quote:', quoteError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          quote_id: quote?.id,
          from_country,
          to_country,
          weight_kg: chargeableWeight,
          base_cost_rub: baseCost,
          duty_estimate_rub: dutyEstimate,
          total_cost_rub: totalCost,
          estimated_days: baseRates.estimated_days,
          carrier: baseRates.carrier,
          service_level,
          tracking_available: baseRates.tracking_available,
          insurance_included: baseRates.insurance_included,
          customs_handling: baseRates.customs_handling,
          breakdown: {
            shipping: baseCost,
            duty: dutyEstimate,
            total: totalCost,
          },
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Shipping quote error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to get shipping quote',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Mock shipping rates - in production, this would call real shipping APIs
async function getShippingRates(
  fromCountry: string, 
  toCountry: string, 
  weight: number, 
  serviceLevel: string
) {
  // Base rates by service level
  const baseRates = {
    ECONOMY: { base: 500, days: 14, carrier: 'Russian Post' },
    STANDARD: { base: 800, days: 7, carrier: 'DHL' },
    EXPRESS: { base: 1500, days: 3, carrier: 'FedEx' },
    OVERNIGHT: { base: 3000, days: 1, carrier: 'DHL Express' },
  };

  const rate = baseRates[serviceLevel as keyof typeof baseRates] || baseRates.STANDARD;
  
  // Calculate cost based on weight (simplified)
  const weightMultiplier = Math.ceil(weight);
  const baseCost = rate.base * weightMultiplier;

  return {
    base_cost_rub: baseCost,
    estimated_days: rate.days,
    carrier: rate.carrier,
    tracking_available: true,
    insurance_included: serviceLevel !== 'ECONOMY',
    customs_handling: true,
  };
}

// Mock duty calculation - in production, this would use real duty calculation APIs
async function calculateDuty(
  value: number, 
  fromCountry: string, 
  toCountry: string, 
  contents: string
) {
  // Simplified duty calculation
  // In reality, this would depend on the specific product category and trade agreements
  
  if (toCountry !== 'RU') {
    return 0; // No duty for non-Russia destinations in this mock
  }

  // Duty rates by value (simplified)
  if (value <= 200) {
    return 0; // No duty for low-value items
  } else if (value <= 1000) {
    return Math.round(value * 0.15); // 15% duty
  } else {
    return Math.round(value * 0.20); // 20% duty
  }
}
