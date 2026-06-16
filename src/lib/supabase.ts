import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://syplmxpjxfmcukvknxqb.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5cGxteHBqeGZtY3VrdmtueHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NzYxMTAsImV4cCI6MjA5NzE1MjExMH0.yllAgZjxWsGEJa3V0Y7k2UIItFNp4bXc30_fMDMzo70';

type TableKey = 'workouts' | 'meals' | 'weight_entries' | 'garmin_imports';

const fallbackStorage: Record<TableKey, any[]> = {
  workouts: [],
  meals: [],
  weight_entries: [],
  garmin_imports: [],
};

function createFallbackClient(): Partial<SupabaseClient> {
  function safeTable(name: string) {
    return (fallbackStorage as Record<string, any[]>)[name] || [];
  }

  function cloneRow(row: any) {
    return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, ...row };
  }

  function createQuery(tableName: string) {
    const table = safeTable(tableName);
    let selected = '*';

    return {
      select(columns: string) {
        selected = columns;
        return createQuery(tableName);
      },
      order(column: string, options: { ascending: boolean }) {
        const data = [...safeTable(tableName)];
        data.sort((a, b) => {
          const left = a[column];
          const right = b[column];
          if (left == null && right == null) return 0;
          if (left == null) return 1;
          if (right == null) return -1;
          if (left < right) return options.ascending ? -1 : 1;
          if (left > right) return options.ascending ? 1 : -1;
          return 0;
        });
        return Promise.resolve({ data, error: null, count: data.length });
      },
      insert: async (values: any | any[]) => {
        const items = Array.isArray(values) ? values : [values];
        const rows = items.map((item) => {
          const row = cloneRow(item);
          table.push(row);
          return row;
        });
        return { data: rows, error: null };
      },
    } as any;
  }

  return {
    from: (tableName: string) => createQuery(tableName),
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
