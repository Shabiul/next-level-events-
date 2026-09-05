import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function testSupabase() {
  console.log("==================================================================");
  console.log("   ⚡ Supabase Connectivity & Table Verification Tool");
  console.log("==================================================================\n");

  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const activeKey = serviceKey || anonKey;

  console.log(`URL:        ${url ? url : "❌ NOT SET"}`);
  console.log(`Key Type:   ${serviceKey ? "SERVICE_ROLE (Full Admin Access)" : anonKey ? "ANON KEY" : "❌ NOT SET"}`);

  if (!url || !activeKey || url.includes("placeholder")) {
    console.error("\n❌ Credentials missing or placeholder!");
    console.error("👉 Please add the following to NLE/.env:");
    console.error("   SUPABASE_URL=https://<your-project-id>.supabase.co");
    console.error("   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>");
    process.exit(1);
  }

  const supabase = createClient(url, activeKey, {
    auth: { persistSession: false },
  });

  const tables = [
    "categories",
    "products",
    "addons",
    "product_addons",
    "activities",
    "users",
    "orders",
    "carts",
    "wishlists",
    "otp_tokens",
    "enquiries",
    "sliders",
    "site_content",
    "chat_sessions",
  ];

  console.log("\nTesting access to all tables in Supabase:\n");

  let missingTables: string[] = [];
  let successCount = 0;

  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) {
        console.log(` ❌ ${table.padEnd(18)}: FAILED (${error.message})`);
        missingTables.push(table);
      } else {
        console.log(` ✅ ${table.padEnd(18)}: OK (${count ?? 0} rows)`);
        successCount++;
      }
    } catch (err: any) {
      console.log(` ❌ ${table.padEnd(18)}: EXCEPTION (${err?.message || err})`);
      missingTables.push(table);
    }
  }

  console.log("\n------------------------------------------------------------------");
  if (missingTables.length > 0) {
    console.warn(`⚠️  ${missingTables.length} table(s) could not be queried.`);
    console.warn("👉 Make sure you ran NLE/server/src/db/schema.sql in the Supabase SQL Editor!");
  } else {
    console.log(`🎉 All ${successCount} tables verified and reachable in Supabase!`);
    console.log("👉 You can now run migration: npm run migrate:supabase");
  }
  console.log("==================================================================\n");
}

testSupabase().catch((err) => {
  console.error("Fatal error testing Supabase:", err);
  process.exit(1);
});
