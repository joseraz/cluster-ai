import { createClient } from '@supabase/supabase-js';

export function isSupabaseDbEnabled() {
  return (
    process.env.SUPABASE_DB_ENABLED === 'true' ||
    (process.env.VERCEL === '1' && Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL))
  );
}

export function supabaseForToken(accessToken: string) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY are required');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
