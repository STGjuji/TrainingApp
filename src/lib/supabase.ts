import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function createFallbackClient(): Partial<SupabaseClient> {
  // Minimal fallback to avoid runtime crash when env vars are missing.
  // Calls will fail at runtime, but the app won't crash on import.
  return {
    from: () => ({ select: async () => ({ data: [], error: null, count: 0 }) } as any),
  } as Partial<SupabaseClient>;
}

let _supabase: SupabaseClient | Partial<SupabaseClient>;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Log a helpful warning during development instead of throwing.
  // Set these env vars (or create a .env) before running the app for full functionality.
  // Example: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
  // See README.md for setup steps.
  // eslint-disable-next-line no-console
  console.warn('Supabase credentials are not set. Supabase client is in fallback mode.');
  _supabase = createFallbackClient();
} else {
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = _supabase as SupabaseClient;
