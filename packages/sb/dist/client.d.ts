import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';
export { createClient };
export declare const supabase: SupabaseClient<Database>;
export declare const supabaseAdmin: SupabaseClient<Database>;
export declare const config: {
    readonly url: string;
    readonly anonKey: string;
    readonly serviceKey: string;
};
//# sourceMappingURL=client.d.ts.map