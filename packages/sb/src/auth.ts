import { supabase } from './client';
import type { AuthUser, Profile, CreateProfile, UpdateProfile } from '@ciuna/types';

// Auth utilities
export const auth = {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user as AuthUser | null;
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Sign up with email and password
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign in with OAuth provider
  async signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'apple', options?: { redirectTo?: string }) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options?.redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'),
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Reset password
  async resetPassword(email: string, options?: { redirectTo?: string }) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: options?.redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : '/auth/reset-password'),
    });
    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
    return data;
  },

  // Update user metadata
  async updateUser(updates: { email?: string; data?: any }) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Profile utilities
export const profiles = {
  // Get current user's profile
  async getCurrentProfile(): Promise<Profile | null> {
    const user = await auth.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Get profile by ID
  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Profile | null;
  },

  // Create profile
  async createProfile(profile: CreateProfile): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Update profile
  async updateProfile(id: string, updates: UpdateProfile): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Update current user's profile
  async updateCurrentProfile(updates: UpdateProfile): Promise<Profile> {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    return this.updateProfile(user.id, updates);
  },

  // Search profiles
  async searchProfiles(query: string, filters?: { role?: string; city?: string; verified_expat?: boolean }) {
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
    if (error) throw error;
    return data as Profile[];
  },
};
