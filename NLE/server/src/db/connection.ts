import { supabase } from "./supabase";
import { initializeAI } from "../ai";

export async function connectDatabase(): Promise<void> {
  console.log("🔌 Checking Supabase connection...");

  try {
    const [catRes, prodRes, userRes] = await Promise.all([
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
    ]);

    if (catRes.error) {
      console.warn("⚠️ Supabase connected but tables returned notice:", catRes.error.message);
    } else {
      console.log(
        `✅ Supabase Connected Successfully!\n` +
        `   - Categories in DB: ${catRes.count ?? 0}\n` +
        `   - Products in DB:   ${prodRes.count ?? 0}\n` +
        `   - Users in DB:      ${userRes.count ?? 0}`
      );
    }
  } catch (err: any) {
    console.warn("⚠️ Supabase connection test returned error:", err?.message || err);
  }

  // Initialize AI knowledge index & memory caches safely
  await initializeAI();
}

export async function disconnectDatabase(): Promise<void> {
  // Supabase client manages stateless HTTP connections; no persistent open socket to close
}
