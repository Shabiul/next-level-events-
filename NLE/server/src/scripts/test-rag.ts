import { vectorStoreService } from "../ai/vectorstore/faiss.store.js";
import { retrieverService } from "../ai/retriever/retriever.service.js";
import { ragService } from "../ai/services/rag.service.js";

async function main() {
  // Load the saved FAISS index
  await vectorStoreService.load("./faiss-index");

  // Initialize the retriever
  retrieverService.initialize();

  // Run RAG
  const result = await ragService.recommend(
    "Recommend premium birthday decoration under 5000"
  );

  console.log(result);
}

main().catch(console.error);