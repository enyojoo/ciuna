import { supabase } from './client';
// Auth utilities
export const auth = {
    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error)
            throw error;
        return user;
    },
    // Get current session
    async getCurrentSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error)
            throw error;
        return session;
    },
    // Sign up with email and password
    async signUp(email, password, metadata) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        if (error)
            throw error;
        return data;
    },
    // Sign in with email and password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            throw error;
        return data;
    },
    // Sign in with OAuth provider
    async signInWithOAuth(provider, options) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: options?.redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'),
            },
        });
        if (error)
            throw error;
        return data;
    },
    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error)
            throw error;
    },
    // Reset password
    async resetPassword(email, options) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: options?.redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : '/auth/reset-password'),
        });
        if (error)
            throw error;
        return data;
    },
    // Update password
    async updatePassword(password) {
        const { data, error } = await supabase.auth.updateUser({
            password,
        });
        if (error)
            throw error;
        return data;
    },
    // Update user metadata
    async updateUser(updates) {
        const { data, error } = await supabase.auth.updateUser(updates);
        if (error)
            throw error;
        return data;
    },
    // Listen to auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },
};
// Profile utilities
export const profiles = {
    // Get current user's profile
    async getCurrentProfile() {
        const user = await auth.getCurrentUser();
        if (!user)
            return null;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (error)
            throw error;
        return data;
    },
    // Get profile by ID
    async getProfile(id) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    },
    // Create profile
    async createProfile(profile) {
        const { data, error } = await supabase
            .from('profiles')
            .insert(profile)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    // Update profile
    async updateProfile(id, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    // Update current user's profile
    async updateCurrentProfile(updates) {
        const user = await auth.getCurrentUser();
        if (!user)
            throw new Error('Not authenticated');
        return this.updateProfile(user.id, updates);
    },
    // Search profiles
    async searchProfiles(query, filters) {
        let queryBuilder = supabase
            .from('profiles')
            .select('*')
            .or(`email.ilike.%${query}%,city.ilike.%${query}%,country_of_origin.ilike.%${query}%`);
        if (filters?.role) {
            queryBuilder = queryBuilder.eq('role', filters.role);
        }
        if (filters?.city) {
            queryBuilder = queryBuilder.eq('city', filters.city);
        }
        if (filters?.verified_expat !== undefined) {
            queryBuilder = queryBuilder.eq('verified_expat', filters.verified_expat);
        }
        const { data, error } = await queryBuilder;
        if (error)
            throw error;
        return data;
    },
};
//# sourceMappingURL=auth.js.map