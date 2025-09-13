import { z } from 'zod';
import { BaseRecordSchema, DeliveryStatusSchema, RubleAmountSchema } from './common';
// Delivery
export const DeliverySchema = BaseRecordSchema.extend({
    order_id: z.string().uuid(),
    pickup_address_id: z.string().uuid(),
    dropoff_address_id: z.string().uuid(),
    timeslot_start: z.string().datetime(),
    timeslot_end: z.string().datetime(),
    cod: z.boolean().default(false),
    status: DeliveryStatusSchema.default('CREATED'),
    tracking_code: z.string().optional(),
    courier_id: z.string().uuid().optional(),
    courier_notes: z.string().optional(),
    delivery_notes: z.string().optional(),
    actual_delivery_time: z.string().datetime().optional(),
    signature_url: z.string().url().optional(),
    photo_urls: z.array(z.string().url()).default([]),
});
// Delivery creation
export const CreateDeliverySchema = DeliverySchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    actual_delivery_time: true,
    signature_url: true,
    photo_urls: true,
});
// Delivery update
export const UpdateDeliverySchema = DeliverySchema.partial().omit({
    id: true,
    order_id: true,
    created_at: true,
    updated_at: true,
});
// Delivery with relations
export const DeliveryWithRelationsSchema = DeliverySchema.extend({
    order: z.object({
        id: z.string().uuid(),
        buyer_id: z.string().uuid(),
        seller_id: z.string().uuid(),
        total_amount_rub: z.number().int().min(0),
    }),
    pickup_address: z.object({
        id: z.string().uuid(),
        street: z.string(),
        city: z.string(),
        district: z.string().optional(),
        postal_code: z.string().optional(),
    }),
    dropoff_address: z.object({
        id: z.string().uuid(),
        street: z.string(),
        city: z.string(),
        district: z.string().optional(),
        postal_code: z.string().optional(),
    }),
    courier: z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        phone: z.string().optional(),
    }).optional(),
});
// International shipment quote
export const IntlShipmentQuoteSchema = BaseRecordSchema.extend({
    from_country: z.string().min(2).max(2), // ISO country code
    to_country: z.string().min(2).max(2).default('RU'),
    volumetric_weight_kg: z.number().positive(),
    base_cost_rub: RubleAmountSchema,
    duty_estimate_rub: RubleAmountSchema,
    total_cost_rub: RubleAmountSchema,
    estimated_days: z.number().int().positive(),
    carrier: z.string(),
    service_level: z.string(),
    tracking_available: z.boolean().default(true),
    insurance_included: z.boolean().default(false),
    customs_handling: z.boolean().default(true),
});
// Shipment quote request
export const ShipmentQuoteRequestSchema = z.object({
    from_country: z.string().min(2).max(2),
    to_country: z.string().min(2).max(2).default('RU'),
    weight_kg: z.number().positive(),
    dimensions: z.object({
        length_cm: z.number().positive(),
        width_cm: z.number().positive(),
        height_cm: z.number().positive(),
    }),
    value_rub: RubleAmountSchema,
    contents: z.string(),
    service_level: z.enum(['ECONOMY', 'STANDARD', 'EXPRESS', 'OVERNIGHT']).default('STANDARD'),
});
// Delivery tracking
export const DeliveryTrackingSchema = z.object({
    tracking_code: z.string(),
    status: DeliveryStatusSchema,
    current_location: z.string().optional(),
    estimated_delivery: z.string().datetime().optional(),
    events: z.array(z.object({
        timestamp: z.string().datetime(),
        status: z.string(),
        location: z.string().optional(),
        description: z.string(),
    })),
});
// Delivery filters
export const DeliveryFiltersSchema = z.object({
    order_id: z.string().uuid().optional(),
    courier_id: z.string().uuid().optional(),
    status: DeliveryStatusSchema.optional(),
    city: z.string().optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
});
//# sourceMappingURL=logistics.js.map