import "dotenv/config";
import fs from "fs";
import path from "path";
import { Client } from "pg";

async function runSchema() {
  console.log("==================================================================");
  console.log("   🛠️ Initializing Supabase PostgreSQL Schema...");
  console.log("==================================================================\n");

  const connectionString =
    process.env.SUPABASE_DB_URL ||
    "postgresql://postgres.igpngrpdvwzryavczwhw:BhjKRQ3cIq3lBlqH@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

  console.log("🔌 Connecting directly to PostgreSQL via connection pooler...");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL database.\n");

    const schemaPath = path.resolve(__dirname, "../db/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");

    console.log("📜 Executing schema.sql...");
    await client.query(sql);
    console.log("✅ All tables, types, constraints, and indexes created successfully!");

    // Reload PostgREST schema cache so Supabase API immediately sees all new tables
    console.log("🔄 Reloading Supabase PostgREST schema cache...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("✅ Schema cache reloaded!\n");

    await client.end();
  } catch (err: any) {
    console.error("❌ Schema initialization failed:", err);
    process.exit(1);
  }
}

runSchema();
