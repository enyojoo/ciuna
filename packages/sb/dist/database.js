import { supabase } from './client';
// Database utilities
export const db = {
    // Categories
    categories: {
        async getAll() {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            if (error)
                throw error;
            return data;
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(category) {
            const { data, error } = await supabase
                .from('categories')
                .insert(category)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Listings
    listings: {
        async getAll(filters, page = 1, limit = 20) {
            let query = supabase
                .from('listings')
                .select('*', { count: 'exact' });
            if (filters?.category_id) {
                query = query.eq('category_id', filters.category_id);
            }
            if (filters?.city) {
                query = query.eq('city', filters.city);
            }
            if (filters?.district) {
                query = query.eq('district', filters.district);
            }
            if (filters?.min_price) {
                query = query.gte('price_rub', filters.min_price);
            }
            if (filters?.max_price) {
                query = query.lte('price_rub', filters.max_price);
            }
            if (filters?.condition) {
                query = query.eq('condition', filters.condition);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.search) {
                query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }
            if (filters?.tags && filters.tags.length > 0) {
                query = query.overlaps('tags', filters.tags);
            }
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(listing) {
            const { data, error } = await supabase
                .from('listings')
                .insert(listing)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('listings')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
        },
    },
    // Vendors
    vendors: {
        async getAll(filters, page = 1, limit = 20) {
            let query = supabase
                .from('vendors')
                .select('*', { count: 'exact' })
                .eq('status', 'ACTIVE');
            if (filters?.type) {
                query = query.eq('type', filters.type);
            }
            if (filters?.city) {
                query = query.eq('city', filters.city);
            }
            if (filters?.verified !== undefined) {
                query = query.eq('verified', filters.verified);
            }
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(vendor) {
            const { data, error } = await supabase
                .from('vendors')
                .insert(vendor)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('vendors')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async getByOwnerId(ownerId) {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('owner_id', ownerId)
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Vendor Products
    products: {
        async getAll(filters, page = 1, limit = 20) {
            let query = supabase
                .from('vendor_products')
                .select('*', { count: 'exact' })
                .eq('status', 'ACTIVE');
            if (filters?.vendor_id) {
                query = query.eq('vendor_id', filters.vendor_id);
            }
            if (filters?.category_id) {
                query = query.eq('category_id', filters.category_id);
            }
            if (filters?.min_price) {
                query = query.gte('price_rub', filters.min_price);
            }
            if (filters?.max_price) {
                query = query.lte('price_rub', filters.max_price);
            }
            if (filters?.is_local_stock !== undefined) {
                query = query.eq('is_local_stock', filters.is_local_stock);
            }
            if (filters?.is_dropship !== undefined) {
                query = query.eq('is_dropship', filters.is_dropship);
            }
            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }
            if (filters?.tags && filters.tags.length > 0) {
                query = query.overlaps('tags', filters.tags);
            }
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('vendor_products')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(product) {
            const { data, error } = await supabase
                .from('vendor_products')
                .insert(product)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('vendor_products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Services
    services: {
        async getAll(filters, page = 1, limit = 20) {
            let query = supabase
                .from('services')
                .select('*', { count: 'exact' })
                .eq('status', 'ACTIVE');
            if (filters?.provider_id) {
                query = query.eq('provider_id', filters.provider_id);
            }
            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.min_price) {
                query = query.gte('price_rub', filters.min_price);
            }
            if (filters?.max_price) {
                query = query.lte('price_rub', filters.max_price);
            }
            if (filters?.is_online !== undefined) {
                query = query.eq('is_online', filters.is_online);
            }
            if (filters?.is_in_person !== undefined) {
                query = query.eq('is_in_person', filters.is_in_person);
            }
            if (filters?.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }
            if (filters?.search) {
                query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }
            if (filters?.tags && filters.tags.length > 0) {
                query = query.overlaps('tags', filters.tags);
            }
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(service) {
            const { data, error } = await supabase
                .from('services')
                .insert(service)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('services')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Service Bookings
    bookings: {
        async getAll(filters, page = 1, limit = 20) {
            let query = supabase
                .from('service_bookings')
                .select('*', { count: 'exact' });
            if (filters?.client_id) {
                query = query.eq('client_id', filters.client_id);
            }
            if (filters?.service_id) {
                query = query.eq('service_id', filters.service_id);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('service_bookings')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(booking) {
            const { data, error } = await supabase
                .from('service_bookings')
                .insert(booking)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('service_bookings')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Orders
    orders: {
        async getAll(filters, page = 1, limit = 20) {
            let query = supabase
                .from('orders')
                .select('*', { count: 'exact' });
            if (filters?.buyer_id) {
                query = query.eq('buyer_id', filters.buyer_id);
            }
            if (filters?.seller_id) {
                query = query.eq('seller_id', filters.seller_id);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(order) {
            const { data, error } = await supabase
                .from('orders')
                .insert(order)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Conversations
    conversations: {
        async getAll(userId, page = 1, limit = 20) {
            const { data, error, count } = await supabase
                .from('conversations')
                .select(`
          *,
          conversation_participants!inner(user_id)
        `, { count: 'exact' })
                .eq('conversation_participants.user_id', userId)
                .order('last_message_at', { ascending: false, nullsFirst: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async create(conversation) {
            const { data, error } = await supabase
                .from('conversations')
                .insert(conversation)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Messages
    messages: {
        async getAll(conversationId, page = 1, limit = 50) {
            const { data, error, count } = await supabase
                .from('messages')
                .select('*', { count: 'exact' })
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw error;
            return { data: data, total: count || 0 };
        },
        async create(message) {
            const { data, error } = await supabase
                .from('messages')
                .insert(message)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
        async markAsRead(messageId) {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', messageId);
            if (error)
                throw error;
        },
    },
    // Profiles
    profiles: {
        async getAll() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data || [];
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        },
    },
    // Service Providers
    serviceProviders: {
        async getAll() {
            const { data, error } = await supabase
                .from('service_providers')
                .select(`
          *,
          profile:profiles(*)
        `)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data || [];
        },
        async getById(id) {
            const { data, error } = await supabase
                .from('service_providers')
                .select(`
          *,
          profile:profiles(*)
        `)
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return data;
        },
    },
};
//# sourceMappingURL=database.js.map