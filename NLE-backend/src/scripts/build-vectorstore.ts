import "dotenv/config";
import mongoose from "mongoose";

import { mongoLoader } from "../ai/loaders/mongo.loader";
import { vectorStoreService } from "../ai/vectorstore/faiss.store";

async function main() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect((process.env.MONGO_URI || process.env.MONGODB_URI)!);

    console.log("📚 Loading AI documents...");
    const docs = await mongoLoader.loadKnowledge();

    console.log(`✅ Loaded ${docs.length} documents`);

    console.log("🧠 Creating FAISS vector store...");
    await vectorStoreService.create(docs);

    console.log("💾 Saving vector store...");
    await vectorStoreService.save("./faiss-index");

    console.log("🎉 Vector store created successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

main();