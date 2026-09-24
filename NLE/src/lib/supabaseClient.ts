import { createClient } from '@supabase/supabase-js';

// Anon key is meant to be public -- RLS on every table restricts what it
// can actually read/write. Used client-side only for Realtime subscriptions
// (live catalog sync); all real data fetches/writes still go through the
// Express API.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;
