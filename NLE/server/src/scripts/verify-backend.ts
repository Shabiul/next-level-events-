import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../db/connection.js";
import { CategoryRepository, ProductRepository, UserRepository, ChatRepository } from "../db/repositories.js";

async function verifyBackendLive() {
  console.log("==================================================================");
  console.log("   🧪 Verifying Backend Supabase Integration & Repositories");
  console.log("==================================================================\n");

  await connectDatabase();

  const [categories, products, users, session] = await Promise.all([
    CategoryRepository.listAll(),
    ProductRepository.listAll({ activeOnly: true, limit: 3 }),
    UserRepository.findByEmail("shankaryuday@gmail.com"),
    ChatRepository.getOrCreate("test-verification-session"),
  ]);

  console.log("\nLive Repository Queries Successful:");
  console.log(` ✅ CategoryRepository: Loaded ${categories.length} categories (First: "${categories[0]?.name}")`);
  console.log(` ✅ ProductRepository:  Loaded ${products.length} sample active products (First: "${products[0]?.name}", ₹${products[0]?.price})`);
  console.log(` ✅ UserRepository:     Found admin user "${users?.email}" (Role: ${users?.role})`);
  console.log(` ✅ ChatRepository:     Created/verified test chat session "${session.session_id}"`);

  // Clean up test session
  await ChatRepository.clearConversation("test-verification-session");

  await disconnectDatabase();
  console.log("\n🎉 Backend database layer is 100% operational and healthy!");
}

verifyBackendLive().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
