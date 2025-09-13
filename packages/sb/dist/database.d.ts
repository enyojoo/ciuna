import type { Listing, CreateListing, UpdateListing, ListingFilters, Vendor, CreateVendor, UpdateVendor, VendorProduct, CreateVendorProduct, UpdateVendorProduct, ProductFilters, Service, CreateService, UpdateService, ServiceFilters, ServiceBooking, CreateServiceBooking, UpdateServiceBooking, Order, CreateOrder, UpdateOrder, Conversation, Message, CreateMessage, Category, CreateCategory, UpdateCategory } from '@ciuna/types';
export declare const db: {
    categories: {
        getAll(): Promise<Category[]>;
        getById(id: number): Promise<Category | null>;
        create(category: CreateCategory): Promise<Category>;
        update(id: number, updates: UpdateCategory): Promise<Category>;
    };
    listings: {
        getAll(filters?: ListingFilters, page?: number, limit?: number): Promise<{
            data: Listing[];
            total: number;
        }>;
        getById(id: number): Promise<Listing | null>;
        create(listing: CreateListing): Promise<Listing>;
        update(id: number, updates: UpdateListing): Promise<Listing>;
        delete(id: number): Promise<void>;
    };
    vendors: {
        getAll(filters?: {
            type?: string;
            city?: string;
            verified?: boolean;
        }, page?: number, limit?: number): Promise<{
            data: Vendor[];
            total: number;
        }>;
        getById(id: string): Promise<Vendor | null>;
        create(vendor: CreateVendor): Promise<Vendor>;
        update(id: string, updates: UpdateVendor): Promise<Vendor>;
        getByOwnerId(ownerId: string): Promise<Vendor | null>;
    };
    products: {
        getAll(filters?: ProductFilters, page?: number, limit?: number): Promise<{
            data: VendorProduct[];
            total: number;
        }>;
        getById(id: number): Promise<VendorProduct | null>;
        create(product: CreateVendorProduct): Promise<VendorProduct>;
        update(id: number, updates: UpdateVendorProduct): Promise<VendorProduct>;
    };
    services: {
        getAll(filters?: ServiceFilters, page?: number, limit?: number): Promise<{
            data: Service[];
            total: number;
        }>;
        getById(id: number): Promise<Service | null>;
        create(service: CreateService): Promise<Service>;
        update(id: number, updates: UpdateService): Promise<Service>;
    };
    bookings: {
        getAll(filters?: {
            client_id?: string;
            service_id?: number;
            status?: string;
        }, page?: number, limit?: number): Promise<{
            data: ServiceBooking[];
            total: number;
        }>;
        getById(id: number): Promise<ServiceBooking | null>;
        create(booking: CreateServiceBooking): Promise<ServiceBooking>;
        update(id: number, updates: UpdateServiceBooking): Promise<ServiceBooking>;
    };
    orders: {
        getAll(filters?: {
            buyer_id?: string;
            seller_id?: string;
            status?: string;
        }, page?: number, limit?: number): Promise<{
            data: Order[];
            total: number;
        }>;
        getById(id: string): Promise<Order | null>;
        create(order: CreateOrder): Promise<Order>;
        update(id: string, updates: UpdateOrder): Promise<Order>;
    };
    conversations: {
        getAll(userId: string, page?: number, limit?: number): Promise<{
            data: Conversation[];
            total: number;
        }>;
        getById(id: string): Promise<Conversation | null>;
        create(conversation: Partial<Conversation>): Promise<Conversation>;
    };
    messages: {
        getAll(conversationId: string, page?: number, limit?: number): Promise<{
            data: Message[];
            total: number;
        }>;
        create(message: CreateMessage): Promise<Message>;
        markAsRead(messageId: string): Promise<void>;
    };
    profiles: {
        getAll(): Promise<any[]>;
        getById(id: string): Promise<any | null>;
        update(id: string, updates: any): Promise<any>;
    };
    serviceProviders: {
        getAll(): Promise<any[]>;
        getById(id: string): Promise<any | null>;
    };
};
//# sourceMappingURL=database.d.ts.map