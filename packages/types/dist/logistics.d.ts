import { z } from 'zod';
export declare const DeliverySchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    order_id: z.ZodString;
    pickup_address_id: z.ZodString;
    dropoff_address_id: z.ZodString;
    timeslot_start: z.ZodString;
    timeslot_end: z.ZodString;
    cod: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]>>;
    tracking_code: z.ZodOptional<z.ZodString>;
    courier_id: z.ZodOptional<z.ZodString>;
    courier_notes: z.ZodOptional<z.ZodString>;
    delivery_notes: z.ZodOptional<z.ZodString>;
    actual_delivery_time: z.ZodOptional<z.ZodString>;
    signature_url: z.ZodOptional<z.ZodString>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED";
    photo_urls: string[];
    order_id: string;
    pickup_address_id: string;
    dropoff_address_id: string;
    timeslot_start: string;
    timeslot_end: string;
    cod: boolean;
    tracking_code?: string | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
    actual_delivery_time?: string | undefined;
    signature_url?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    order_id: string;
    pickup_address_id: string;
    dropoff_address_id: string;
    timeslot_start: string;
    timeslot_end: string;
    status?: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED" | undefined;
    photo_urls?: string[] | undefined;
    tracking_code?: string | undefined;
    cod?: boolean | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
    actual_delivery_time?: string | undefined;
    signature_url?: string | undefined;
}>;
export declare const CreateDeliverySchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    order_id: z.ZodString;
    pickup_address_id: z.ZodString;
    dropoff_address_id: z.ZodString;
    timeslot_start: z.ZodString;
    timeslot_end: z.ZodString;
    cod: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]>>;
    tracking_code: z.ZodOptional<z.ZodString>;
    courier_id: z.ZodOptional<z.ZodString>;
    courier_notes: z.ZodOptional<z.ZodString>;
    delivery_notes: z.ZodOptional<z.ZodString>;
    actual_delivery_time: z.ZodOptional<z.ZodString>;
    signature_url: z.ZodOptional<z.ZodString>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "id" | "created_at" | "updated_at" | "photo_urls" | "actual_delivery_time" | "signature_url">, "strip", z.ZodTypeAny, {
    status: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED";
    order_id: string;
    pickup_address_id: string;
    dropoff_address_id: string;
    timeslot_start: string;
    timeslot_end: string;
    cod: boolean;
    tracking_code?: string | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
}, {
    order_id: string;
    pickup_address_id: string;
    dropoff_address_id: string;
    timeslot_start: string;
    timeslot_end: string;
    status?: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED" | undefined;
    tracking_code?: string | undefined;
    cod?: boolean | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
}>;
export declare const UpdateDeliverySchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    order_id: z.ZodOptional<z.ZodString>;
    pickup_address_id: z.ZodOptional<z.ZodString>;
    dropoff_address_id: z.ZodOptional<z.ZodString>;
    timeslot_start: z.ZodOptional<z.ZodString>;
    timeslot_end: z.ZodOptional<z.ZodString>;
    cod: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]>>>;
    tracking_code: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    courier_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    courier_notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    delivery_notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    actual_delivery_time: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    signature_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    photo_urls: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "id" | "created_at" | "updated_at" | "order_id">, "strip", z.ZodTypeAny, {
    status?: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED" | undefined;
    photo_urls?: string[] | undefined;
    tracking_code?: string | undefined;
    pickup_address_id?: string | undefined;
    dropoff_address_id?: string | undefined;
    timeslot_start?: string | undefined;
    timeslot_end?: string | undefined;
    cod?: boolean | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
    actual_delivery_time?: string | undefined;
    signature_url?: string | undefined;
}, {
    status?: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED" | undefined;
    photo_urls?: string[] | undefined;
    tracking_code?: string | undefined;
    pickup_address_id?: string | undefined;
    dropoff_address_id?: string | undefined;
    timeslot_start?: string | undefined;
    timeslot_end?: string | undefined;
    cod?: boolean | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
    actual_delivery_time?: string | undefined;
    signature_url?: string | undefined;
}>;
export declare const DeliveryWithRelationsSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    order_id: z.ZodString;
    pickup_address_id: z.ZodString;
    dropoff_address_id: z.ZodString;
    timeslot_start: z.ZodString;
    timeslot_end: z.ZodString;
    cod: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodDefault<z.ZodEnum<["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]>>;
    tracking_code: z.ZodOptional<z.ZodString>;
    courier_id: z.ZodOptional<z.ZodString>;
    courier_notes: z.ZodOptional<z.ZodString>;
    delivery_notes: z.ZodOptional<z.ZodString>;
    actual_delivery_time: z.ZodOptional<z.ZodString>;
    signature_url: z.ZodOptional<z.ZodString>;
    photo_urls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
} & {
    order: z.ZodObject<{
        id: z.ZodString;
        buyer_id: z.ZodString;
        seller_id: z.ZodString;
        total_amount_rub: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    }, {
        id: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    }>;
    pickup_address: z.ZodObject<{
        id: z.ZodString;
        street: z.ZodString;
        city: z.ZodString;
        district: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    }, {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    }>;
    dropoff_address: z.ZodObject<{
        id: z.ZodString;
        street: z.ZodString;
        city: z.ZodString;
        district: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    }, {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    }>;
    courier: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        email: string;
        phone?: string | undefined;
    }, {
        id: string;
        email: string;
        phone?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED";
    photo_urls: string[];
    order_id: string;
    order: {
        id: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    };
    pickup_address_id: string;
    dropoff_address_id: string;
    timeslot_start: string;
    timeslot_end: string;
    cod: boolean;
    pickup_address: {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    };
    dropoff_address: {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    };
    tracking_code?: string | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
    actual_delivery_time?: string | undefined;
    signature_url?: string | undefined;
    courier?: {
        id: string;
        email: string;
        phone?: string | undefined;
    } | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    order_id: string;
    order: {
        id: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    };
    pickup_address_id: string;
    dropoff_address_id: string;
    timeslot_start: string;
    timeslot_end: string;
    pickup_address: {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    };
    dropoff_address: {
        id: string;
        street: string;
        city: string;
        district?: string | undefined;
        postal_code?: string | undefined;
    };
    status?: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED" | undefined;
    photo_urls?: string[] | undefined;
    tracking_code?: string | undefined;
    cod?: boolean | undefined;
    courier_id?: string | undefined;
    courier_notes?: string | undefined;
    delivery_notes?: string | undefined;
    actual_delivery_time?: string | undefined;
    signature_url?: string | undefined;
    courier?: {
        id: string;
        email: string;
        phone?: string | undefined;
    } | undefined;
}>;
export declare const IntlShipmentQuoteSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    from_country: z.ZodString;
    to_country: z.ZodDefault<z.ZodString>;
    volumetric_weight_kg: z.ZodNumber;
    base_cost_rub: z.ZodNumber;
    duty_estimate_rub: z.ZodNumber;
    total_cost_rub: z.ZodNumber;
    estimated_days: z.ZodNumber;
    carrier: z.ZodString;
    service_level: z.ZodString;
    tracking_available: z.ZodDefault<z.ZodBoolean>;
    insurance_included: z.ZodDefault<z.ZodBoolean>;
    customs_handling: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    from_country: string;
    to_country: string;
    volumetric_weight_kg: number;
    base_cost_rub: number;
    duty_estimate_rub: number;
    total_cost_rub: number;
    estimated_days: number;
    carrier: string;
    service_level: string;
    tracking_available: boolean;
    insurance_included: boolean;
    customs_handling: boolean;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    from_country: string;
    volumetric_weight_kg: number;
    base_cost_rub: number;
    duty_estimate_rub: number;
    total_cost_rub: number;
    estimated_days: number;
    carrier: string;
    service_level: string;
    to_country?: string | undefined;
    tracking_available?: boolean | undefined;
    insurance_included?: boolean | undefined;
    customs_handling?: boolean | undefined;
}>;
export declare const ShipmentQuoteRequestSchema: z.ZodObject<{
    from_country: z.ZodString;
    to_country: z.ZodDefault<z.ZodString>;
    weight_kg: z.ZodNumber;
    dimensions: z.ZodObject<{
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
    }>;
    value_rub: z.ZodNumber;
    contents: z.ZodString;
    service_level: z.ZodDefault<z.ZodEnum<["ECONOMY", "STANDARD", "EXPRESS", "OVERNIGHT"]>>;
}, "strip", z.ZodTypeAny, {
    from_country: string;
    to_country: string;
    service_level: "ECONOMY" | "STANDARD" | "EXPRESS" | "OVERNIGHT";
    weight_kg: number;
    dimensions: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    };
    value_rub: number;
    contents: string;
}, {
    from_country: string;
    weight_kg: number;
    dimensions: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
    };
    value_rub: number;
    contents: string;
    to_country?: string | undefined;
    service_level?: "ECONOMY" | "STANDARD" | "EXPRESS" | "OVERNIGHT" | undefined;
}>;
export declare const DeliveryTrackingSchema: z.ZodObject<{
    tracking_code: z.ZodString;
    status: z.ZodEnum<["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]>;
    current_location: z.ZodOptional<z.ZodString>;
    estimated_delivery: z.ZodOptional<z.ZodString>;
    events: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodString;
        status: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: string;
        description: string;
        timestamp: string;
        location?: string | undefined;
    }, {
        status: string;
        description: string;
        timestamp: string;
        location?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED";
    tracking_code: string;
    events: {
        status: string;
        description: string;
        timestamp: string;
        location?: string | undefined;
    }[];
    current_location?: string | undefined;
    estimated_delivery?: string | undefined;
}, {
    status: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED";
    tracking_code: string;
    events: {
        status: string;
        description: string;
        timestamp: string;
        location?: string | undefined;
    }[];
    current_location?: string | undefined;
    estimated_delivery?: string | undefined;
}>;
export declare const DeliveryFiltersSchema: z.ZodObject<{
    order_id: z.ZodOptional<z.ZodString>;
    courier_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]>>;
    city: z.ZodOptional<z.ZodString>;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED" | undefined;
    city?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    order_id?: string | undefined;
    courier_id?: string | undefined;
}, {
    status?: "DELIVERED" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "RETURNED" | undefined;
    city?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    order_id?: string | undefined;
    courier_id?: string | undefined;
}>;
export type Delivery = z.infer<typeof DeliverySchema>;
export type CreateDelivery = z.infer<typeof CreateDeliverySchema>;
export type UpdateDelivery = z.infer<typeof UpdateDeliverySchema>;
export type DeliveryWithRelations = z.infer<typeof DeliveryWithRelationsSchema>;
export type IntlShipmentQuote = z.infer<typeof IntlShipmentQuoteSchema>;
export type ShipmentQuoteRequest = z.infer<typeof ShipmentQuoteRequestSchema>;
export type DeliveryTracking = z.infer<typeof DeliveryTrackingSchema>;
export type DeliveryFilters = z.infer<typeof DeliveryFiltersSchema>;
//# sourceMappingURL=logistics.d.ts.map