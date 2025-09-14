import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock tariff rates by country (in USD per kg)
const TARIFF_RATES: Record<string, number> = {
  'US': 0.15,
  'CN': 0.12,
  'DE': 0.18,
  'FR': 0.20,
  'GB': 0.22,
  'JP': 0.16,
  'KR': 0.14,
  'IN': 0.10,
  'BR': 0.13,
  'CA': 0.17,
  'AU': 0.19,
  'RU': 0.05, // Domestic
}

// Mock duty rates by country (percentage)
const DUTY_RATES: Record<string, number> = {
  'US': 2.5,
  'CN': 3.0,
  'DE': 2.8,
  'FR': 3.2,
  'GB': 2.9,
  'JP': 2.7,
  'KR': 2.6,
  'IN': 4.0,
  'BR': 3.5,
  'CA': 2.4,
  'AU': 2.8,
  'RU': 0.0, // Domestic
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { from_country, to_country = 'RU', volumetric_weight_kg, item_value_usd = 0 } = await req.json()

    if (!from_country || !volumetric_weight_kg) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: from_country, volumetric_weight_kg' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate base shipping cost
    const tariffRate = TARIFF_RATES[from_country] || 0.15
    const baseCost = Math.round(volumetric_weight_kg * tariffRate * 100) // Convert to cents

    // Calculate duty estimate
    const dutyRate = DUTY_RATES[from_country] || 2.5
    const dutyEstimate = Math.round(item_value_usd * dutyRate)

    // Add some randomness to simulate real-world variation (±10%)
    const variation = 0.9 + Math.random() * 0.2
    const finalBaseCost = Math.round(baseCost * variation)

    // Store quote in database
    const { data: quote, error: quoteError } = await supabase
      .from('intl_shipment_quotes')
      .insert({
        from_country,
        to_country,
        volumetric_weight_kg,
        base_cost: finalBaseCost,
        duty_estimate: dutyEstimate
      })
      .select()
      .single()

    if (quoteError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store shipping quote' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate estimated delivery time (mock)
    const isDomestic = from_country === to_country
    const baseDays = isDomestic ? 3 : 7
    const deliveryDays = baseDays + Math.floor(Math.random() * 3)

    return new Response(
      JSON.stringify({ 
        success: true,
        quote_id: quote.id,
        base_cost: finalBaseCost,
        duty_estimate: dutyEstimate,
        total_cost: finalBaseCost + dutyEstimate,
        estimated_delivery_days: deliveryDays,
        currency: 'RUB',
        from_country,
        to_country,
        volumetric_weight_kg
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
