import { z } from 'zod';
import { BaseRecordSchema, UserRoleSchema, VerificationStatusSchema, PhoneSchema, UUIDSchema } from './common';

// Profile extends auth.users
export const ProfileSchema = BaseRecordSchema.extend({
  email: z.string().email(),
  role: UserRoleSchema,
  country_of_origin: z.string(),
  city: z.string(),
  district: z.string().optional(),
  phone: PhoneSchema.optional(),
  verified_expat: z.boolean().default(false),
  verification_status: VerificationStatusSchema.default('PENDING'),
  documents: z.record(z.any()).optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).default([]),
  preferences: z.record(z.any()).default({}),
});

// Profile creation (without id, timestamps)
export const CreateProfileSchema = ProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Profile update (partial)
export const UpdateProfileSchema = ProfileSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Profile with auth user
export const ProfileWithAuthSchema = ProfileSchema.extend({
  auth_user: z.object({
    id: UUIDSchema,
    email: z.string().email(),
    created_at: z.string().datetime(),
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type CreateProfile = z.infer<typeof CreateProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ProfileWithAuth = z.infer<typeof ProfileWithAuthSchema>;
