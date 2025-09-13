import { z } from 'zod';
export declare const ProfileSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    email: z.ZodString;
    role: z.ZodEnum<["USER", "VENDOR", "COURIER", "ADMIN"]>;
    country_of_origin: z.ZodString;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    verified_expat: z.ZodDefault<z.ZodBoolean>;
    verification_status: z.ZodDefault<z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>>;
    documents: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    avatar_url: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    languages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    city: string;
    email: string;
    country_of_origin: string;
    verified_expat: boolean;
    role: "USER" | "VENDOR" | "COURIER" | "ADMIN";
    verification_status: "PENDING" | "APPROVED" | "REJECTED";
    languages: string[];
    preferences: Record<string, any>;
    district?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    city: string;
    email: string;
    country_of_origin: string;
    role: "USER" | "VENDOR" | "COURIER" | "ADMIN";
    district?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    verified_expat?: boolean | undefined;
    verification_status?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
    languages?: string[] | undefined;
    preferences?: Record<string, any> | undefined;
}>;
export declare const CreateProfileSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    email: z.ZodString;
    role: z.ZodEnum<["USER", "VENDOR", "COURIER", "ADMIN"]>;
    country_of_origin: z.ZodString;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    verified_expat: z.ZodDefault<z.ZodBoolean>;
    verification_status: z.ZodDefault<z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>>;
    documents: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    avatar_url: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    languages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "id" | "created_at" | "updated_at">, "strip", z.ZodTypeAny, {
    city: string;
    email: string;
    country_of_origin: string;
    verified_expat: boolean;
    role: "USER" | "VENDOR" | "COURIER" | "ADMIN";
    verification_status: "PENDING" | "APPROVED" | "REJECTED";
    languages: string[];
    preferences: Record<string, any>;
    district?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
}, {
    city: string;
    email: string;
    country_of_origin: string;
    role: "USER" | "VENDOR" | "COURIER" | "ADMIN";
    district?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    verified_expat?: boolean | undefined;
    verification_status?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
    languages?: string[] | undefined;
    preferences?: Record<string, any> | undefined;
}>;
export declare const UpdateProfileSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["USER", "VENDOR", "COURIER", "ADMIN"]>>;
    country_of_origin: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    verified_expat: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    verification_status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>>>;
    documents: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    avatar_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    languages: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    preferences: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "id" | "created_at" | "updated_at">, "strip", z.ZodTypeAny, {
    city?: string | undefined;
    district?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    country_of_origin?: string | undefined;
    verified_expat?: boolean | undefined;
    role?: "USER" | "VENDOR" | "COURIER" | "ADMIN" | undefined;
    verification_status?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
    languages?: string[] | undefined;
    preferences?: Record<string, any> | undefined;
}, {
    city?: string | undefined;
    district?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    country_of_origin?: string | undefined;
    verified_expat?: boolean | undefined;
    role?: "USER" | "VENDOR" | "COURIER" | "ADMIN" | undefined;
    verification_status?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
    languages?: string[] | undefined;
    preferences?: Record<string, any> | undefined;
}>;
export declare const ProfileWithAuthSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    email: z.ZodString;
    role: z.ZodEnum<["USER", "VENDOR", "COURIER", "ADMIN"]>;
    country_of_origin: z.ZodString;
    city: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    verified_expat: z.ZodDefault<z.ZodBoolean>;
    verification_status: z.ZodDefault<z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>>;
    documents: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    avatar_url: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    languages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
} & {
    auth_user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        created_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        created_at: string;
        email: string;
    }, {
        id: string;
        created_at: string;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    city: string;
    email: string;
    country_of_origin: string;
    verified_expat: boolean;
    role: "USER" | "VENDOR" | "COURIER" | "ADMIN";
    verification_status: "PENDING" | "APPROVED" | "REJECTED";
    languages: string[];
    preferences: Record<string, any>;
    auth_user: {
        id: string;
        created_at: string;
        email: string;
    };
    district?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    city: string;
    email: string;
    country_of_origin: string;
    role: "USER" | "VENDOR" | "COURIER" | "ADMIN";
    auth_user: {
        id: string;
        created_at: string;
        email: string;
    };
    district?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    verified_expat?: boolean | undefined;
    verification_status?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
    documents?: Record<string, any> | undefined;
    avatar_url?: string | undefined;
    languages?: string[] | undefined;
    preferences?: Record<string, any> | undefined;
}>;
export type Profile = z.infer<typeof ProfileSchema>;
export type CreateProfile = z.infer<typeof CreateProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ProfileWithAuth = z.infer<typeof ProfileWithAuthSchema>;
//# sourceMappingURL=profiles.d.ts.map