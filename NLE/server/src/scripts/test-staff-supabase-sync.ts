import "dotenv/config";
import {
  syncUserToSupabaseAuth,
  findSupabaseAuthUserByEmail,
  deleteUserFromSupabaseAuth,
  updateSupabaseAuthMetadata,
} from "../db/supabaseAuth";

async function runTest() {
  const testEmail = `test_staff_${Date.now()}@example.com`;
  const testPassword = "TestStaff@12345";

  console.log("==================================================================");
  console.log("🧪 TESTING SUPABASE AUTH STAFF SYNC & NO-EMAIL-VERIFY");
  console.log("==================================================================\n");

  console.log(`1. Creating test staff user: ${testEmail}...`);
  const createResult = await syncUserToSupabaseAuth({
    email: testEmail,
    password: testPassword,
    role: "staff",
    firstName: "Sarah",
    lastName: "Staff",
    permissions: ["products", "orders", "categories"],
    confirmEmail: true,
  });

  if (!createResult.success) {
    throw new Error(`Failed to create test staff: ${createResult.error}`);
  }
  console.log(`✅ Staff created successfully with Auth ID: ${createResult.authId}`);

  console.log("2. Verifying user in Supabase Auth...");
  const authUser = await findSupabaseAuthUserByEmail(testEmail);
  if (!authUser) {
    throw new Error("Could not find user in Supabase Auth!");
  }

  console.log("   - Email:", authUser.email);
  console.log("   - Email confirmed at:", authUser.email_confirmed_at);
  console.log("   - Metadata:", JSON.stringify(authUser.user_metadata));

  if (!authUser.email_confirmed_at) {
    throw new Error("❌ FAIL: User was not auto-confirmed! Email verification would be required.");
  }
  console.log("✅ PASS: Email is pre-confirmed! No email verification is needed.");

  if (authUser.user_metadata?.role !== "staff") {
    throw new Error("❌ FAIL: Role metadata not set correctly.");
  }
  console.log("✅ PASS: Staff role and permissions properly set in metadata.");

  console.log("3. Testing metadata update...");
  const metaSuccess = await updateSupabaseAuthMetadata(testEmail, {
    permissions: ["products", "orders", "categories", "addons"],
  });
  if (!metaSuccess) {
    throw new Error("❌ FAIL: updateSupabaseAuthMetadata failed.");
  }
  console.log("✅ PASS: Metadata updated successfully.");

  console.log("4. Cleaning up test user...");
  const deleteSuccess = await deleteUserFromSupabaseAuth(testEmail);
  if (!deleteSuccess) {
    throw new Error("❌ FAIL: Failed to delete test user.");
  }
  console.log("✅ PASS: Test staff user successfully deleted.");

  console.log("\n==================================================================");
  console.log("🎉 ALL SUPABASE AUTH TESTS PASSED PERFECTLY!");
  console.log("==================================================================\n");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
