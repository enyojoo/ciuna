import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
export declare const realtime: {
    subscribeToTable<T extends {
        [key: string]: any;
    } = any>(table: string, callback: (payload: RealtimePostgresChangesPayload<T>) => void, options?: {
        event?: "INSERT" | "UPDATE" | "DELETE" | "*";
        schema?: string;
        filter?: string;
    }): RealtimeChannel;
    subscribeToMessages(conversationId: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToOrder(orderId: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToDelivery(deliveryId: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToGroupBuyDeal(dealId: number, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToServiceBooking(bookingId: number, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToUserConversations(userId: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToCategoryListings(categoryId: number, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToVendorProducts(vendorId: number, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    subscribeToProviderServices(providerId: number, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel;
    unsubscribe(channel: RealtimeChannel): void;
    unsubscribeAll(): void;
};
export declare const presence: {
    trackPresence(conversationId: string, userId: string, userInfo: {
        name: string;
        avatar?: string;
    }): RealtimeChannel;
    getOnlineUsers(conversationId: string): Promise<any[]>;
};
//# sourceMappingURL=realtime.d.ts.map