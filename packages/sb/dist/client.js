import { createClient } from '@supabase/supabase-js';
// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
// Re-export createClient for use in other modules
export { createClient };
// Create Supabase client for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});
// Create Supabase client for server-side usage (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// Client configuration
export const config = {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey,
};
//# sourceMappingURL=client.js.map