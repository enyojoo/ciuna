export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    role: 'USER' | 'VENDOR' | 'COURIER' | 'ADMIN';
                    country_of_origin: string;
                    city: string;
                    district: string | null;
                    phone: string | null;
                    verified_expat: boolean;
                    verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
                    documents: any | null;
                    avatar_url: string | null;
                    bio: string | null;
                    languages: string[];
                    preferences: any;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    role?: 'USER' | 'VENDOR' | 'COURIER' | 'ADMIN';
                    country_of_origin: string;
                    city: string;
                    district?: string | null;
                    phone?: string | null;
                    verified_expat?: boolean;
                    verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
                    documents?: any | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    languages?: string[];
                    preferences?: any;
                };
                Update: {
                    id?: string;
                    email?: string;
                    role?: 'USER' | 'VENDOR' | 'COURIER' | 'ADMIN';
                    country_of_origin?: string;
                    city?: string;
                    district?: string | null;
                    phone?: string | null;
                    verified_expat?: boolean;
                    verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
                    documents?: any | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    languages?: string[];
                    preferences?: any;
                };
            };
            categories: {
                Row: {
                    id: number;
                    name: string;
                    slug: string;
                    parent_id: number | null;
                    description: string | null;
                    icon: string | null;
                    sort_order: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    slug: string;
                    parent_id?: number | null;
                    description?: string | null;
                    icon?: string | null;
                    sort_order?: number;
                    is_active?: boolean;
                };
                Update: {
                    id?: number;
                    name?: string;
                    slug?: string;
                    parent_id?: number | null;
                    description?: string | null;
                    icon?: string | null;
                    sort_order?: number;
                    is_active?: boolean;
                };
            };
            listings: {
                Row: {
                    id: number;
                    seller_id: string;
                    title: string;
                    description: string;
                    category_id: number;
                    price_rub: number;
                    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
                    city: string;
                    district: string | null;
                    photo_urls: string[];
                    status: 'ACTIVE' | 'PAUSED' | 'SOLD' | 'PENDING_REVIEW';
                    is_negotiable: boolean;
                    tags: string[];
                    view_count: number;
                    favorite_count: number;
                    expires_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    seller_id: string;
                    title: string;
                    description: string;
                    category_id: number;
                    price_rub: number;
                    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
                    city: string;
                    district?: string | null;
                    photo_urls?: string[];
                    status?: 'ACTIVE' | 'PAUSED' | 'SOLD' | 'PENDING_REVIEW';
                    is_negotiable?: boolean;
                    tags?: string[];
                    view_count?: number;
                    favorite_count?: number;
                    expires_at?: string | null;
                };
                Update: {
                    id?: number;
                    seller_id?: string;
                    title?: string;
                    description?: string;
                    category_id?: number;
                    price_rub?: number;
                    condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
                    city?: string;
                    district?: string | null;
                    photo_urls?: string[];
                    status?: 'ACTIVE' | 'PAUSED' | 'SOLD' | 'PENDING_REVIEW';
                    is_negotiable?: boolean;
                    tags?: string[];
                    view_count?: number;
                    favorite_count?: number;
                    expires_at?: string | null;
                };
            };
            vendors: {
                Row: {
                    id: number;
                    owner_id: string;
                    name: string;
                    description: string;
                    logo_url: string | null;
                    country: string;
                    city: string;
                    district: string | null;
                    verified: boolean;
                    type: 'LOCAL' | 'INTERNATIONAL';
                    status: 'ACTIVE' | 'SUSPENDED';
                    business_license: string | null;
                    tax_id: string | null;
                    bank_details: any | null;
                    contact_email: string | null;
                    contact_phone: string | null;
                    website: string | null;
                    social_links: any;
                    rating: number;
                    review_count: number;
                    total_sales: number;
                    commission_rate: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    owner_id: string;
                    name: string;
                    description: string;
                    logo_url?: string | null;
                    country: string;
                    city: string;
                    district?: string | null;
                    verified?: boolean;
                    type: 'LOCAL' | 'INTERNATIONAL';
                    status?: 'ACTIVE' | 'SUSPENDED';
                    business_license?: string | null;
                    tax_id?: string | null;
                    bank_details?: any | null;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    website?: string | null;
                    social_links?: any;
                    rating?: number;
                    review_count?: number;
                    total_sales?: number;
                    commission_rate?: number;
                };
                Update: {
                    id?: number;
                    owner_id?: string;
                    name?: string;
                    description?: string;
                    logo_url?: string | null;
                    country?: string;
                    city?: string;
                    district?: string | null;
                    verified?: boolean;
                    type?: 'LOCAL' | 'INTERNATIONAL';
                    status?: 'ACTIVE' | 'SUSPENDED';
                    business_license?: string | null;
                    tax_id?: string | null;
                    bank_details?: any | null;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    website?: string | null;
                    social_links?: any;
                    rating?: number;
                    review_count?: number;
                    total_sales?: number;
                    commission_rate?: number;
                };
            };
            [key: string]: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [key: string]: {
                Args: any;
                Returns: any;
            };
        };
        Enums: {
            user_role: 'USER' | 'VENDOR' | 'COURIER' | 'ADMIN';
            verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
            condition_type: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
            listing_status: 'ACTIVE' | 'PAUSED' | 'SOLD' | 'PENDING_REVIEW';
            order_status: 'PENDING' | 'PAID' | 'FULFILLING' | 'DELIVERED' | 'CANCELLED';
            escrow_status: 'HELD' | 'RELEASED' | 'REFUNDED';
            payment_provider: 'MOCKPAY' | 'YOOMONEY' | 'SBER' | 'TINKOFF';
            payment_status: 'AUTHORIZED' | 'CAPTURED' | 'CANCELLED' | 'REFUNDED';
            delivery_status: 'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED';
            vendor_type: 'LOCAL' | 'INTERNATIONAL';
            vendor_status: 'ACTIVE' | 'SUSPENDED';
            product_status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DISABLED';
            group_buy_status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
            service_category: 'LEGAL' | 'FINANCIAL' | 'PERSONAL' | 'EVENT' | 'HEALTHCARE';
            booking_status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
            provider_status: 'ACTIVE' | 'SUSPENDED';
        };
    };
};
//# sourceMappingURL=types.d.ts.map