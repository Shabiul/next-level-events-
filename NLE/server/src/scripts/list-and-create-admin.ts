import "dotenv/config";
import bcrypt from "bcryptjs";
import { supabase } from "../db/supabase";
import { UserRepository } from "../db/repositories";

async function main() {
  const args = process.argv.slice(2);
  let email = "";
  let password = "";
  let firstName = "Admin";
  let lastName = "User";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) {
      email = args[i + 1].toLowerCase().trim();
      i++;
    } else if (args[i] === "--password" && args[i + 1]) {
      password = args[i + 1];
      i++;
    } else if (args[i] === "--first" && args[i + 1]) {
      firstName = args[i + 1];
      i++;
    } else if (args[i] === "--last" && args[i + 1]) {
      lastName = args[i + 1];
      i++;
    }
  }

  // 1. List existing admins / users
  console.log("==================================================================");
  console.log("   📋 CURRENT USERS IN DATABASE");
  console.log("==================================================================");
  const { data: users, error: listErr } = await supabase
    .from("users")
    .select("id, email, role, first_name, last_name, created_at")
    .order("created_at", { ascending: false });

  if (listErr) {
    console.warn("Could not list users from public.users:", listErr.message);
  } else if (users) {
    console.table(
      users.map((u) => ({
        ID: u.id.slice(0, 8) + "...",
        Email: u.email,
        Role: u.role,
        Name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      }))
    );
  }

  // If email was provided or default requested
  if (!email) {
    // Default new admin email if not provided
    email = "admin@thedecorparty.com";
    password = password || "Admin@2026!";
  } else {
    password = password || "Admin@2026!";
  }

  console.log("\n==================================================================");
  console.log(`   🛠️ CREATING / UPDATING ADMIN USER: ${email}`);
  console.log("==================================================================");

  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await UserRepository.findByEmail(email);

  if (existingUser) {
    console.log(`ℹ️ User ${email} already exists. Updating role to admin and resetting password...`);
    await UserRepository.update(existingUser.id, {
      password_hash: hashedPassword,
      role: "admin",
      first_name: firstName,
      last_name: lastName,
      permissions: [
        "products",
        "categories",
        "orders",
        "addons",
        "activities",
        "sliders",
        "users",
        "settings",
        "terms",
      ],
    });
    console.log("✅ Updated user record in public.users.");
  } else {
    console.log(`➕ Creating new admin in public.users table...`);
    await UserRepository.create({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role: "admin",
      permissions: [
        "products",
        "categories",
        "orders",
        "addons",
        "activities",
        "sliders",
        "users",
        "settings",
        "terms",
      ],
    });
    console.log("✅ Created user record in public.users.");
  }

  // Also sync with Supabase Auth
  try {
    const { data: authList } = await supabase.auth.admin.listUsers();
    const existingAuthUser = authList?.users?.find((u: any) => u.email?.toLowerCase() === email);

    if (existingAuthUser) {
      console.log("ℹ️ Updating password in Supabase Auth...");
      await supabase.auth.admin.updateUserById(existingAuthUser.id, {
        password: password,
        email_confirm: true,
        user_metadata: { role: "admin", first_name: firstName, last_name: lastName },
      });
      console.log("✅ Supabase Auth user updated.");
    } else {
      console.log("➕ Creating user in Supabase Auth...");
      const { error: createAuthErr } = await supabase.auth.admin.createUser({
        email,
        password: password,
        email_confirm: true,
        user_metadata: { role: "admin", first_name: firstName, last_name: lastName },
      });
      if (createAuthErr) {
        console.warn("⚠️ Supabase Auth createUser note:", createAuthErr.message);
      } else {
        console.log("✅ Supabase Auth user created successfully.");
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Supabase Auth note:", err?.message || err);
  }

  console.log("\n==================================================================");
  console.log("🎉 NEW ADMIN USER READY FOR LOGIN!");
  console.log(`   Portal URL: http://localhost:5173 (CRM) or http://localhost:3000`);
  console.log(`   Email:      ${email}`);
  console.log(`   Password:   ${password}`);
  console.log(`   Role:       admin (Full Permissions)`);
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("Error creating admin user:", err);
  process.exit(1);
});
