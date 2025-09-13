import { z } from 'zod';
export declare const ReviewSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    order_id: z.ZodString;
    reviewer_id: z.ZodString;
    reviewee_id: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    is_anonymous: z.ZodDefault<z.ZodBoolean>;
    helpful_count: z.ZodDefault<z.ZodNumber>;
    is_verified_purchase: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    rating: number;
    order_id: string;
    reviewer_id: string;
    reviewee_id: string;
    is_anonymous: boolean;
    helpful_count: number;
    is_verified_purchase: boolean;
    comment?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    rating: number;
    order_id: string;
    reviewer_id: string;
    reviewee_id: string;
    comment?: string | undefined;
    is_anonymous?: boolean | undefined;
    helpful_count?: number | undefined;
    is_verified_purchase?: boolean | undefined;
}>;
export declare const CreateReviewSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    order_id: z.ZodString;
    reviewer_id: z.ZodString;
    reviewee_id: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    is_anonymous: z.ZodDefault<z.ZodBoolean>;
    helpful_count: z.ZodDefault<z.ZodNumber>;
    is_verified_purchase: z.ZodDefault<z.ZodBoolean>;
}, "id" | "created_at" | "updated_at" | "helpful_count">, "strip", z.ZodTypeAny, {
    rating: number;
    order_id: string;
    reviewer_id: string;
    reviewee_id: string;
    is_anonymous: boolean;
    is_verified_purchase: boolean;
    comment?: string | undefined;
}, {
    rating: number;
    order_id: string;
    reviewer_id: string;
    reviewee_id: string;
    comment?: string | undefined;
    is_anonymous?: boolean | undefined;
    is_verified_purchase?: boolean | undefined;
}>;
export declare const UpdateReviewSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    order_id: z.ZodOptional<z.ZodString>;
    reviewer_id: z.ZodOptional<z.ZodString>;
    reviewee_id: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    is_anonymous: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    helpful_count: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    is_verified_purchase: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "id" | "created_at" | "updated_at" | "order_id" | "reviewer_id" | "reviewee_id" | "helpful_count">, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    comment?: string | undefined;
    is_anonymous?: boolean | undefined;
    is_verified_purchase?: boolean | undefined;
}, {
    rating?: number | undefined;
    comment?: string | undefined;
    is_anonymous?: boolean | undefined;
    is_verified_purchase?: boolean | undefined;
}>;
export declare const ReviewWithReviewerSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    order_id: z.ZodString;
    reviewer_id: z.ZodString;
    reviewee_id: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    is_anonymous: z.ZodDefault<z.ZodBoolean>;
    helpful_count: z.ZodDefault<z.ZodNumber>;
    is_verified_purchase: z.ZodDefault<z.ZodBoolean>;
} & {
    reviewer: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        country_of_origin: z.ZodString;
        city: z.ZodString;
        verified_expat: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        verified_expat: boolean;
    }, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        verified_expat: boolean;
    }>;
    order: z.ZodObject<{
        id: z.ZodString;
        listing: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
        }, {
            id: string;
            title: string;
        }>>;
        vendor_product: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>>;
        service_booking: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            service: z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
            }, {
                id: string;
                title: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            service: {
                id: string;
                title: string;
            };
        }, {
            id: string;
            service: {
                id: string;
                title: string;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        listing?: {
            id: string;
            title: string;
        } | undefined;
        vendor_product?: {
            id: string;
            name: string;
        } | undefined;
        service_booking?: {
            id: string;
            service: {
                id: string;
                title: string;
            };
        } | undefined;
    }, {
        id: string;
        listing?: {
            id: string;
            title: string;
        } | undefined;
        vendor_product?: {
            id: string;
            name: string;
        } | undefined;
        service_booking?: {
            id: string;
            service: {
                id: string;
                title: string;
            };
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    rating: number;
    order_id: string;
    order: {
        id: string;
        listing?: {
            id: string;
            title: string;
        } | undefined;
        vendor_product?: {
            id: string;
            name: string;
        } | undefined;
        service_booking?: {
            id: string;
            service: {
                id: string;
                title: string;
            };
        } | undefined;
    };
    reviewer_id: string;
    reviewee_id: string;
    is_anonymous: boolean;
    helpful_count: number;
    is_verified_purchase: boolean;
    reviewer: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        verified_expat: boolean;
    };
    comment?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    rating: number;
    order_id: string;
    order: {
        id: string;
        listing?: {
            id: string;
            title: string;
        } | undefined;
        vendor_product?: {
            id: string;
            name: string;
        } | undefined;
        service_booking?: {
            id: string;
            service: {
                id: string;
                title: string;
            };
        } | undefined;
    };
    reviewer_id: string;
    reviewee_id: string;
    reviewer: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        verified_expat: boolean;
    };
    comment?: string | undefined;
    is_anonymous?: boolean | undefined;
    helpful_count?: number | undefined;
    is_verified_purchase?: boolean | undefined;
}>;
export declare const ReviewSummarySchema: z.ZodObject<{
    total_reviews: z.ZodNumber;
    average_rating: z.ZodNumber;
    rating_distribution: z.ZodObject<{
        5: z.ZodNumber;
        4: z.ZodNumber;
        3: z.ZodNumber;
        2: z.ZodNumber;
        1: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        4: number;
        3: number;
        5: number;
        2: number;
        1: number;
    }, {
        4: number;
        3: number;
        5: number;
        2: number;
        1: number;
    }>;
    recent_reviews: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        created_at: z.ZodString;
        updated_at: z.ZodString;
    } & {
        order_id: z.ZodString;
        reviewer_id: z.ZodString;
        reviewee_id: z.ZodString;
        rating: z.ZodNumber;
        comment: z.ZodOptional<z.ZodString>;
        is_anonymous: z.ZodDefault<z.ZodBoolean>;
        helpful_count: z.ZodDefault<z.ZodNumber>;
        is_verified_purchase: z.ZodDefault<z.ZodBoolean>;
    } & {
        reviewer: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            country_of_origin: z.ZodString;
            city: z.ZodString;
            verified_expat: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        }, {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        }>;
        order: z.ZodObject<{
            id: z.ZodString;
            listing: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
            }, {
                id: string;
                title: string;
            }>>;
            vendor_product: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
            }, {
                id: string;
                name: string;
            }>>;
            service_booking: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                service: z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    title: string;
                }, {
                    id: string;
                    title: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            }, {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            listing?: {
                id: string;
                title: string;
            } | undefined;
            vendor_product?: {
                id: string;
                name: string;
            } | undefined;
            service_booking?: {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            } | undefined;
        }, {
            id: string;
            listing?: {
                id: string;
                title: string;
            } | undefined;
            vendor_product?: {
                id: string;
                name: string;
            } | undefined;
            service_booking?: {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        created_at: string;
        updated_at: string;
        rating: number;
        order_id: string;
        order: {
            id: string;
            listing?: {
                id: string;
                title: string;
            } | undefined;
            vendor_product?: {
                id: string;
                name: string;
            } | undefined;
            service_booking?: {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            } | undefined;
        };
        reviewer_id: string;
        reviewee_id: string;
        is_anonymous: boolean;
        helpful_count: number;
        is_verified_purchase: boolean;
        reviewer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
        comment?: string | undefined;
    }, {
        id: string;
        created_at: string;
        updated_at: string;
        rating: number;
        order_id: string;
        order: {
            id: string;
            listing?: {
                id: string;
                title: string;
            } | undefined;
            vendor_product?: {
                id: string;
                name: string;
            } | undefined;
            service_booking?: {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            } | undefined;
        };
        reviewer_id: string;
        reviewee_id: string;
        reviewer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
        comment?: string | undefined;
        is_anonymous?: boolean | undefined;
        helpful_count?: number | undefined;
        is_verified_purchase?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    total_reviews: number;
    average_rating: number;
    rating_distribution: {
        4: number;
        3: number;
        5: number;
        2: number;
        1: number;
    };
    recent_reviews: {
        id: string;
        created_at: string;
        updated_at: string;
        rating: number;
        order_id: string;
        order: {
            id: string;
            listing?: {
                id: string;
                title: string;
            } | undefined;
            vendor_product?: {
                id: string;
                name: string;
            } | undefined;
            service_booking?: {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            } | undefined;
        };
        reviewer_id: string;
        reviewee_id: string;
        is_anonymous: boolean;
        helpful_count: number;
        is_verified_purchase: boolean;
        reviewer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
        comment?: string | undefined;
    }[];
}, {
    total_reviews: number;
    average_rating: number;
    rating_distribution: {
        4: number;
        3: number;
        5: number;
        2: number;
        1: number;
    };
    recent_reviews: {
        id: string;
        created_at: string;
        updated_at: string;
        rating: number;
        order_id: string;
        order: {
            id: string;
            listing?: {
                id: string;
                title: string;
            } | undefined;
            vendor_product?: {
                id: string;
                name: string;
            } | undefined;
            service_booking?: {
                id: string;
                service: {
                    id: string;
                    title: string;
                };
            } | undefined;
        };
        reviewer_id: string;
        reviewee_id: string;
        reviewer: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
        comment?: string | undefined;
        is_anonymous?: boolean | undefined;
        helpful_count?: number | undefined;
        is_verified_purchase?: boolean | undefined;
    }[];
}>;
export declare const ReviewFiltersSchema: z.ZodObject<{
    reviewee_id: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    is_verified_purchase: z.ZodOptional<z.ZodBoolean>;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    reviewee_id?: string | undefined;
    is_verified_purchase?: boolean | undefined;
}, {
    rating?: number | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
    reviewee_id?: string | undefined;
    is_verified_purchase?: boolean | undefined;
}>;
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;
export type UpdateReview = z.infer<typeof UpdateReviewSchema>;
export type ReviewWithReviewer = z.infer<typeof ReviewWithReviewerSchema>;
export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;
export type ReviewFilters = z.infer<typeof ReviewFiltersSchema>;
//# sourceMappingURL=reviews.d.ts.map