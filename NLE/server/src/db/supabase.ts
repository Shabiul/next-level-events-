import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "dotenv/config";

let cachedClient: SupabaseClient | null = null;
let cachedKey: string | null = null;

const DEFAULT_SUPABASE_URL = "https://igpngrpdvwzryavczwhw.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_V3yK30376tK26ibPkkQCxw_EYHALMM2";

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim() || DEFAULT_SUPABASE_ANON_KEY;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === "production") {
    console.warn("⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY is not set in production. Database operations may be restricted by RLS.");
  }
  const currentKey = `${url}:${key}`;

  if (cachedClient && cachedKey === currentKey) {
    return cachedClient;
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  cachedKey = currentKey;
  return cachedClient;
}

// Proxy wrapper so existing calls to `supabase.from(...)` automatically use the current client
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const client = getSupabase();
    const value = client[prop];
    return typeof value === "function" ? (value as any).bind(client) : value;
  },
});

export default supabase;
