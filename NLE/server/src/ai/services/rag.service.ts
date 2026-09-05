import { Document } from "@langchain/core/documents";

import { entityExtractorService } from "./entity-extractor.service";
import { businessFilterService } from "./business-filter.service";
import { recommendationService } from "./recommendation.service";
import { retrieverService } from "../retriever/retriever.service";

class RagService {
  async recommend(query: string): Promise<string> {
    console.log("\n========== RAG PIPELINE ==========");
    console.log("Query:", query);

    // Step 1: Extract entities
    const entities = entityExtractorService.extract(query);
    console.log("Entities:", entities);

    // Step 2: Retrieve documents
    const docs: Document[] = await retrieverService.retrieve(query);

    console.log("Retrieved Docs:", docs.length);
    console.log(
      "Retrieved Products:",
      docs.map((doc) => doc.metadata.name)
    );

    // Step 3: Apply business filters
    const filteredDocs = businessFilterService.filter(docs, entities);

    console.log("Filtered Docs:", filteredDocs.length);
    console.log(
      "Filtered Products:",
      filteredDocs.map((doc) => doc.metadata.name)
    );

    // Step 4: Recommendation
    const response = await recommendationService.recommend({
      category: entities.category ?? null,
      budget: entities.budget ?? entities.maxBudget ?? null,
      theme: entities.theme ?? null,
      audience: null,
      guests: null,
      venue: null,
      city: null,
      documents: filteredDocs,
    });

    console.log("========== END RAG ==========\n");

    return response;
  }
}

export const ragService = new RagService();