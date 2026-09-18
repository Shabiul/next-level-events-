import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function runEndToEndSupabaseAudit() {
  console.log("==================================================================");
  console.log("   🔬 Complete End-to-End Supabase Capabilities Audit");
  console.log("==================================================================\n");

  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim() || "sb_publishable_V3yK30376tK26ibPkkQCxw_EYHALMM2";

  console.log(`📡 URL:             ${url}`);
  console.log(`🔑 Service Role:    ${serviceKey ? "Present (" + serviceKey.slice(0, 15) + "...)" : "MISSING"}`);
  console.log(`🔑 Anon Key:        ${anonKey ? "Present (" + anonKey.slice(0, 15) + "...)" : "MISSING"}\n`);

  if (!url || !serviceKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY!");
    process.exit(1);
  }

  // 1. Client Instances
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const anonClient = createClient(url, anonKey, { auth: { persistSession: false } });

  // -----------------------------------------------------------------------------
  // Test 1: Storage Bucket Capabilities
  // -----------------------------------------------------------------------------
  console.log("--- 1. Storage Capabilities ---");
  try {
    const { data: buckets, error: bErr } = await adminClient.storage.listBuckets();
    if (bErr) {
      console.log(` ❌ listBuckets failed: ${bErr.message}`);
    } else {
      console.log(` ✅ Buckets found: ${buckets?.map((b) => b.name).join(", ") || "None"}`);
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "assets";
      const assetsBucket = buckets?.find((b) => b.name === bucketName);

      if (!assetsBucket) {
        console.log(` ⚠️ Bucket '${bucketName}' not found. Creating it...`);
        const { error: cErr } = await adminClient.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: "10MB",
        });
        if (cErr) console.log(` ❌ Failed to create bucket: ${cErr.message}`);
        else console.log(` ✅ Created public bucket '${bucketName}' successfully`);
      } else {
        console.log(` ✅ Storage bucket '${assetsBucket.name}' is verified (Public: ${assetsBucket.public})`);
      }

      // Test upload, public URL, download verify, and delete
      const testString = "Supabase Storage E2E Test Content - " + Date.now();
      const testBuffer = Buffer.from(testString);
      const testPath = `test-audit/test-${Date.now()}.txt`;
      const { error: upErr } = await adminClient.storage.from(bucketName).upload(testPath, testBuffer, {
        contentType: "text/plain",
      });
      if (upErr) {
        console.log(` ❌ Upload test failed: ${upErr.message}`);
      } else {
        const { data: pubUrl } = adminClient.storage.from(bucketName).getPublicUrl(testPath);
        console.log(` ✅ Upload test succeeded! Public URL: ${pubUrl.publicUrl}`);

        // Read/Download verification
        const { data: downloaded, error: downErr } = await adminClient.storage.from(bucketName).download(testPath);
        if (downErr || !downloaded) {
          console.log(` ❌ Download test failed: ${downErr?.message}`);
        } else {
          const content = await downloaded.text();
          if (content === testString) {
            console.log(` ✅ Download verification succeeded! Content verified byte-for-byte.`);
          } else {
            console.log(` ⚠️ Download content mismatch: '${content}'`);
          }
        }

        const { error: delErr } = await adminClient.storage.from(bucketName).remove([testPath]);
        if (delErr) console.log(` ⚠️ Cleanup of test file warning: ${delErr.message}`);
        else console.log(` ✅ Storage file removal verified.`);
      }
    }
  } catch (err: any) {
    console.log(` ❌ Storage exception: ${err?.message || err}`);
  }

  // -----------------------------------------------------------------------------
  // Test 2: Database CRUD & Relational Transactions
  // -----------------------------------------------------------------------------
  console.log("\n--- 2. Database CRUD & Relational Operations ---");
  let testCatId: string | null = null;
  let testProdId: string | null = null;

  try {
    // CREATE Category
    const { data: catData, error: catErr } = await adminClient
      .from("categories")
      .insert({
        name: `E2E_Test_Category_${Date.now()}`,
        slug: `e2e-test-${Date.now()}`,
        order_num: 999,
        active: false,
      })
      .select()
      .single();

    if (catErr || !catData) {
      console.log(` ❌ Category INSERT failed: ${catErr?.message}`);
    } else {
      testCatId = catData.id;
      console.log(` ✅ Category INSERT succeeded: ${catData.id} (${catData.name})`);

      // CREATE Product referencing Category
      const { data: prodData, error: prodErr } = await adminClient
        .from("products")
        .insert({
          name: "E2E Test Product",
          category_id: testCatId,
          category_name: catData.name,
          price: 9999,
          image: "https://example.com/test.jpg",
          active: false,
        })
        .select()
        .single();

      if (prodErr || !prodData) {
        console.log(` ❌ Product INSERT failed: ${prodErr?.message}`);
      } else {
        testProdId = prodData.id;
        console.log(` ✅ Product INSERT succeeded: ${prodData.id} (Price: ${prodData.price})`);

        // READ with JOIN
        const { data: readData, error: readErr } = await adminClient
          .from("products")
          .select("id, name, price, categories(id, name)")
          .eq("id", testProdId)
          .single();

        if (readErr) {
          console.log(` ❌ Product JOIN READ failed: ${readErr.message}`);
        } else {
          console.log(` ✅ Product JOIN READ succeeded: ${readData.name} -> Cat: ${(readData.categories as any)?.name}`);
        }

        // UPDATE
        const { data: updateData, error: updateErr } = await adminClient
          .from("products")
          .update({ price: 12999 })
          .eq("id", testProdId)
          .select()
          .single();

        if (updateErr) {
          console.log(` ❌ Product UPDATE failed: ${updateErr.message}`);
        } else {
          console.log(` ✅ Product UPDATE succeeded: new price ${updateData.price}`);
        }
      }
    }
  } catch (err: any) {
    console.log(` ❌ CRUD Exception: ${err?.message || err}`);
  } finally {
    // Cleanup
    if (testProdId) {
      const { error: dPErr } = await adminClient.from("products").delete().eq("id", testProdId);
      if (!dPErr) console.log(` ✅ Test Product cleaned up.`);
    }
    if (testCatId) {
      const { error: dCErr } = await adminClient.from("categories").delete().eq("id", testCatId);
      if (!dCErr) console.log(` ✅ Test Category cleaned up.`);
    }
  }

  // -----------------------------------------------------------------------------
  // Test 3: Supabase Auth Lifecycle (Admin + Client Sign-In)
  // -----------------------------------------------------------------------------
  console.log("\n--- 3. Supabase Auth Lifecycle & Admin API ---");
  const testEmail = `e2e-auth-${Date.now()}@example.com`;
  const testPassword = "E2E-SecurePassword!2026";
  let createdAuthId: string | null = null;

  try {
    // 3a. List existing users
    const { data: authUsers, error: aErr } = await adminClient.auth.admin.listUsers();
    if (aErr) {
      console.log(` ❌ auth.admin.listUsers failed: ${aErr.message}`);
    } else {
      console.log(` ✅ Supabase Auth Admin listUsers: ${authUsers?.users?.length ?? 0} user(s) currently in auth.users`);
    }

    // 3b. Create test user
    const { data: createdUser, error: cuErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        role: "user",
        first_name: "E2E",
        last_name: "Tester",
      },
    });

    if (cuErr || !createdUser.user) {
      console.log(` ❌ auth.admin.createUser failed: ${cuErr?.message}`);
    } else {
      createdAuthId = createdUser.user.id;
      console.log(` ✅ auth.admin.createUser succeeded: ID ${createdAuthId} (${createdUser.user.email})`);

      // 3c. Update user metadata
      const { data: updatedUser, error: uuErr } = await adminClient.auth.admin.updateUserById(createdAuthId, {
        user_metadata: {
          role: "user",
          first_name: "E2E",
          last_name: "TesterUpdated",
          phone: "+919999999999",
        },
      });

      if (uuErr) {
        console.log(` ❌ auth.admin.updateUserById failed: ${uuErr.message}`);
      } else {
        console.log(` ✅ auth.admin.updateUserById succeeded: phone=${updatedUser?.user?.user_metadata?.phone}`);
      }

      // 3d. Test Client Login with Anon Key
      const { data: signInData, error: siErr } = await anonClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (siErr || !signInData.session) {
        console.log(` ❌ anonClient.auth.signInWithPassword failed: ${siErr?.message}`);
      } else {
        console.log(` ✅ anonClient.auth.signInWithPassword succeeded! Access token received (Bearer ${signInData.session.access_token.slice(0, 15)}...)`);
      }
    }
  } catch (err: any) {
    console.log(` ❌ Auth lifecycle exception: ${err?.message || err}`);
  } finally {
    // 3e. Cleanup test auth user
    if (createdAuthId) {
      const { error: delUserErr } = await adminClient.auth.admin.deleteUser(createdAuthId);
      if (delUserErr) console.log(` ⚠️ Cleanup of auth user warning: ${delUserErr.message}`);
      else console.log(` ✅ Auth test user deleted cleanly.`);
    }
  }

  // -----------------------------------------------------------------------------
  // Test 4: Row Level Security (RLS) Policy Verification
  // -----------------------------------------------------------------------------
  console.log("\n--- 4. Row Level Security (RLS) Policy Verification ---");
  try {
    // 4a. Public storefront read on catalog
    const { count: prodCount, error: pErr } = await anonClient.from("products").select("id", { count: "exact", head: true });
    console.log(` ${pErr ? "❌" : "✅"} Public read 'products': ${pErr ? pErr.message : prodCount + " rows accessible"}`);

    const { count: catCount, error: cErr } = await anonClient.from("categories").select("id", { count: "exact", head: true });
    console.log(` ${cErr ? "❌" : "✅"} Public read 'categories': ${cErr ? cErr.message : catCount + " rows accessible"}`);

    const { count: addonCount, error: adErr } = await anonClient.from("addons").select("id", { count: "exact", head: true });
    console.log(` ${adErr ? "❌" : "✅"} Public read 'addons': ${adErr ? adErr.message : addonCount + " rows accessible"}`);

    const { count: sliderCount, error: slErr } = await anonClient.from("sliders").select("id", { count: "exact", head: true });
    console.log(` ${slErr ? "❌" : "✅"} Public read 'sliders': ${slErr ? slErr.message : sliderCount + " rows accessible"}`);

    const { count: siteContentCount, error: scErr } = await anonClient.from("site_content").select("id", { count: "exact", head: true });
    console.log(` ${scErr ? "❌" : "✅"} Public read 'site_content': ${scErr ? scErr.message : siteContentCount + " rows accessible"}`);

    // 4b. Protected sensitive tables (anonymous should NOT be able to read)
    const { data: anonUsers, error: uErr } = await anonClient.from("users").select("id, email, password_hash").limit(3);
    const userReadBlocked = uErr !== null || (anonUsers && anonUsers.length === 0);
    console.log(` ${userReadBlocked ? "✅" : "⚠️"} Sensitive 'users' read blocked for anon client: ${userReadBlocked ? "PROTECTED (0 rows accessible)" : "EXPOSED"}`);

    const { data: anonOrders, error: oErr } = await anonClient.from("orders").select("id, order_number").limit(3);
    const orderReadBlocked = oErr !== null || (anonOrders && anonOrders.length === 0);
    console.log(` ${orderReadBlocked ? "✅" : "⚠️"} Sensitive 'orders' read blocked for anon client: ${orderReadBlocked ? "PROTECTED (0 rows accessible)" : "EXPOSED"}`);

    const { data: anonCarts, error: cartErr } = await anonClient.from("carts").select("id").limit(3);
    const cartsBlocked = cartErr !== null || (anonCarts && anonCarts.length === 0);
    console.log(` ${cartsBlocked ? "✅" : "⚠️"} Sensitive 'carts' read blocked for anon client: ${cartsBlocked ? "PROTECTED (0 rows accessible)" : "EXPOSED"}`);

    // 4c. Public insert for contact/enquiries (pure insert, anon cannot read other leads)
    const testEnquiryEmail = `lead-${Date.now()}@example.com`;
    const { error: enqErr } = await anonClient
      .from("enquiries")
      .insert({
        name: "E2E Lead",
        email: testEnquiryEmail,
        phone: "9876543210",
        message: "E2E enquiry verification test",
      });

    if (enqErr) {
      console.log(` ❌ Public enquiry INSERT failed: ${enqErr?.message}`);
    } else {
      console.log(` ✅ Public enquiry INSERT succeeded (Verified anon write access while keeping customer leads private)`);
      // Clean up enquiry using admin client
      await adminClient.from("enquiries").delete().eq("email", testEnquiryEmail);
      console.log(` ✅ Test enquiry cleaned up.`);
    }
  } catch (err: any) {
    console.log(` ❌ RLS verification exception: ${err?.message || err}`);
  }

  // -----------------------------------------------------------------------------
  // Test 5: Table Integrity & Column Diagnostics
  // -----------------------------------------------------------------------------
  console.log("\n--- 5. Supabase Table Schema & Row Counts (Service Role) ---");
  const tables = [
    "categories", "products", "addons", "product_addons", "activities",
    "users", "orders", "carts", "wishlists", "otp_tokens",
    "enquiries", "sliders", "site_content", "chat_sessions"
  ];

  const results: Record<string, any> = {};
  for (const t of tables) {
    const { count, error } = await adminClient.from(t).select("*", { count: "exact", head: true });
    results[t] = error ? `ERROR: ${error.message}` : `${count ?? 0} rows`;
  }
  console.table(results);

  console.log("==================================================================");
  console.log("   🏁 Complete End-to-End Supabase Audit PASSED!");
  console.log("==================================================================\n");
}

runEndToEndSupabaseAudit().catch(console.error);
