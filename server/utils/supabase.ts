import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/supabase';

const {
  private: {
    SUPABASE_URL,
    SUPABASE_KEY,
  },
} = useRuntimeConfig();

// Validate environment variables
if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_KEY environment variable');
}

// Create Supabase client with proper options for server-side usage
const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: false, // Don't persist session on server-side
      autoRefreshToken: false, // Don't auto-refresh token on server-side
      detectSessionInUrl: false, // Don't detect session in URL on server-side
    },
    db: {
      schema: 'public',
    },
  },
);

export default supabase;