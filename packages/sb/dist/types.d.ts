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
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_analytics_dashboard_data: {
                Args: {
                    p_start_date: string;
                    p_end_date: string;
                };
                Returns: {
                    total_users: number;
                    total_sessions: number;
                    total_page_views: number;
                    total_conversions: number;
                    conversion_rate: number;
                    avg_session_duration: number;
                    bounce_rate: number;
                    top_pages: any;
                    top_events: any;
                    device_breakdown: any;
                    country_breakdown: any;
                }[];
            };
            get_user_notifications: {
                Args: {
                    p_user_id: string;
                    p_limit?: number;
                    p_offset?: number;
                    p_unread_only?: boolean;
                };
                Returns: {
                    id: string;
                    type: string;
                    channel: string;
                    status: string;
                    subject: string;
                    title: string;
                    content: string;
                    data: any;
                    sent_at: string;
                    read_at: string | null;
                    created_at: string;
                }[];
            };
            mark_notification_read: {
                Args: {
                    p_notification_id: string;
                };
                Returns: boolean;
            };
            track_event: {
                Args: {
                    p_user_id: string | null;
                    p_session_id: string | null;
                    p_event_type: string;
                    p_event_category: string;
                    p_event_action: string;
                    p_event_label: string | null;
                    p_event_value: number | null;
                    p_properties: any;
                    p_page_url: string | null;
                    p_referrer: string | null;
                    p_user_agent: string | null;
                    p_ip_address: string | null;
                    p_country_code: string | null;
                    p_city: string | null;
                    p_device_type: string | null;
                    p_browser: string | null;
                    p_os: string | null;
                };
                Returns: boolean;
            };
            track_conversion: {
                Args: {
                    p_user_id: string | null;
                    p_session_id: string | null;
                    p_conversion_type: string;
                    p_conversion_value: number | null;
                    p_currency_code: string;
                    p_item_id: string | null;
                    p_item_type: string | null;
                    p_properties: any;
                };
                Returns: boolean;
            };
            create_business_report: {
                Args: {
                    p_user_id: string;
                    p_report_type: string;
                    p_title: string;
                    p_date_range_start: string;
                    p_date_range_end: string;
                    p_filters: any;
                };
                Returns: any;
            };
            calculate_business_metrics: {
                Args: {
                    p_user_id: string;
                    p_start_date: string;
                    p_end_date: string;
                };
                Returns: any;
            };
            update_inventory_quantity: {
                Args: {
                    p_inventory_item_id: string;
                    p_quantity_change: number;
                    p_movement_type: string;
                    p_reason: string | null;
                    p_reference_id: string | null;
                    p_reference_type: string | null;
                    p_created_by: string | null;
                };
                Returns: boolean;
            };
            get_exchange_rate: {
                Args: {
                    p_from_currency: string;
                    p_to_currency: string;
                    p_date: string;
                };
                Returns: {
                    rate: number;
                    updated_at: string;
                }[];
            };
            get_translation: {
                Args: {
                    p_key: string;
                    p_language_code: string;
                    p_namespace: string;
                };
                Returns: {
                    translation: string;
                }[];
            };
            get_localized_content: {
                Args: {
                    p_content_type: string;
                    p_content_id: string;
                    p_language_code: string;
                    p_field_name: string;
                };
                Returns: {
                    content: any;
                }[];
            };
            set_localized_content: {
                Args: {
                    p_content_type: string;
                    p_content_id: string;
                    p_language_code: string;
                    p_field_name: string;
                    p_field_value: string;
                };
                Returns: boolean;
            };
            create_notification: {
                Args: {
                    p_user_id: string;
                    p_type: string;
                    p_channel: string;
                    p_title: string;
                    p_content: string;
                    p_data?: any;
                    p_scheduled_for: string;
                };
                Returns: string;
            };
            create_payment_transaction: {
                Args: {
                    p_user_id: string;
                    p_order_id: string;
                    p_provider_id: string;
                    p_payment_method_id: string;
                    p_amount: number;
                    p_currency_code: string;
                    p_metadata: any;
                };
                Returns: string;
            };
            process_payment_webhook: {
                Args: {
                    p_provider_id: string;
                    p_webhook_id: string;
                    p_event_type: string;
                    p_payload: any;
                    p_signature: string | null;
                };
                Returns: boolean;
            };
            search_content: {
                Args: {
                    p_query: string;
                    p_content_type: string;
                    p_limit: number;
                    p_offset: number;
                    p_filters: any;
                    p_user_id: string | null;
                };
                Returns: any[];
            };
            get_search_suggestions: {
                Args: {
                    p_query: string;
                    p_limit?: number;
                };
                Returns: any[];
            };
            increment_failed_attempts: {
                Args: {
                    p_user_id: string;
                };
                Returns: boolean;
            };
            log_security_event: {
                Args: {
                    p_user_id: string | null;
                    p_event_type: string;
                    p_severity: string;
                    p_description: string;
                    p_ip_address: string | null;
                    p_user_agent: string | null;
                    p_location_data: any;
                    p_metadata: any;
                };
                Returns: boolean;
            };
            check_rate_limit: {
                Args: {
                    p_identifier: string;
                    p_action: string;
                    p_max_attempts: number;
                    p_window_minutes: number;
                };
                Returns: {
                    allowed: boolean;
                    remaining: number;
                    reset_time: string;
                }[];
            };
            check_account_lockout: {
                Args: {
                    p_user_id: string;
                };
                Returns: {
                    locked: boolean;
                    lockout_until: string | null;
                }[];
            };
            generate_api_key: {
                Args: {
                    p_user_id: string;
                    p_name: string;
                    p_permissions: string[];
                    p_expires_at: string | null;
                };
                Returns: {
                    api_key: string;
                    key_id: string;
                }[];
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