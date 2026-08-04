import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Single source of truth for the Supabase credentials. Nothing else in the app
// should read import.meta.env directly -- call sites that did drifted out of
// sync when the key was renamed, and silently sent `Bearer undefined`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Supabase renamed "anon" keys to "publishable" keys; accept either name.
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials not found. Please check your environment variables.');
}

// NOTE: never add a service-role client here. Anything read via import.meta.env
// is inlined into the browser bundle, and a service-role key bypasses RLS.
// Privileged operations belong in a Supabase Edge Function.
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export { supabase, supabaseUrl, supabaseAnonKey };
