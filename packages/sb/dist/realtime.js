import { supabase } from './client';
// Realtime utilities
export const realtime = {
    // Subscribe to table changes
    subscribeToTable(table, callback, options) {
        return supabase
            .channel(`${table}_changes`)
            .on('postgres_changes', {
            event: options?.event || '*',
            schema: options?.schema || 'public',
            table,
            filter: options?.filter,
        }, callback)
            .subscribe();
    },
    // Subscribe to conversation messages
    subscribeToMessages(conversationId, callback) {
        return supabase
            .channel(`messages_${conversationId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
        }, callback)
            .subscribe();
    },
    // Subscribe to order updates
    subscribeToOrder(orderId, callback) {
        return supabase
            .channel(`order_${orderId}`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
        }, callback)
            .subscribe();
    },
    // Subscribe to delivery updates
    subscribeToDelivery(deliveryId, callback) {
        return supabase
            .channel(`delivery_${deliveryId}`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'deliveries',
            filter: `id=eq.${deliveryId}`,
        }, callback)
            .subscribe();
    },
    // Subscribe to group buy deal updates
    subscribeToGroupBuyDeal(dealId, callback) {
        return supabase
            .channel(`group_buy_${dealId}`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'group_buy_deals',
            filter: `id=eq.${dealId}`,
        }, callback)
            .subscribe();
    },
    // Subscribe to service booking updates
    subscribeToServiceBooking(bookingId, callback) {
        return supabase
            .channel(`booking_${bookingId}`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'service_bookings',
            filter: `id=eq.${bookingId}`,
        }, callback)
            .subscribe();
    },
    // Subscribe to user's conversations
    subscribeToUserConversations(userId, callback) {
        return supabase
            .channel(`user_conversations_${userId}`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'conversations',
        }, (payload) => {
            // Check if user is a participant in this conversation
            if (payload.new && payload.new.participants?.includes(userId)) {
                callback(payload);
            }
        })
            .subscribe();
    },
    // Subscribe to new listings in a category
    subscribeToCategoryListings(categoryId, callback) {
        return supabase
            .channel(`category_listings_${categoryId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'listings',
            filter: `category_id=eq.${categoryId}`,
        }, callback)
            .subscribe();
    },
    // Subscribe to new products from a vendor
    subscribeToVendorProducts(vendorId, callback) {
        return supabase
            .channel(`vendor_products_${vendorId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'vendor_products',
            filter: `vendor_id=eq.${vendorId}`,
        }, callback)
            .subscribe();
    },
    // Subscribe to new services from a provider
    subscribeToProviderServices(providerId, callback) {
        return supabase
            .channel(`provider_services_${providerId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'services',
            filter: `provider_id=eq.${providerId}`,
        }, callback)
            .subscribe();
    },
    // Unsubscribe from channel
    unsubscribe(channel) {
        supabase.removeChannel(channel);
    },
    // Unsubscribe from all channels
    unsubscribeAll() {
        supabase.removeAllChannels();
    },
};
// Presence utilities for showing online users
export const presence = {
    // Track user presence in a conversation
    trackPresence(conversationId, userId, userInfo) {
        const channel = supabase.channel(`presence_${conversationId}`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });
        channel
            .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            console.log('Presence state:', state);
        })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', key, newPresences);
        })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', key, leftPresences);
        })
            .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track({
                    user_id: userId,
                    user_name: userInfo.name,
                    user_avatar: userInfo.avatar,
                    online_at: new Date().toISOString(),
                });
            }
        });
        return channel;
    },
    // Get online users in a conversation
    async getOnlineUsers(conversationId) {
        const channel = supabase.channel(`presence_${conversationId}`);
        const result = await channel.track({});
        const { data, error } = result;
        if (error)
            throw error;
        return data || [];
    },
};
//# sourceMappingURL=realtime.js.map