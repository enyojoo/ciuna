import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simple database helper functions
export const db = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Listings
  async getListings(filters?: any) {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters?.min_price) {
      query = query.gte('price', filters.min_price)
    }
    if (filters?.max_price) {
      query = query.lte('price', filters.max_price)
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Services
  async getServices(filters?: any) {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters?.min_price) {
      query = query.gte('price', filters.min_price)
    }
    if (filters?.max_price) {
      query = query.lte('price', filters.max_price)
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Vendors
  async getVendors(filters?: any) {
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters?.search) {
      query = query.or(`business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Orders
  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Messages
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [userId])
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Notifications
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
}

// Search service
export class SearchService {
  static async search(query: string, filters?: any) {
    const results = []
    
    // Search listings
    const listings = await db.getListings({ ...filters, search: query })
    results.push(...listings.map(listing => ({
      id: listing.id,
      type: 'listing' as const,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      location: listing.location,
      image: listing.images?.[0],
      created_at: listing.created_at,
    })))

    // Search services
    const services = await db.getServices({ ...filters, search: query })
    results.push(...services.map(service => ({
      id: service.id,
      type: 'service' as const,
      title: service.title,
      description: service.description,
      price: service.price,
      currency: service.currency,
      location: service.location,
      created_at: service.created_at,
    })))

    // Search vendors
    const vendors = await db.getVendors({ ...filters, search: query })
    results.push(...vendors.map(vendor => ({
      id: vendor.id,
      type: 'vendor' as const,
      title: vendor.business_name,
      description: vendor.description,
      location: vendor.location,
      rating: vendor.rating,
      created_at: vendor.created_at,
    })))

    return results
  }

  static async getSuggestions(query: string) {
    // Simple implementation - in a real app, you'd use a search service
    const categories = await db.getCategories()
    return categories
      .filter(cat => cat.name.toLowerCase().includes(query.toLowerCase()))
      .map(cat => ({
        id: cat.id,
        text: cat.name,
        type: 'category' as const,
      }))
  }
}

// Export types for convenience
export type SearchResult = {
  id: string
  type: 'listing' | 'service' | 'vendor'
  title: string
  description: string
  price?: number
  currency?: string
  location?: string
  image?: string
  rating?: number
  created_at: string
}

export type SearchSuggestion = {
  id: string
  text: string
  type: 'category' | 'location' | 'keyword'
}
