import { parsedEnv } from '@/config/env/validate';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  parsedEnv.NEXT_SUPABASE_URL,
  parsedEnv.NEXT_SUPABASE_SECRET_KEY
);

export { supabase };
