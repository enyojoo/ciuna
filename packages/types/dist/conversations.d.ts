import { z } from 'zod';
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    listing_id: z.ZodOptional<z.ZodString>;
    vendor_product_id: z.ZodOptional<z.ZodString>;
    service_id: z.ZodOptional<z.ZodString>;
    last_message_at: z.ZodOptional<z.ZodString>;
    last_message_id: z.ZodOptional<z.ZodString>;
    is_archived: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    service_id?: string | undefined;
    last_message_at?: string | undefined;
    last_message_id?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    service_id?: string | undefined;
    last_message_at?: string | undefined;
    last_message_id?: string | undefined;
    is_archived?: boolean | undefined;
}>;
export declare const ConversationParticipantSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    conversation_id: z.ZodString;
    user_id: z.ZodString;
    joined_at: z.ZodString;
    left_at: z.ZodOptional<z.ZodString>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    unread_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    is_active: boolean;
    conversation_id: string;
    joined_at: string;
    unread_count: number;
    left_at?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    conversation_id: string;
    joined_at: string;
    left_at?: string | undefined;
    is_active?: boolean | undefined;
    unread_count?: number | undefined;
}>;
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    conversation_id: z.ZodString;
    sender_id: z.ZodString;
    content: z.ZodString;
    message_type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "FILE", "SYSTEM"]>>;
    file_url: z.ZodOptional<z.ZodString>;
    file_name: z.ZodOptional<z.ZodString>;
    file_size: z.ZodOptional<z.ZodNumber>;
    is_read: z.ZodDefault<z.ZodBoolean>;
    read_at: z.ZodOptional<z.ZodString>;
    reply_to_id: z.ZodOptional<z.ZodString>;
    translation: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
    is_read: boolean;
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    read_at?: string | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | undefined;
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    is_read?: boolean | undefined;
    read_at?: string | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}>;
export declare const CreateMessageSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    conversation_id: z.ZodString;
    sender_id: z.ZodString;
    content: z.ZodString;
    message_type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "FILE", "SYSTEM"]>>;
    file_url: z.ZodOptional<z.ZodString>;
    file_name: z.ZodOptional<z.ZodString>;
    file_size: z.ZodOptional<z.ZodNumber>;
    is_read: z.ZodDefault<z.ZodBoolean>;
    read_at: z.ZodOptional<z.ZodString>;
    reply_to_id: z.ZodOptional<z.ZodString>;
    translation: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "id" | "created_at" | "updated_at" | "is_read" | "read_at">, "strip", z.ZodTypeAny, {
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}, {
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | undefined;
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}>;
export declare const UpdateMessageSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    conversation_id: z.ZodOptional<z.ZodString>;
    sender_id: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    message_type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "FILE", "SYSTEM"]>>>;
    file_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    file_name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    file_size: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    is_read: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    read_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    reply_to_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    translation: z.ZodOptional<z.ZodOptional<z.ZodObject<{
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
    }>>>;
}, "id" | "created_at" | "updated_at" | "conversation_id" | "sender_id">, "strip", z.ZodTypeAny, {
    content?: string | undefined;
    message_type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | undefined;
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    is_read?: boolean | undefined;
    read_at?: string | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}, {
    content?: string | undefined;
    message_type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | undefined;
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    is_read?: boolean | undefined;
    read_at?: string | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}>;
export declare const ConversationWithDetailsSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    service_id: z.ZodOptional<z.ZodString>;
    listing_id: z.ZodOptional<z.ZodString>;
    vendor_product_id: z.ZodOptional<z.ZodString>;
    last_message_at: z.ZodOptional<z.ZodString>;
    last_message_id: z.ZodOptional<z.ZodString>;
    is_archived: z.ZodDefault<z.ZodBoolean>;
    participants: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        user_id: z.ZodString;
        user: z.ZodObject<{
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
        unread_count: z.ZodNumber;
        is_active: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        user_id: string;
        is_active: boolean;
        unread_count: number;
        user: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
    }, {
        id: string;
        user_id: string;
        is_active: boolean;
        unread_count: number;
        user: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
    }>, "many">;
    last_message: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        created_at: z.ZodString;
        updated_at: z.ZodString;
        conversation_id: z.ZodString;
        sender_id: z.ZodString;
        content: z.ZodString;
        message_type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "FILE", "SYSTEM"]>>;
        file_url: z.ZodOptional<z.ZodString>;
        file_name: z.ZodOptional<z.ZodString>;
        file_size: z.ZodOptional<z.ZodNumber>;
        is_read: z.ZodDefault<z.ZodBoolean>;
        read_at: z.ZodOptional<z.ZodString>;
        reply_to_id: z.ZodOptional<z.ZodString>;
        translation: z.ZodOptional<z.ZodObject<{
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
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        created_at: string;
        updated_at: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
        is_read: boolean;
        file_url?: string | undefined;
        file_name?: string | undefined;
        file_size?: number | undefined;
        read_at?: string | undefined;
        reply_to_id?: string | undefined;
        translation?: {
            original_text: string;
            translated_text: string;
            source_language: string;
            target_language: string;
            confidence?: number | undefined;
        } | undefined;
    }, {
        id: string;
        created_at: string;
        updated_at: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | undefined;
        file_url?: string | undefined;
        file_name?: string | undefined;
        file_size?: number | undefined;
        is_read?: boolean | undefined;
        read_at?: string | undefined;
        reply_to_id?: string | undefined;
        translation?: {
            original_text: string;
            translated_text: string;
            source_language: string;
            target_language: string;
            confidence?: number | undefined;
        } | undefined;
    }>>;
    listing: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        price_rub: z.ZodNumber;
        photo_urls: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    }, {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    }>>;
    vendor_product: z.ZodOptional<z.ZodObject<{
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
    }>>;
    service: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        price_rub: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        price_rub: number;
    }, {
        id: string;
        title: string;
        price_rub: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    participants: {
        id: string;
        user_id: string;
        is_active: boolean;
        unread_count: number;
        user: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
    }[];
    service_id?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    last_message_at?: string | undefined;
    last_message_id?: string | undefined;
    last_message?: {
        id: string;
        created_at: string;
        updated_at: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
        is_read: boolean;
        file_url?: string | undefined;
        file_name?: string | undefined;
        file_size?: number | undefined;
        read_at?: string | undefined;
        reply_to_id?: string | undefined;
        translation?: {
            original_text: string;
            translated_text: string;
            source_language: string;
            target_language: string;
            confidence?: number | undefined;
        } | undefined;
    } | undefined;
    listing?: {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    } | undefined;
    vendor_product?: {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
    } | undefined;
    service?: {
        id: string;
        title: string;
        price_rub: number;
    } | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    participants: {
        id: string;
        user_id: string;
        is_active: boolean;
        unread_count: number;
        user: {
            id: string;
            city: string;
            email: string;
            country_of_origin: string;
            verified_expat: boolean;
        };
    }[];
    service_id?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    last_message_at?: string | undefined;
    last_message_id?: string | undefined;
    is_archived?: boolean | undefined;
    last_message?: {
        id: string;
        created_at: string;
        updated_at: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | undefined;
        file_url?: string | undefined;
        file_name?: string | undefined;
        file_size?: number | undefined;
        is_read?: boolean | undefined;
        read_at?: string | undefined;
        reply_to_id?: string | undefined;
        translation?: {
            original_text: string;
            translated_text: string;
            source_language: string;
            target_language: string;
            confidence?: number | undefined;
        } | undefined;
    } | undefined;
    listing?: {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    } | undefined;
    vendor_product?: {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
    } | undefined;
    service?: {
        id: string;
        title: string;
        price_rub: number;
    } | undefined;
}>;
export declare const MessageWithSenderSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    conversation_id: z.ZodString;
    sender_id: z.ZodString;
    content: z.ZodString;
    message_type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "FILE", "SYSTEM"]>>;
    file_url: z.ZodOptional<z.ZodString>;
    file_name: z.ZodOptional<z.ZodString>;
    file_size: z.ZodOptional<z.ZodNumber>;
    is_read: z.ZodDefault<z.ZodBoolean>;
    read_at: z.ZodOptional<z.ZodString>;
    reply_to_id: z.ZodOptional<z.ZodString>;
    translation: z.ZodOptional<z.ZodObject<{
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
    }>>;
    sender: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
    is_read: boolean;
    sender: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        verified_expat: boolean;
    };
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    read_at?: string | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    sender: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        verified_expat: boolean;
    };
    message_type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | undefined;
    file_url?: string | undefined;
    file_name?: string | undefined;
    file_size?: number | undefined;
    is_read?: boolean | undefined;
    read_at?: string | undefined;
    reply_to_id?: string | undefined;
    translation?: {
        original_text: string;
        translated_text: string;
        source_language: string;
        target_language: string;
        confidence?: number | undefined;
    } | undefined;
}>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationParticipant = z.infer<typeof ConversationParticipantSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type UpdateMessage = z.infer<typeof UpdateMessageSchema>;
export type ConversationWithDetails = z.infer<typeof ConversationWithDetailsSchema>;
export type MessageWithSender = z.infer<typeof MessageWithSenderSchema>;
//# sourceMappingURL=conversations.d.ts.map