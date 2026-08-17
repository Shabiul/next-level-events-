import mongoose from "mongoose";
import dns from "dns";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedDatabaseIfEmpty } from "./seedData";
import { initializeAI } from "../ai";

let mongoServer: MongoMemoryServer | null = null;

// Ensure Node can resolve MongoDB Atlas SRV records on Windows networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore if unable to override DNS servers
}

export async function connectDatabase(): Promise<void> {
  const configuredUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/thedecorparty";

  try {
    console.log(`🔌 Connecting to MongoDB: ${configuredUri}`);
    await mongoose.connect(configuredUri, {
      serverSelectionTimeoutMS: 5000,
    } as mongoose.ConnectOptions);

    console.log("✅ MongoDB Connected (External / Local Database)");
    await seedDatabaseIfEmpty();
    await initializeAI();
    return;
  } catch (primaryErr: any) {
    console.warn(`⚠️ Could not connect to configured MongoDB (${primaryErr?.message || primaryErr}).`);
    console.log("🔄 Starting Embedded In-Memory MongoDB (one-time setup, downloading binary)...");

    try {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: "thedecorparty",
        },
      });

      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);

      console.log(`✅ Connected to Embedded In-Memory MongoDB: ${memoryUri}`);
      await seedDatabaseIfEmpty();
      await initializeAI();
    } catch (memErr: any) {
      console.error("❌ Failed to start Embedded MongoDB:", memErr?.message || memErr);
      console.log("👉 Tip: If you have a MongoDB Atlas connection string, add MONGODB_URI=your_atlas_url to NLE-backend/.env");
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
