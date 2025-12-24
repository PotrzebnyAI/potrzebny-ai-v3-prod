import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Client-side Supabase client (uses anon key with RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Server-side Supabase client (uses service role key, bypasses RLS)
export function createServerSupabaseClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// Database query helper with error handling
export async function dbQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>
): Promise<T> {
  const { data, error } = await queryFn();

  if (error) {
    throw new DatabaseError(error.message);
  }

  if (data === null) {
    throw new DatabaseError('No data returned from query');
  }

  return data;
}

// Custom database error class
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Transaction helper
export async function withTransaction<T>(
  fn: (client: ReturnType<typeof createServerSupabaseClient>) => Promise<T>
): Promise<T> {
  const client = createServerSupabaseClient();

  try {
    await client.rpc('begin_transaction');
    const result = await fn(client);
    await client.rpc('commit_transaction');
    return result;
  } catch (error) {
    await client.rpc('rollback_transaction');
    throw error;
  }
}

// Type-safe table names
export const TABLES = {
  USERS: 'users',
  PROFILES: 'profiles',
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENT_METHODS: 'payment_methods',
  THERAPY_NOTES: 'therapy_notes',
  EDUCATIONAL_CONTENT: 'educational_content',
  USER_CONTENT_PROGRESS: 'user_content_progress',
  GAMIFICATION_DATA: 'gamification_data',
  AUDIT_LOGS: 'audit_logs',
  API_KEYS: 'api_keys',
  NOTIFICATIONS: 'notifications',
  EMAIL_TEMPLATES: 'email_templates',
  PASSWORD_RESET_TOKENS: 'password_reset_tokens',
  EMAIL_VERIFICATION_TOKENS: 'email_verification_tokens',
  SESSIONS: 'sessions',
  TRANSACTIONS: 'transactions',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
