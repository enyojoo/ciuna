import { z } from 'zod';
export declare const GroupBuyDealSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    vendor_product_id: z.ZodString;
    min_quantity: z.ZodNumber;
    discount_percentage: z.ZodNumber;
    expires_at: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "COMPLETED", "CANCELLED"]>>;
    current_quantity: z.ZodDefault<z.ZodNumber>;
    max_quantity: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    terms: z.ZodOptional<z.ZodString>;
    is_featured: z.ZodDefault<z.ZodBoolean>;
    featured_until: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "ACTIVE" | "CANCELLED" | "COMPLETED";
    expires_at: string;
    vendor_product_id: string;
    min_quantity: number;
    discount_percentage: number;
    current_quantity: number;
    is_featured: boolean;
    max_quantity?: number | undefined;
    description?: string | undefined;
    terms?: string | undefined;
    featured_until?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    expires_at: string;
    vendor_product_id: string;
    min_quantity: number;
    discount_percentage: number;
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED" | undefined;
    current_quantity?: number | undefined;
    max_quantity?: number | undefined;
    description?: string | undefined;
    terms?: string | undefined;
    is_featured?: boolean | undefined;
    featured_until?: string | undefined;
}>;
export declare const CreateGroupBuyDealSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    vendor_product_id: z.ZodString;
    min_quantity: z.ZodNumber;
    discount_percentage: z.ZodNumber;
    expires_at: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "COMPLETED", "CANCELLED"]>>;
    current_quantity: z.ZodDefault<z.ZodNumber>;
    max_quantity: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    terms: z.ZodOptional<z.ZodString>;
    is_featured: z.ZodDefault<z.ZodBoolean>;
    featured_until: z.ZodOptional<z.ZodString>;
}, "id" | "created_at" | "updated_at" | "current_quantity">, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "CANCELLED" | "COMPLETED";
    expires_at: string;
    vendor_product_id: string;
    min_quantity: number;
    discount_percentage: number;
    is_featured: boolean;
    description?: string | undefined;
    max_quantity?: number | undefined;
    terms?: string | undefined;
    featured_until?: string | undefined;
}, {
    expires_at: string;
    vendor_product_id: string;
    min_quantity: number;
    discount_percentage: number;
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED" | undefined;
    description?: string | undefined;
    max_quantity?: number | undefined;
    terms?: string | undefined;
    is_featured?: boolean | undefined;
    featured_until?: string | undefined;
}>;
export declare const UpdateGroupBuyDealSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    vendor_product_id: z.ZodOptional<z.ZodString>;
    min_quantity: z.ZodOptional<z.ZodNumber>;
    discount_percentage: z.ZodOptional<z.ZodNumber>;
    expires_at: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["ACTIVE", "COMPLETED", "CANCELLED"]>>>;
    current_quantity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    max_quantity: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    terms: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    is_featured: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    featured_until: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "created_at" | "updated_at" | "vendor_product_id" | "current_quantity">, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED" | undefined;
    description?: string | undefined;
    expires_at?: string | undefined;
    min_quantity?: number | undefined;
    discount_percentage?: number | undefined;
    max_quantity?: number | undefined;
    terms?: string | undefined;
    is_featured?: boolean | undefined;
    featured_until?: string | undefined;
}, {
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED" | undefined;
    description?: string | undefined;
    expires_at?: string | undefined;
    min_quantity?: number | undefined;
    discount_percentage?: number | undefined;
    max_quantity?: number | undefined;
    terms?: string | undefined;
    is_featured?: boolean | undefined;
    featured_until?: string | undefined;
}>;
export declare const GroupBuyOrderSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    deal_id: z.ZodString;
    buyer_id: z.ZodString;
    quantity: z.ZodNumber;
    price_per_unit_rub: z.ZodNumber;
    total_amount_rub: z.ZodNumber;
    discount_amount_rub: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"]>>;
    payment_id: z.ZodOptional<z.ZodString>;
    order_id: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    cancelled_at: z.ZodOptional<z.ZodString>;
    cancelled_reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED";
    total_amount_rub: number;
    deal_id: string;
    buyer_id: string;
    quantity: number;
    price_per_unit_rub: number;
    discount_amount_rub: number;
    payment_id?: string | undefined;
    order_id?: string | undefined;
    notes?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    total_amount_rub: number;
    deal_id: string;
    buyer_id: string;
    quantity: number;
    price_per_unit_rub: number;
    discount_amount_rub: number;
    status?: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED" | undefined;
    payment_id?: string | undefined;
    order_id?: string | undefined;
    notes?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
}>;
export declare const CreateGroupBuyOrderSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    deal_id: z.ZodString;
    buyer_id: z.ZodString;
    quantity: z.ZodNumber;
    price_per_unit_rub: z.ZodNumber;
    total_amount_rub: z.ZodNumber;
    discount_amount_rub: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"]>>;
    payment_id: z.ZodOptional<z.ZodString>;
    order_id: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    cancelled_at: z.ZodOptional<z.ZodString>;
    cancelled_reason: z.ZodOptional<z.ZodString>;
}, "id" | "created_at" | "updated_at" | "cancelled_at" | "cancelled_reason">, "strip", z.ZodTypeAny, {
    status: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED";
    total_amount_rub: number;
    deal_id: string;
    buyer_id: string;
    quantity: number;
    price_per_unit_rub: number;
    discount_amount_rub: number;
    payment_id?: string | undefined;
    notes?: string | undefined;
    order_id?: string | undefined;
}, {
    total_amount_rub: number;
    deal_id: string;
    buyer_id: string;
    quantity: number;
    price_per_unit_rub: number;
    discount_amount_rub: number;
    status?: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED" | undefined;
    payment_id?: string | undefined;
    notes?: string | undefined;
    order_id?: string | undefined;
}>;
export declare const UpdateGroupBuyOrderSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    deal_id: z.ZodOptional<z.ZodString>;
    buyer_id: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
    price_per_unit_rub: z.ZodOptional<z.ZodNumber>;
    total_amount_rub: z.ZodOptional<z.ZodNumber>;
    discount_amount_rub: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"]>>>;
    payment_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    order_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cancelled_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cancelled_reason: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "created_at" | "updated_at" | "cancelled_at" | "cancelled_reason" | "deal_id" | "buyer_id">, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED" | undefined;
    total_amount_rub?: number | undefined;
    payment_id?: string | undefined;
    notes?: string | undefined;
    quantity?: number | undefined;
    price_per_unit_rub?: number | undefined;
    discount_amount_rub?: number | undefined;
    order_id?: string | undefined;
}, {
    status?: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED" | undefined;
    total_amount_rub?: number | undefined;
    payment_id?: string | undefined;
    notes?: string | undefined;
    quantity?: number | undefined;
    price_per_unit_rub?: number | undefined;
    discount_amount_rub?: number | undefined;
    order_id?: string | undefined;
}>;
export declare const GroupBuyDealWithRelationsSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "COMPLETED", "CANCELLED"]>>;
    description: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodString;
    vendor_product_id: z.ZodString;
    min_quantity: z.ZodNumber;
    discount_percentage: z.ZodNumber;
    current_quantity: z.ZodDefault<z.ZodNumber>;
    max_quantity: z.ZodOptional<z.ZodNumber>;
    terms: z.ZodOptional<z.ZodString>;
    is_featured: z.ZodDefault<z.ZodBoolean>;
    featured_until: z.ZodOptional<z.ZodString>;
    vendor_product: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        price_rub: z.ZodNumber;
        photo_urls: z.ZodArray<z.ZodString, "many">;
        vendor: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            country: z.ZodString;
            city: z.ZodString;
            verified: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
        }, {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
        };
    }, {
        id: string;
        description: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
        };
    }>;
    orders: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        buyer_id: z.ZodString;
        quantity: z.ZodNumber;
        total_amount_rub: z.ZodNumber;
        status: z.ZodString;
        created_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        created_at: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        quantity: number;
    }, {
        id: string;
        created_at: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        quantity: number;
    }>, "many">;
    participants: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        buyer: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            country_of_origin: z.ZodString;
            city: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
        }, {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
        }>;
        quantity: z.ZodNumber;
        joined_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        joined_at: string;
        quantity: number;
        buyer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
        };
    }, {
        id: string;
        joined_at: string;
        quantity: number;
        buyer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "ACTIVE" | "CANCELLED" | "COMPLETED";
    expires_at: string;
    vendor_product_id: string;
    participants: {
        id: string;
        joined_at: string;
        quantity: number;
        buyer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
        };
    }[];
    vendor_product: {
        id: string;
        description: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
        };
    };
    min_quantity: number;
    discount_percentage: number;
    current_quantity: number;
    is_featured: boolean;
    orders: {
        id: string;
        created_at: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        quantity: number;
    }[];
    description?: string | undefined;
    max_quantity?: number | undefined;
    terms?: string | undefined;
    featured_until?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    expires_at: string;
    vendor_product_id: string;
    participants: {
        id: string;
        joined_at: string;
        quantity: number;
        buyer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
        };
    }[];
    vendor_product: {
        id: string;
        description: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
        };
    };
    min_quantity: number;
    discount_percentage: number;
    orders: {
        id: string;
        created_at: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        quantity: number;
    }[];
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED" | undefined;
    description?: string | undefined;
    current_quantity?: number | undefined;
    max_quantity?: number | undefined;
    terms?: string | undefined;
    is_featured?: boolean | undefined;
    featured_until?: string | undefined;
}>;
export declare const GroupBuyOrderWithRelationsSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"]>>;
    total_amount_rub: z.ZodNumber;
    payment_id: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    cancelled_at: z.ZodOptional<z.ZodString>;
    cancelled_reason: z.ZodOptional<z.ZodString>;
    deal_id: z.ZodString;
    buyer_id: z.ZodString;
    quantity: z.ZodNumber;
    price_per_unit_rub: z.ZodNumber;
    discount_amount_rub: z.ZodNumber;
    order_id: z.ZodOptional<z.ZodString>;
    deal: z.ZodObject<{
        id: z.ZodString;
        vendor_product_id: z.ZodString;
        min_quantity: z.ZodNumber;
        discount_percentage: z.ZodNumber;
        expires_at: z.ZodString;
        status: z.ZodString;
        current_quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: string;
        expires_at: string;
        vendor_product_id: string;
        min_quantity: number;
        discount_percentage: number;
        current_quantity: number;
    }, {
        id: string;
        status: string;
        expires_at: string;
        vendor_product_id: string;
        min_quantity: number;
        discount_percentage: number;
        current_quantity: number;
    }>;
    buyer: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        country_of_origin: z.ZodString;
        city: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
    }, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
    }>;
    vendor_product: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        price_rub: z.ZodNumber;
        photo_urls: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
    }, {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED";
    total_amount_rub: number;
    vendor_product: {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
    };
    deal_id: string;
    buyer_id: string;
    quantity: number;
    price_per_unit_rub: number;
    discount_amount_rub: number;
    buyer: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
    };
    deal: {
        id: string;
        status: string;
        expires_at: string;
        vendor_product_id: string;
        min_quantity: number;
        discount_percentage: number;
        current_quantity: number;
    };
    payment_id?: string | undefined;
    notes?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    order_id?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    total_amount_rub: number;
    vendor_product: {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
    };
    deal_id: string;
    buyer_id: string;
    quantity: number;
    price_per_unit_rub: number;
    discount_amount_rub: number;
    buyer: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
    };
    deal: {
        id: string;
        status: string;
        expires_at: string;
        vendor_product_id: string;
        min_quantity: number;
        discount_percentage: number;
        current_quantity: number;
    };
    status?: "PENDING" | "CANCELLED" | "REFUNDED" | "CONFIRMED" | undefined;
    payment_id?: string | undefined;
    notes?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    order_id?: string | undefined;
}>;
export declare const GroupBuyStatsSchema: z.ZodObject<{
    total_deals: z.ZodNumber;
    active_deals: z.ZodNumber;
    completed_deals: z.ZodNumber;
    total_orders: z.ZodNumber;
    total_savings: z.ZodNumber;
    average_discount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_deals: number;
    active_deals: number;
    completed_deals: number;
    total_orders: number;
    total_savings: number;
    average_discount: number;
}, {
    total_deals: number;
    active_deals: number;
    completed_deals: number;
    total_orders: number;
    total_savings: number;
    average_discount: number;
}>;
export declare const GroupBuyFiltersSchema: z.ZodObject<{
    vendor_id: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "COMPLETED", "CANCELLED"]>>;
    min_discount: z.ZodOptional<z.ZodNumber>;
    max_discount: z.ZodOptional<z.ZodNumber>;
    expires_after: z.ZodOptional<z.ZodString>;
    expires_before: z.ZodOptional<z.ZodString>;
    is_featured: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    vendor_id?: string | undefined;
    category_id?: string | undefined;
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED" | undefined;
    min_discount?: number | undefined;
    max_discount?: number | undefined;
    expires_after?: string | undefined;
    expires_before?: string | undefined;
    is_featured?: boolean | undefined;
    search?: string | undefined;
}, {
    vendor_id?: string | undefined;
    category_id?: string | undefined;
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED" | undefined;
    min_discount?: number | undefined;
    max_discount?: number | undefined;
    expires_after?: string | undefined;
    expires_before?: string | undefined;
    is_featured?: boolean | undefined;
    search?: string | undefined;
}>;
export type GroupBuyDeal = z.infer<typeof GroupBuyDealSchema>;
export type CreateGroupBuyDeal = z.infer<typeof CreateGroupBuyDealSchema>;
export type UpdateGroupBuyDeal = z.infer<typeof UpdateGroupBuyDealSchema>;
export type GroupBuyOrder = z.infer<typeof GroupBuyOrderSchema>;
export type CreateGroupBuyOrder = z.infer<typeof CreateGroupBuyOrderSchema>;
export type UpdateGroupBuyOrder = z.infer<typeof UpdateGroupBuyOrderSchema>;
export type GroupBuyDealWithRelations = z.infer<typeof GroupBuyDealWithRelationsSchema>;
export type GroupBuyOrderWithRelations = z.infer<typeof GroupBuyOrderWithRelationsSchema>;
export type GroupBuyStats = z.infer<typeof GroupBuyStatsSchema>;
export type GroupBuyFilters = z.infer<typeof GroupBuyFiltersSchema>;
//# sourceMappingURL=group-buying.d.ts.map