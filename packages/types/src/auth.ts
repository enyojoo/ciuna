import { z } from 'zod';
import { BaseRecordSchema, EmailSchema, UUIDSchema } from './common';

// Auth user (extends Supabase auth.users)
export const AuthUserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  email_confirmed_at: z.string().datetime().nullable(),
  phone: z.string().nullable(),
  phone_confirmed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_sign_in_at: z.string().datetime().nullable(),
  app_metadata: z.record(z.any()).default({}),
  user_metadata: z.record(z.any()).default({}),
  aud: z.string().default('authenticated'),
  confirmation_sent_at: z.string().datetime().nullable(),
  recovery_sent_at: z.string().datetime().nullable(),
  email_change_sent_at: z.string().datetime().nullable(),
  new_email: z.string().email().nullable(),
  new_phone: z.string().nullable(),
  invited_at: z.string().datetime().nullable(),
  action_link: z.string().nullable(),
  email_change: z.string().nullable(),
  phone_change: z.string().nullable(),
  reauthentication_sent_at: z.string().datetime().nullable(),
  reauthentication_token: z.string().nullable(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
