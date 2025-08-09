import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create a mock Supabase client for development
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
    insert: () => Promise.resolve({ data: null, error: null }),
  }),
});

// Initialize supabase client
let supabase: any;
let supabaseAdmin: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock client for development.');
  supabase = createMockClient();
  supabaseAdmin = createMockClient();
} else {
  // Log the URL (but not the key for security)
  console.log('Connecting to Supabase URL:', supabaseUrl);
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  
  // Create admin client with service role key for development operations
  if (supabaseServiceKey) {
    supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } else {
    supabaseAdmin = supabase; // Fallback to regular client
  }
}

export { supabase, supabaseAdmin };