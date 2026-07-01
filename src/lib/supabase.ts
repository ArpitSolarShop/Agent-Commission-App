import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side client (uses SUPABASE_KEY — set to service_role key in production)
export const getServerSupabase = () => {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_KEY || '';
    return createClient(url, key);
};
