import type { AuthUser, Profile, CreateProfile, UpdateProfile } from '@ciuna/types';
export declare const auth: {
    getCurrentUser(): Promise<AuthUser | null>;
    getCurrentSession(): Promise<import("@supabase/supabase-js").AuthSession | null>;
    signUp(email: string, password: string, metadata?: any): Promise<{
        user: import("@supabase/supabase-js").AuthUser | null;
        session: import("@supabase/supabase-js").AuthSession | null;
    }>;
    signIn(email: string, password: string): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
        session: import("@supabase/supabase-js").AuthSession;
        weakPassword?: import("@supabase/supabase-js").WeakPassword | undefined;
    }>;
    signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'apple', options?: {
        redirectTo?: string;
    }): Promise<{
        provider: import("@supabase/supabase-js").Provider;
        url: string;
    }>;
    signOut(): Promise<void>;
    resetPassword(email: string, options?: {
        redirectTo?: string;
    }): Promise<{}>;
    updatePassword(password: string): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
    }>;
    updateUser(updates: {
        email?: string;
        data?: any;
    }): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
    }>;
    onAuthStateChange(callback: (event: string, session: any) => void): {
        data: {
            subscription: import("@supabase/supabase-js").Subscription;
        };
    };
};
export declare const profiles: {
    getCurrentProfile(): Promise<Profile | null>;
    getProfile(id: string): Promise<Profile | null>;
    createProfile(profile: CreateProfile): Promise<Profile>;
    updateProfile(id: string, updates: UpdateProfile): Promise<Profile>;
    updateCurrentProfile(updates: UpdateProfile): Promise<Profile>;
    searchProfiles(query: string, filters?: {
        role?: string;
        city?: string;
        verified_expat?: boolean;
    }): Promise<{
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
        documents?: Record<string, any> | undefined;
        avatar_url?: string | undefined;
        bio?: string | undefined;
    }[]>;
};
//# sourceMappingURL=auth.d.ts.map