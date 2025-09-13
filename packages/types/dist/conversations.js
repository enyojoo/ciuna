import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, TranslationSchema } from './common';
// Conversation
export const ConversationSchema = BaseRecordSchema.extend({
    listing_id: z.string().uuid().optional(),
    vendor_product_id: z.string().uuid().optional(),
    service_id: z.string().uuid().optional(),
    last_message_at: z.string().datetime().optional(),
    last_message_id: z.string().uuid().optional(),
    is_archived: z.boolean().default(false),
});
// Conversation participant
export const ConversationParticipantSchema = BaseRecordSchema.extend({
    conversation_id: z.string().uuid(),
    user_id: UUIDSchema,
    joined_at: z.string().datetime(),
    left_at: z.string().datetime().optional(),
    is_active: z.boolean().default(true),
    unread_count: z.number().int().min(0).default(0),
});
// Message
export const MessageSchema = BaseRecordSchema.extend({
    conversation_id: z.string().uuid(),
    sender_id: UUIDSchema,
    content: z.string().min(1).max(5000),
    message_type: z.enum(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']).default('TEXT'),
    file_url: z.string().url().optional(),
    file_name: z.string().optional(),
    file_size: z.number().int().positive().optional(),
    is_read: z.boolean().default(false),
    read_at: z.string().datetime().optional(),
    reply_to_id: z.string().uuid().optional(),
    translation: TranslationSchema.optional(),
});
// Message creation
export const CreateMessageSchema = MessageSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    is_read: true,
    read_at: true,
});
// Message update
export const UpdateMessageSchema = MessageSchema.partial().omit({
    id: true,
    conversation_id: true,
    sender_id: true,
    created_at: true,
    updated_at: true,
});
// Conversation with participants and last message
export const ConversationWithDetailsSchema = ConversationSchema.extend({
    participants: z.array(z.object({
        id: UUIDSchema,
        user_id: UUIDSchema,
        user: z.object({
            id: UUIDSchema,
            email: z.string().email(),
            country_of_origin: z.string(),
            city: z.string(),
            verified_expat: z.boolean(),
        }),
        unread_count: z.number().int().min(0),
        is_active: z.boolean(),
    })),
    last_message: MessageSchema.optional(),
    listing: z.object({
        id: z.string().uuid(),
        title: z.string(),
        price_rub: z.number().int().min(0),
        photo_urls: z.array(z.string().url()),
    }).optional(),
    vendor_product: z.object({
        id: z.string().uuid(),
        name: z.string(),
        price_rub: z.number().int().min(0),
        photo_urls: z.array(z.string().url()),
    }).optional(),
    service: z.object({
        id: z.string().uuid(),
        title: z.string(),
        price_rub: z.number().int().min(0),
    }).optional(),
});
// Message with sender
export const MessageWithSenderSchema = MessageSchema.extend({
    sender: z.object({
        id: UUIDSchema,
        email: z.string().email(),
        country_of_origin: z.string(),
        city: z.string(),
        verified_expat: z.boolean(),
    }),
});
//# sourceMappingURL=conversations.js.map