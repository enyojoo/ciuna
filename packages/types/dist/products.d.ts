import { z } from 'zod';
export declare const VendorProductSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    vendor_id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category_id: z.ZodString;
    price_rub: z.ZodNumber;
    stock_quantity: z.ZodDefault<z.ZodNumber>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    is_local_stock: z.ZodDefault<z.ZodBoolean>;
    is_dropship: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>>;
    sku: z.ZodOptional<z.ZodString>;
    weight_kg: z.ZodOptional<z.ZodNumber>;
    dimensions: z.ZodOptional<z.ZodObject<{
        length_cm: z.ZodNumber;
        width_cm: z.ZodNumber;
        height_cm: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    specifications: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    shipping_info: z.ZodOptional<z.ZodObject<{
        free_shipping_threshold: z.ZodOptional<z.ZodNumber>;
        shipping_cost_rub: z.ZodOptional<z.ZodNumber>;
        estimated_days: z.ZodOptional<z.ZodNumber>;
        countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    }, {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    }>>;
    seo_title: z.ZodOptional<z.ZodString>;
    seo_description: z.ZodOptional<z.ZodString>;
    view_count: z.ZodDefault<z.ZodNumber>;
    favorite_count: z.ZodDefault<z.ZodNumber>;
    sales_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED";
    description: string;
    price_rub: number;
    name: string;
    photo_urls: string[];
    vendor_id: string;
    category_id: string;
    tags: string[];
    view_count: number;
    favorite_count: number;
    stock_quantity: number;
    is_local_stock: boolean;
    is_dropship: boolean;
    specifications: Record<string, any>;
    sales_count: number;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    sku?: string | undefined;
    shipping_info?: {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    description: string;
    price_rub: number;
    name: string;
    vendor_id: string;
    category_id: string;
    status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
    photo_urls?: string[] | undefined;
    tags?: string[] | undefined;
    view_count?: number | undefined;
    favorite_count?: number | undefined;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    stock_quantity?: number | undefined;
    is_local_stock?: boolean | undefined;
    is_dropship?: boolean | undefined;
    sku?: string | undefined;
    specifications?: Record<string, any> | undefined;
    shipping_info?: {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
    sales_count?: number | undefined;
}>;
export declare const CreateVendorProductSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    vendor_id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category_id: z.ZodString;
    price_rub: z.ZodNumber;
    stock_quantity: z.ZodDefault<z.ZodNumber>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    is_local_stock: z.ZodDefault<z.ZodBoolean>;
    is_dropship: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>>;
    sku: z.ZodOptional<z.ZodString>;
    weight_kg: z.ZodOptional<z.ZodNumber>;
    dimensions: z.ZodOptional<z.ZodObject<{
        length_cm: z.ZodNumber;
        width_cm: z.ZodNumber;
        height_cm: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    specifications: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    shipping_info: z.ZodOptional<z.ZodObject<{
        free_shipping_threshold: z.ZodOptional<z.ZodNumber>;
        shipping_cost_rub: z.ZodOptional<z.ZodNumber>;
        estimated_days: z.ZodOptional<z.ZodNumber>;
        countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    }, {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    }>>;
    seo_title: z.ZodOptional<z.ZodString>;
    seo_description: z.ZodOptional<z.ZodString>;
    view_count: z.ZodDefault<z.ZodNumber>;
    favorite_count: z.ZodDefault<z.ZodNumber>;
    sales_count: z.ZodDefault<z.ZodNumber>;
}, "id" | "created_at" | "updated_at" | "view_count" | "favorite_count" | "sales_count">, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED";
    description: string;
    price_rub: number;
    name: string;
    photo_urls: string[];
    vendor_id: string;
    category_id: string;
    tags: string[];
    stock_quantity: number;
    is_local_stock: boolean;
    is_dropship: boolean;
    specifications: Record<string, any>;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    sku?: string | undefined;
    shipping_info?: {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
}, {
    description: string;
    price_rub: number;
    name: string;
    vendor_id: string;
    category_id: string;
    status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
    photo_urls?: string[] | undefined;
    tags?: string[] | undefined;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    stock_quantity?: number | undefined;
    is_local_stock?: boolean | undefined;
    is_dropship?: boolean | undefined;
    sku?: string | undefined;
    specifications?: Record<string, any> | undefined;
    shipping_info?: {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
}>;
export declare const UpdateVendorProductSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    vendor_id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodString>;
    price_rub: z.ZodOptional<z.ZodNumber>;
    stock_quantity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    photo_urls: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    is_local_stock: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    is_dropship: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>>>;
    sku: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    weight_kg: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    dimensions: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        length_cm: z.ZodNumber;
        width_cm: z.ZodNumber;
        height_cm: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }>>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    specifications: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    shipping_info: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        free_shipping_threshold: z.ZodOptional<z.ZodNumber>;
        shipping_cost_rub: z.ZodOptional<z.ZodNumber>;
        estimated_days: z.ZodOptional<z.ZodNumber>;
        countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    }, {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    }>>>;
    seo_title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    seo_description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    view_count: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    favorite_count: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    sales_count: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "id" | "created_at" | "updated_at" | "vendor_id" | "view_count" | "favorite_count" | "sales_count">, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
    description?: string | undefined;
    price_rub?: number | undefined;
    name?: string | undefined;
    photo_urls?: string[] | undefined;
    category_id?: string | undefined;
    tags?: string[] | undefined;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    stock_quantity?: number | undefined;
    is_local_stock?: boolean | undefined;
    is_dropship?: boolean | undefined;
    sku?: string | undefined;
    specifications?: Record<string, any> | undefined;
    shipping_info?: {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
}, {
    status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
    description?: string | undefined;
    price_rub?: number | undefined;
    name?: string | undefined;
    photo_urls?: string[] | undefined;
    category_id?: string | undefined;
    tags?: string[] | undefined;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    stock_quantity?: number | undefined;
    is_local_stock?: boolean | undefined;
    is_dropship?: boolean | undefined;
    sku?: string | undefined;
    specifications?: Record<string, any> | undefined;
    shipping_info?: {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
}>;
export declare const VendorProductWithRelationsSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    vendor_id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category_id: z.ZodString;
    price_rub: z.ZodNumber;
    stock_quantity: z.ZodDefault<z.ZodNumber>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    is_local_stock: z.ZodDefault<z.ZodBoolean>;
    is_dropship: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>>;
    sku: z.ZodOptional<z.ZodString>;
    weight_kg: z.ZodOptional<z.ZodNumber>;
    dimensions: z.ZodOptional<z.ZodObject<{
        length_cm: z.ZodNumber;
        width_cm: z.ZodNumber;
        height_cm: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }, {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    }>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    specifications: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    shipping_info: z.ZodOptional<z.ZodObject<{
        free_shipping_threshold: z.ZodOptional<z.ZodNumber>;
        shipping_cost_rub: z.ZodOptional<z.ZodNumber>;
        estimated_days: z.ZodOptional<z.ZodNumber>;
        countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    }, {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    }>>;
    seo_title: z.ZodOptional<z.ZodString>;
    seo_description: z.ZodOptional<z.ZodString>;
    view_count: z.ZodDefault<z.ZodNumber>;
    favorite_count: z.ZodDefault<z.ZodNumber>;
    sales_count: z.ZodDefault<z.ZodNumber>;
} & {
    vendor: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        country: z.ZodString;
        city: z.ZodString;
        verified: z.ZodBoolean;
        rating: z.ZodNumber;
        review_count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        city: string;
        country: string;
        name: string;
        verified: boolean;
        rating: number;
        review_count: number;
    }, {
        id: string;
        city: string;
        country: string;
        name: string;
        verified: boolean;
        rating: number;
        review_count: number;
    }>;
    category: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        slug: string;
    }, {
        id: string;
        name: string;
        slug: string;
    }>;
    photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mime_type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        filename: string;
        size: number;
        mime_type: string;
    }, {
        url: string;
        filename: string;
        size: number;
        mime_type: string;
    }>, "many">>;
    reviews: z.ZodOptional<z.ZodObject<{
        average_rating: z.ZodNumber;
        total_count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        average_rating: number;
        total_count: number;
    }, {
        average_rating: number;
        total_count: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED";
    description: string;
    price_rub: number;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    name: string;
    photo_urls: string[];
    vendor: {
        id: string;
        city: string;
        country: string;
        name: string;
        verified: boolean;
        rating: number;
        review_count: number;
    };
    vendor_id: string;
    category_id: string;
    tags: string[];
    view_count: number;
    favorite_count: number;
    stock_quantity: number;
    is_local_stock: boolean;
    is_dropship: boolean;
    specifications: Record<string, any>;
    sales_count: number;
    photos?: {
        url: string;
        filename: string;
        size: number;
        mime_type: string;
    }[] | undefined;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    sku?: string | undefined;
    shipping_info?: {
        countries: string[];
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
    reviews?: {
        average_rating: number;
        total_count: number;
    } | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    description: string;
    price_rub: number;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    name: string;
    vendor: {
        id: string;
        city: string;
        country: string;
        name: string;
        verified: boolean;
        rating: number;
        review_count: number;
    };
    vendor_id: string;
    category_id: string;
    status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
    photo_urls?: string[] | undefined;
    tags?: string[] | undefined;
    view_count?: number | undefined;
    favorite_count?: number | undefined;
    photos?: {
        url: string;
        filename: string;
        size: number;
        mime_type: string;
    }[] | undefined;
    weight_kg?: number | undefined;
    dimensions?: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    } | undefined;
    stock_quantity?: number | undefined;
    is_local_stock?: boolean | undefined;
    is_dropship?: boolean | undefined;
    sku?: string | undefined;
    specifications?: Record<string, any> | undefined;
    shipping_info?: {
        estimated_days?: number | undefined;
        free_shipping_threshold?: number | undefined;
        shipping_cost_rub?: number | undefined;
        countries?: string[] | undefined;
    } | undefined;
    seo_title?: string | undefined;
    seo_description?: string | undefined;
    sales_count?: number | undefined;
    reviews?: {
        average_rating: number;
        total_count: number;
    } | undefined;
}>;
export declare const ProductFiltersSchema: z.ZodObject<{
    vendor_id: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodString>;
    min_price: z.ZodOptional<z.ZodNumber>;
    max_price: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>>;
    is_local_stock: z.ZodOptional<z.ZodBoolean>;
    is_dropship: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    min_rating: z.ZodOptional<z.ZodNumber>;
    in_stock: z.ZodOptional<z.ZodBoolean>;
    country: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
    city?: string | undefined;
    country?: string | undefined;
    vendor_id?: string | undefined;
    category_id?: string | undefined;
    search?: string | undefined;
    tags?: string[] | undefined;
    min_price?: number | undefined;
    max_price?: number | undefined;
    min_rating?: number | undefined;
    is_local_stock?: boolean | undefined;
    is_dropship?: boolean | undefined;
    in_stock?: boolean | undefined;
}, {
    status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
    city?: string | undefined;
    country?: string | undefined;
    vendor_id?: string | undefined;
    category_id?: string | undefined;
    search?: string | undefined;
    tags?: string[] | undefined;
    min_price?: number | undefined;
    max_price?: number | undefined;
    min_rating?: number | undefined;
    is_local_stock?: boolean | undefined;
    is_dropship?: boolean | undefined;
    in_stock?: boolean | undefined;
}>;
export declare const ProductSearchResponseSchema: z.ZodObject<{
    products: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        created_at: z.ZodString;
        updated_at: z.ZodString;
    } & {
        vendor_id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        category_id: z.ZodString;
        price_rub: z.ZodNumber;
        stock_quantity: z.ZodDefault<z.ZodNumber>;
        photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        is_local_stock: z.ZodDefault<z.ZodBoolean>;
        is_dropship: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodDefault<z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>>;
        sku: z.ZodOptional<z.ZodString>;
        weight_kg: z.ZodOptional<z.ZodNumber>;
        dimensions: z.ZodOptional<z.ZodObject<{
            length_cm: z.ZodNumber;
            width_cm: z.ZodNumber;
            height_cm: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            length_cm: number;
            width_cm: number;
            height_cm: number;
        }, {
            length_cm: number;
            width_cm: number;
            height_cm: number;
        }>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        specifications: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        shipping_info: z.ZodOptional<z.ZodObject<{
            free_shipping_threshold: z.ZodOptional<z.ZodNumber>;
            shipping_cost_rub: z.ZodOptional<z.ZodNumber>;
            estimated_days: z.ZodOptional<z.ZodNumber>;
            countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            countries: string[];
            estimated_days?: number | undefined;
            free_shipping_threshold?: number | undefined;
            shipping_cost_rub?: number | undefined;
        }, {
            estimated_days?: number | undefined;
            free_shipping_threshold?: number | undefined;
            shipping_cost_rub?: number | undefined;
            countries?: string[] | undefined;
        }>>;
        seo_title: z.ZodOptional<z.ZodString>;
        seo_description: z.ZodOptional<z.ZodString>;
        view_count: z.ZodDefault<z.ZodNumber>;
        favorite_count: z.ZodDefault<z.ZodNumber>;
        sales_count: z.ZodDefault<z.ZodNumber>;
    } & {
        vendor: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            country: z.ZodString;
            city: z.ZodString;
            verified: z.ZodBoolean;
            rating: z.ZodNumber;
            review_count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
            rating: number;
            review_count: number;
        }, {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
            rating: number;
            review_count: number;
        }>;
        category: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            slug: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            slug: string;
        }, {
            id: string;
            name: string;
            slug: string;
        }>;
        photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            filename: z.ZodString;
            size: z.ZodNumber;
            mime_type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            filename: string;
            size: number;
            mime_type: string;
        }, {
            url: string;
            filename: string;
            size: number;
            mime_type: string;
        }>, "many">>;
        reviews: z.ZodOptional<z.ZodObject<{
            average_rating: z.ZodNumber;
            total_count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            average_rating: number;
            total_count: number;
        }, {
            average_rating: number;
            total_count: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        created_at: string;
        updated_at: string;
        status: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED";
        description: string;
        price_rub: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
            rating: number;
            review_count: number;
        };
        vendor_id: string;
        category_id: string;
        tags: string[];
        view_count: number;
        favorite_count: number;
        stock_quantity: number;
        is_local_stock: boolean;
        is_dropship: boolean;
        specifications: Record<string, any>;
        sales_count: number;
        photos?: {
            url: string;
            filename: string;
            size: number;
            mime_type: string;
        }[] | undefined;
        weight_kg?: number | undefined;
        dimensions?: {
            length_cm: number;
            width_cm: number;
            height_cm: number;
        } | undefined;
        sku?: string | undefined;
        shipping_info?: {
            countries: string[];
            estimated_days?: number | undefined;
            free_shipping_threshold?: number | undefined;
            shipping_cost_rub?: number | undefined;
        } | undefined;
        seo_title?: string | undefined;
        seo_description?: string | undefined;
        reviews?: {
            average_rating: number;
            total_count: number;
        } | undefined;
    }, {
        id: string;
        created_at: string;
        updated_at: string;
        description: string;
        price_rub: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        name: string;
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
            rating: number;
            review_count: number;
        };
        vendor_id: string;
        category_id: string;
        status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
        photo_urls?: string[] | undefined;
        tags?: string[] | undefined;
        view_count?: number | undefined;
        favorite_count?: number | undefined;
        photos?: {
            url: string;
            filename: string;
            size: number;
            mime_type: string;
        }[] | undefined;
        weight_kg?: number | undefined;
        dimensions?: {
            length_cm: number;
            width_cm: number;
            height_cm: number;
        } | undefined;
        stock_quantity?: number | undefined;
        is_local_stock?: boolean | undefined;
        is_dropship?: boolean | undefined;
        sku?: string | undefined;
        specifications?: Record<string, any> | undefined;
        shipping_info?: {
            estimated_days?: number | undefined;
            free_shipping_threshold?: number | undefined;
            shipping_cost_rub?: number | undefined;
            countries?: string[] | undefined;
        } | undefined;
        seo_title?: string | undefined;
        seo_description?: string | undefined;
        sales_count?: number | undefined;
        reviews?: {
            average_rating: number;
            total_count: number;
        } | undefined;
    }>, "many">;
    total: z.ZodNumber;
    filters: z.ZodObject<{
        vendor_id: z.ZodOptional<z.ZodString>;
        category_id: z.ZodOptional<z.ZodString>;
        min_price: z.ZodOptional<z.ZodNumber>;
        max_price: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>>;
        is_local_stock: z.ZodOptional<z.ZodBoolean>;
        is_dropship: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        min_rating: z.ZodOptional<z.ZodNumber>;
        in_stock: z.ZodOptional<z.ZodBoolean>;
        country: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
        city?: string | undefined;
        country?: string | undefined;
        vendor_id?: string | undefined;
        category_id?: string | undefined;
        search?: string | undefined;
        tags?: string[] | undefined;
        min_price?: number | undefined;
        max_price?: number | undefined;
        min_rating?: number | undefined;
        is_local_stock?: boolean | undefined;
        is_dropship?: boolean | undefined;
        in_stock?: boolean | undefined;
    }, {
        status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
        city?: string | undefined;
        country?: string | undefined;
        vendor_id?: string | undefined;
        category_id?: string | undefined;
        search?: string | undefined;
        tags?: string[] | undefined;
        min_price?: number | undefined;
        max_price?: number | undefined;
        min_rating?: number | undefined;
        is_local_stock?: boolean | undefined;
        is_dropship?: boolean | undefined;
        in_stock?: boolean | undefined;
    }>;
    aggregations: z.ZodOptional<z.ZodObject<{
        price_ranges: z.ZodArray<z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            count: number;
        }, {
            min: number;
            max: number;
            count: number;
        }>, "many">;
        categories: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            count: number;
        }, {
            id: string;
            name: string;
            count: number;
        }>, "many">;
        vendors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            count: number;
        }, {
            id: string;
            name: string;
            count: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        price_ranges: {
            min: number;
            max: number;
            count: number;
        }[];
        categories: {
            id: string;
            name: string;
            count: number;
        }[];
        vendors: {
            id: string;
            name: string;
            count: number;
        }[];
    }, {
        price_ranges: {
            min: number;
            max: number;
            count: number;
        }[];
        categories: {
            id: string;
            name: string;
            count: number;
        }[];
        vendors: {
            id: string;
            name: string;
            count: number;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    total: number;
    filters: {
        status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
        city?: string | undefined;
        country?: string | undefined;
        vendor_id?: string | undefined;
        category_id?: string | undefined;
        search?: string | undefined;
        tags?: string[] | undefined;
        min_price?: number | undefined;
        max_price?: number | undefined;
        min_rating?: number | undefined;
        is_local_stock?: boolean | undefined;
        is_dropship?: boolean | undefined;
        in_stock?: boolean | undefined;
    };
    products: {
        id: string;
        created_at: string;
        updated_at: string;
        status: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED";
        description: string;
        price_rub: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
            rating: number;
            review_count: number;
        };
        vendor_id: string;
        category_id: string;
        tags: string[];
        view_count: number;
        favorite_count: number;
        stock_quantity: number;
        is_local_stock: boolean;
        is_dropship: boolean;
        specifications: Record<string, any>;
        sales_count: number;
        photos?: {
            url: string;
            filename: string;
            size: number;
            mime_type: string;
        }[] | undefined;
        weight_kg?: number | undefined;
        dimensions?: {
            length_cm: number;
            width_cm: number;
            height_cm: number;
        } | undefined;
        sku?: string | undefined;
        shipping_info?: {
            countries: string[];
            estimated_days?: number | undefined;
            free_shipping_threshold?: number | undefined;
            shipping_cost_rub?: number | undefined;
        } | undefined;
        seo_title?: string | undefined;
        seo_description?: string | undefined;
        reviews?: {
            average_rating: number;
            total_count: number;
        } | undefined;
    }[];
    aggregations?: {
        price_ranges: {
            min: number;
            max: number;
            count: number;
        }[];
        categories: {
            id: string;
            name: string;
            count: number;
        }[];
        vendors: {
            id: string;
            name: string;
            count: number;
        }[];
    } | undefined;
}, {
    total: number;
    filters: {
        status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
        city?: string | undefined;
        country?: string | undefined;
        vendor_id?: string | undefined;
        category_id?: string | undefined;
        search?: string | undefined;
        tags?: string[] | undefined;
        min_price?: number | undefined;
        max_price?: number | undefined;
        min_rating?: number | undefined;
        is_local_stock?: boolean | undefined;
        is_dropship?: boolean | undefined;
        in_stock?: boolean | undefined;
    };
    products: {
        id: string;
        created_at: string;
        updated_at: string;
        description: string;
        price_rub: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        name: string;
        vendor: {
            id: string;
            city: string;
            country: string;
            name: string;
            verified: boolean;
            rating: number;
            review_count: number;
        };
        vendor_id: string;
        category_id: string;
        status?: "ACTIVE" | "OUT_OF_STOCK" | "DISABLED" | undefined;
        photo_urls?: string[] | undefined;
        tags?: string[] | undefined;
        view_count?: number | undefined;
        favorite_count?: number | undefined;
        photos?: {
            url: string;
            filename: string;
            size: number;
            mime_type: string;
        }[] | undefined;
        weight_kg?: number | undefined;
        dimensions?: {
            length_cm: number;
            width_cm: number;
            height_cm: number;
        } | undefined;
        stock_quantity?: number | undefined;
        is_local_stock?: boolean | undefined;
        is_dropship?: boolean | undefined;
        sku?: string | undefined;
        specifications?: Record<string, any> | undefined;
        shipping_info?: {
            estimated_days?: number | undefined;
            free_shipping_threshold?: number | undefined;
            shipping_cost_rub?: number | undefined;
            countries?: string[] | undefined;
        } | undefined;
        seo_title?: string | undefined;
        seo_description?: string | undefined;
        sales_count?: number | undefined;
        reviews?: {
            average_rating: number;
            total_count: number;
        } | undefined;
    }[];
    aggregations?: {
        price_ranges: {
            min: number;
            max: number;
            count: number;
        }[];
        categories: {
            id: string;
            name: string;
            count: number;
        }[];
        vendors: {
            id: string;
            name: string;
            count: number;
        }[];
    } | undefined;
}>;
export declare const ProductVariantSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    product_id: z.ZodString;
    name: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    price_rub: z.ZodNumber;
    stock_quantity: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    price_rub: number;
    name: string;
    is_active: boolean;
    photo_urls: string[];
    stock_quantity: number;
    product_id: string;
    attributes: Record<string, string>;
    sku?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    price_rub: number;
    name: string;
    product_id: string;
    is_active?: boolean | undefined;
    photo_urls?: string[] | undefined;
    stock_quantity?: number | undefined;
    sku?: string | undefined;
    attributes?: Record<string, string> | undefined;
}>;
export declare const CreateProductVariantSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    product_id: z.ZodString;
    name: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    price_rub: z.ZodNumber;
    stock_quantity: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, "id" | "created_at" | "updated_at">, "strip", z.ZodTypeAny, {
    price_rub: number;
    name: string;
    is_active: boolean;
    photo_urls: string[];
    stock_quantity: number;
    product_id: string;
    attributes: Record<string, string>;
    sku?: string | undefined;
}, {
    price_rub: number;
    name: string;
    product_id: string;
    is_active?: boolean | undefined;
    photo_urls?: string[] | undefined;
    stock_quantity?: number | undefined;
    sku?: string | undefined;
    attributes?: Record<string, string> | undefined;
}>;
export type VendorProduct = z.infer<typeof VendorProductSchema>;
export type CreateVendorProduct = z.infer<typeof CreateVendorProductSchema>;
export type UpdateVendorProduct = z.infer<typeof UpdateVendorProductSchema>;
export type VendorProductWithRelations = z.infer<typeof VendorProductWithRelationsSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
export type ProductSearchResponse = z.infer<typeof ProductSearchResponseSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type CreateProductVariant = z.infer<typeof CreateProductVariantSchema>;
//# sourceMappingURL=products.d.ts.map