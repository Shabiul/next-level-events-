import "dotenv/config";
import bcrypt from "bcryptjs";
import { supabase } from "../db/supabase";
import { UserRepository } from "../db/repositories";

async function createAdminUser() {
  const email = "tdp@admin.com".toLowerCase().trim();
  const rawPassword = "admin@123";

  console.log("==================================================================");
  console.log(`   🛠️ Creating Admin Account: ${email}`);
  console.log("==================================================================\n");

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 1. Check if user exists in custom users table
  const existingUser = await UserRepository.findByEmail(email);

  if (existingUser) {
    console.log("ℹ️ User already exists in database. Updating password and role to admin...");
    await UserRepository.update(existingUser.id, {
      password_hash: hashedPassword,
      role: "admin",
      first_name: "TDP",
      last_name: "Admin",
    });
    console.log("✅ Updated database record in public.users to admin.");
  } else {
    console.log("➕ Creating new admin in public.users table...");
    await UserRepository.create({
      email,
      password_hash: hashedPassword,
      first_name: "TDP",
      last_name: "Admin",
      role: "admin",
      permissions: ["products", "categories", "orders", "addons", "activities", "sliders", "users", "settings", "terms"],
    });
    console.log("✅ Created database record in public.users.");
  }

  // 2. Also create/update user in Supabase Auth (auth.users) so Supabase Auth works
  try {
    const { data: authList } = await supabase.auth.admin.listUsers();
    const existingAuthUser = authList?.users?.find((u: any) => u.email?.toLowerCase() === email);

    if (existingAuthUser) {
      console.log("ℹ️ User exists in Supabase Auth. Updating password...");
      await supabase.auth.admin.updateUserById(existingAuthUser.id, {
        password: rawPassword,
        email_confirm: true,
        user_metadata: { role: "admin", first_name: "TDP", last_name: "Admin" },
      });
      console.log("✅ Supabase Auth user updated.");
    } else {
      console.log("➕ Creating user in Supabase Auth...");
      const { error: createAuthErr } = await supabase.auth.admin.createUser({
        email,
        password: rawPassword,
        email_confirm: true,
        user_metadata: { role: "admin", first_name: "TDP", last_name: "Admin" },
      });
      if (createAuthErr) {
        console.warn("⚠️ Supabase Auth createUser note:", createAuthErr.message);
      } else {
        console.log("✅ Supabase Auth user created successfully.");
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Supabase Auth API note:", err?.message || err);
  }

  console.log("\n==================================================================");
  console.log("🎉 Admin user created successfully!");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${rawPassword}`);
  console.log("   Role:     admin (Full Access)");
  console.log("==================================================================\n");
}

createAdminUser().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
