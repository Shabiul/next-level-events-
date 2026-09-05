import { supabase } from "./supabase";
import { initializeAI } from "../ai";

export async function connectDatabase(): Promise<void> {
  const isProd = process.env.NODE_ENV === "production";
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (isProd && (!url || !key)) {
    throw new Error(
      "FATAL: In production, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined. " +
      "Refusing to start with missing or fallback database credentials."
    );
  }

  if (!url || !key || url.includes("placeholder")) {
    console.warn(
      "\n⚠️  SUPABASE CREDENTIALS NOT CONFIGURED:\n" +
      "   Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to NLE/.env\n" +
      "   Then run 'npm run migrate:supabase' to migrate your database.\n"
    );
    return;
  }

  console.log("🔌 Checking Supabase connection...");

  try {
    const [catRes, prodRes, userRes] = await Promise.all([
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
    ]);

    if (catRes.error) {
      if (isProd && !process.env.VERCEL) {
        throw new Error(`Production database connection failed: ${catRes.error.message}`);
      }
      console.warn("⚠️ Supabase connected but tables not initialized:", catRes.error.message);
      console.warn("👉 Run NLE/server/src/db/schema.sql in Supabase SQL editor, then run: npm run migrate:supabase");
    } else {
      console.log(
        `✅ Supabase Connected Successfully!\n` +
        `   - Categories in DB: ${catRes.count ?? 0}\n` +
        `   - Products in DB:   ${prodRes.count ?? 0}\n` +
        `   - Users in DB:      ${userRes.count ?? 0}`
      );
    }
  } catch (err: any) {
    if (isProd && !process.env.VERCEL) {
      throw err;
    }
    console.warn("⚠️ Supabase test returned error:", err?.message || err);
  }

  // Initialize AI knowledge index & memory caches
  await initializeAI();
}

export async function disconnectDatabase(): Promise<void> {
  // Supabase client manages stateless HTTP connections; no persistent open socket to close
}
