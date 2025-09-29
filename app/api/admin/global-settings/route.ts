import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all global settings data
    const [exchangeRates, featureRules, shippingProviders, paymentMethods] = await Promise.all([
      supabase.from('currency_exchange_rates').select('*'),
      supabase.from('feature_access_rules').select('*'),
      supabase.from('shipping_providers').select('*'),
      supabase.from('payment_methods').select('*')
    ])

    return NextResponse.json({
      exchangeRates: exchangeRates.data || [],
      featureRules: featureRules.data || [],
      shippingProviders: shippingProviders.data || [],
      paymentMethods: paymentMethods.data || []
    })
  } catch (error) {
    console.error('Error fetching global settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, data } = body

    let result

    switch (type) {
      case 'exchange_rate':
        result = await supabase
          .from('currency_exchange_rates')
          .upsert({
            from_currency: data.from_currency,
            to_currency: data.to_currency,
            rate: data.rate,
            last_updated: new Date().toISOString()
          })
        break

      case 'feature_rule':
        result = await supabase
          .from('feature_access_rules')
          .upsert({
            location: data.location,
            feature_name: data.feature_name,
            is_enabled: data.is_enabled,
            configuration: data.configuration || {}
          })
        break

      case 'shipping_provider':
        result = await supabase
          .from('shipping_providers')
          .insert({
            name: data.name,
            code: data.code,
            countries: data.countries,
            supported_currencies: data.supported_currencies,
            is_active: data.is_active
          })
        break

      case 'payment_method':
        result = await supabase
          .from('payment_methods')
          .insert({
            name: data.name,
            code: data.code,
            countries: data.countries,
            supported_currencies: data.supported_currencies,
            is_active: data.is_active
          })
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error updating global settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, id, data } = body

    let result

    switch (type) {
      case 'exchange_rate':
        result = await supabase
          .from('currency_exchange_rates')
          .update({
            rate: data.rate,
            last_updated: new Date().toISOString()
          })
          .eq('id', id)
        break

      case 'feature_rule':
        result = await supabase
          .from('feature_access_rules')
          .update({
            is_enabled: data.is_enabled,
            configuration: data.configuration,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
        break

      case 'shipping_provider':
        result = await supabase
          .from('shipping_providers')
          .update({
            name: data.name,
            code: data.code,
            countries: data.countries,
            supported_currencies: data.supported_currencies,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
        break

      case 'payment_method':
        result = await supabase
          .from('payment_methods')
          .update({
            name: data.name,
            code: data.code,
            countries: data.countries,
            supported_currencies: data.supported_currencies,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error updating global settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
