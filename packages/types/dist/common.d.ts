import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<["USER", "VENDOR", "COURIER", "ADMIN"]>;
export declare const VerificationStatusSchema: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
export declare const ConditionSchema: z.ZodEnum<["NEW", "LIKE_NEW", "GOOD", "FAIR"]>;
export declare const ListingStatusSchema: z.ZodEnum<["ACTIVE", "PAUSED", "SOLD", "PENDING_REVIEW"]>;
export declare const OrderStatusSchema: z.ZodEnum<["PENDING", "PAID", "FULFILLING", "DELIVERED", "CANCELLED"]>;
export declare const EscrowStatusSchema: z.ZodEnum<["HELD", "RELEASED", "REFUNDED"]>;
export declare const PaymentProviderSchema: z.ZodEnum<["MOCKPAY", "YOOMONEY", "SBER", "TINKOFF"]>;
export declare const PaymentStatusSchema: z.ZodEnum<["AUTHORIZED", "CAPTURED", "CANCELLED", "REFUNDED"]>;
export declare const DeliveryStatusSchema: z.ZodEnum<["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"]>;
export declare const VendorTypeSchema: z.ZodEnum<["LOCAL", "INTERNATIONAL"]>;
export declare const VendorStatusSchema: z.ZodEnum<["ACTIVE", "SUSPENDED"]>;
export declare const ProductStatusSchema: z.ZodEnum<["ACTIVE", "OUT_OF_STOCK", "DISABLED"]>;
export declare const GroupBuyStatusSchema: z.ZodEnum<["ACTIVE", "COMPLETED", "CANCELLED"]>;
export declare const ServiceCategorySchema: z.ZodEnum<["LEGAL", "FINANCIAL", "PERSONAL", "EVENT", "HEALTHCARE"]>;
export declare const BookingStatusSchema: z.ZodEnum<["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]>;
export declare const ProviderStatusSchema: z.ZodEnum<["ACTIVE", "SUSPENDED"]>;
export declare const UUIDSchema: z.ZodString;
export declare const TimestampSchema: z.ZodString;
export declare const PhoneSchema: z.ZodString;
export declare const EmailSchema: z.ZodString;
export declare const RubleAmountSchema: z.ZodNumber;
export declare const RatingSchema: z.ZodNumber;
export declare const BaseRecordSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
}, {
    id: string;
    created_at: string;
    updated_at: string;
}>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const PaginatedResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    data: z.ZodArray<T, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        total_pages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    }, {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    data: T["_output"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}, {
    data: T["_input"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}>;
export declare const AddressSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    type: z.ZodEnum<["PICKUP", "DROPOFF"]>;
    street: z.ZodString;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    postal_code: z.ZodOptional<z.ZodString>;
    country: z.ZodDefault<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>>;
    is_default: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    type: "PICKUP" | "DROPOFF";
    user_id: string;
    street: string;
    city: string;
    country: string;
    is_default: boolean;
    district?: string | undefined;
    postal_code?: string | undefined;
    coordinates?: {
        lat: number;
        lng: number;
    } | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    type: "PICKUP" | "DROPOFF";
    user_id: string;
    street: string;
    city: string;
    district?: string | undefined;
    postal_code?: string | undefined;
    country?: string | undefined;
    coordinates?: {
        lat: number;
        lng: number;
    } | undefined;
    is_default?: boolean | undefined;
}>;
export declare const FileUploadSchema: z.ZodObject<{
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
}>;
export declare const TranslationSchema: z.ZodObject<{
    original_text: z.ZodString;
    translated_text: z.ZodString;
    source_language: z.ZodString;
    target_language: z.ZodString;
    confidence: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    original_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    confidence?: number | undefined;
}, {
    original_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    confidence?: number | undefined;
}>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type ListingStatus = z.infer<typeof ListingStatusSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type EscrowStatus = z.infer<typeof EscrowStatusSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;
export type VendorType = z.infer<typeof VendorTypeSchema>;
export type VendorStatus = z.infer<typeof VendorStatusSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type GroupBuyStatus = z.infer<typeof GroupBuyStatusSchema>;
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
export type UUID = z.infer<typeof UUIDSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type Phone = z.infer<typeof PhoneSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type RubleAmount = z.infer<typeof RubleAmountSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type BaseRecord = z.infer<typeof BaseRecordSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type Translation = z.infer<typeof TranslationSchema>;
//# sourceMappingURL=common.d.ts.map