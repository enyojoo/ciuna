import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, RubleAmountSchema, BookingStatusSchema, EscrowStatusSchema } from './common';
// Service booking
export const ServiceBookingSchema = BaseRecordSchema.extend({
    service_id: z.string().uuid(),
    client_id: UUIDSchema,
    scheduled_at: z.string().datetime(),
    duration_minutes: z.number().int().positive(),
    status: BookingStatusSchema.default('PENDING'),
    escrow_status: EscrowStatusSchema.default('HELD'),
    total_amount_rub: RubleAmountSchema,
    escrow_amount_rub: RubleAmountSchema,
    payment_id: z.string().uuid().optional(),
    notes: z.string().max(1000).optional(),
    requirements: z.array(z.string()).default([]),
    deliverables: z.array(z.string()).default([]),
    meeting_link: z.string().url().optional(),
    meeting_location: z.string().optional(),
    is_online: z.boolean().default(false),
    is_in_person: z.boolean().default(true),
    confirmed_at: z.string().datetime().optional(),
    completed_at: z.string().datetime().optional(),
    cancelled_at: z.string().datetime().optional(),
    cancelled_reason: z.string().optional(),
    rescheduled_at: z.string().datetime().optional(),
    reschedule_reason: z.string().optional(),
});
// Service booking creation
export const CreateServiceBookingSchema = ServiceBookingSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    confirmed_at: true,
    completed_at: true,
    cancelled_at: true,
    cancelled_reason: true,
    rescheduled_at: true,
    reschedule_reason: true,
});
// Service booking update
export const UpdateServiceBookingSchema = ServiceBookingSchema.partial().omit({
    id: true,
    service_id: true,
    client_id: true,
    created_at: true,
    updated_at: true,
});
// Service booking with relations
export const ServiceBookingWithRelationsSchema = ServiceBookingSchema.extend({
    service: z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string(),
        price_rub: z.number().int().min(0),
        duration_minutes: z.number().int().positive(),
        category: z.string(),
        provider: z.object({
            id: z.string().uuid(),
            name: z.string(),
            bio: z.string(),
            verified: z.boolean(),
            rating: z.number().min(0).max(5),
            review_count: z.number().int().min(0),
        }),
    }),
    client: z.object({
        id: UUIDSchema,
        email: z.string().email(),
        country_of_origin: z.string(),
        city: z.string(),
        phone: z.string().optional(),
    }),
    payment: z.object({
        id: z.string().uuid(),
        provider: z.string(),
        status: z.string(),
        amount_rub: z.number().int().min(0),
    }).optional(),
});
// Booking availability
export const BookingAvailabilitySchema = z.object({
    service_id: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    available_slots: z.array(z.object({
        start_time: z.string().regex(/^\d{2}:\d{2}$/),
        end_time: z.string().regex(/^\d{2}:\d{2}$/),
        is_available: z.boolean(),
        price_rub: z.number().int().min(0).optional(),
    })),
});
// Booking calendar
export const BookingCalendarSchema = z.object({
    service_id: z.string().uuid(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2030),
    days: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        is_available: z.boolean(),
        available_slots: z.number().int().min(0),
        booked_slots: z.number().int().min(0),
    })),
});
// Booking filters
export const BookingFiltersSchema = z.object({
    client_id: UUIDSchema.optional(),
    service_id: z.string().uuid().optional(),
    provider_id: z.string().uuid().optional(),
    status: BookingStatusSchema.optional(),
    escrow_status: EscrowStatusSchema.optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    is_online: z.boolean().optional(),
    is_in_person: z.boolean().optional(),
});
// Booking stats
export const BookingStatsSchema = z.object({
    total_bookings: z.number().int().min(0),
    pending_bookings: z.number().int().min(0),
    confirmed_bookings: z.number().int().min(0),
    completed_bookings: z.number().int().min(0),
    cancelled_bookings: z.number().int().min(0),
    total_revenue: z.number().int().min(0),
    monthly_revenue: z.number().int().min(0),
    average_booking_value: z.number().int().min(0),
    completion_rate: z.number().min(0).max(1),
    cancellation_rate: z.number().min(0).max(1),
});
// Booking reminder
export const BookingReminderSchema = BaseRecordSchema.extend({
    booking_id: z.string().uuid(),
    type: z.enum(['EMAIL', 'SMS', 'PUSH']),
    scheduled_for: z.string().datetime(),
    sent_at: z.string().datetime().optional(),
    status: z.enum(['PENDING', 'SENT', 'FAILED']).default('PENDING'),
    template: z.string(),
    variables: z.record(z.any()).default({}),
});
// Booking review request
export const BookingReviewRequestSchema = BaseRecordSchema.extend({
    booking_id: z.string().uuid(),
    sent_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    status: z.enum(['PENDING', 'COMPLETED', 'EXPIRED']).default('PENDING'),
    reminder_sent: z.boolean().default(false),
});
//# sourceMappingURL=bookings.js.map